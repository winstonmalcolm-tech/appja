const mysql = require("../config/db_config");
const megabyteConversion = require("../utlis/byte_to_megabyte");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");



// Helper to delete file from local storage
const deleteFile = (fileUrl) => {
    if (!fileUrl) return;
    try {
        const urlObj = new URL(fileUrl);
        // pathname will start with slash, e.g. /uploads/...
        const relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        const filePath = path.join(__dirname, '..', relativePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (e) {
        console.log("Error deleting file:", e.message);
    }
}

// Helper to delete folder
const deleteFolder = (folderUrl) => {
    if (!folderUrl) return;
    try {
        const urlObj = new URL(folderUrl);
        let relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;

        relativePath = path.dirname(relativePath);
        const folderPath = path.join(__dirname, '..', relativePath);

        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    } catch (e) {
        console.log("Error deleting folder:", e.message);
    }
}

const chunkUpload = async (req, res, next) => {
    try {
        const { uploadId, chunkIndex } = req.body;
        const chunkFile = req.files['app'] ? req.files['app'][0] : null;

        if (!chunkFile || !uploadId || chunkIndex === undefined) {
            res.status(400);
            throw new Error("Missing chunk data");
        }

        const tempDir = path.join(__dirname, "..", "uploads", "temp", uploadId);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const chunkPath = path.join(tempDir, `chunk-${chunkIndex}`);
        fs.renameSync(chunkFile.path, chunkPath);

        res.status(200).json({ message: `Chunk ${chunkIndex} uploaded` });
    } catch (error) {
        console.log(error);
        next(error.message);
    }
}

const upload = async (req, res, next) => {

    try {
        const { app_name, app_category, app_description, uploadId, totalChunks } = req.body;

        // Files from multer
        let appFile = req.files['app'] ? req.files['app'][0] : null;
        const iconFile = req.files['icon'] ? req.files['icon'][0] : null;
        const imageFiles = req.files['images'] || [];

        if (!app_name || !app_category || !app_description) {
            res.status(400);
            throw new Error("Please enter all fields");
        }

        // Handle chunked app assembly if uploadId is provided
        if (uploadId && totalChunks) {
            const tempDir = path.join(__dirname, "..", "uploads", "temp", uploadId);
            const finalAppPath = path.join(__dirname, "..", "uploads", "temp", `${uploadId}-final.apk`);

            const writeStream = fs.createWriteStream(finalAppPath);

            for (let i = 0; i < totalChunks; i++) {
                const chunkPath = path.join(tempDir, `chunk-${i}`);
                if (!fs.existsSync(chunkPath)) {
                    throw new Error(`Missing chunk ${i}`);
                }
                const chunkBuffer = fs.readFileSync(chunkPath);
                writeStream.write(chunkBuffer);
                fs.unlinkSync(chunkPath); // Delete chunk after writing
            }
            writeStream.end();

            // Wait for stream to finish
            await new Promise((resolve) => writeStream.on('finish', resolve));

            // Create a fake multer file object for the assembled app
            const stats = fs.statSync(finalAppPath);

            // Move final file to proper destination
            const userId = req.id;
            const sanitizedAppName = app_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const timestamp = Date.now();
            const uniqueFolder = `${sanitizedAppName}-${timestamp}`;
            const targetDir = path.join(__dirname, "..", "uploads", userId.toString(), uniqueFolder);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const fileName = `app-${Date.now()}.apk`;
            const finalPath = path.join(targetDir, fileName);
            fs.renameSync(finalAppPath, finalPath);
            fs.rmdirSync(tempDir); // Remove temp folder

            appFile = {
                path: path.relative(path.join(__dirname, ".."), finalPath),
                size: stats.size
            };
        }

        if (!appFile || !iconFile) {
            res.status(400);
            throw new Error("Please upload both app APK and icon");
        }

        const appCountSQL = "SELECT COUNT(developer_id) as appTotal FROM app_tbl WHERE developer_id = ?;";
        let [rows] = await mysql.query(appCountSQL, [req.id]);

        const appCount = rows[0].appTotal;

        const appNameAvailableSQL = "SELECT COUNT(app_name) as namesCount FROM app_tbl WHERE app_name = ?;";
        [rows] = await mysql.query(appNameAvailableSQL, [app_name]);

        const appNamesCount = rows[0].namesCount;

        const getPlanTypeSQL = "SELECT plan FROM developer_tbl WHERE developer_id = ?;";
        [rows] = await mysql.query(getPlanTypeSQL, [req.id]);

        const planType = rows[0].plan;

        if (appNamesCount > 0) {
            res.status(400);
            throw new Error("App name already taken");
        }

        if (planType == "Hobbyist" && appCount == 3) {
            res.status(403);
            throw new Error("You have reached the maximum amount of uploads, remove existing apps or upgrade plan");
        }

        if (planType == "Standard" && appCount == 10) {
            res.status(403);
            throw new Error("You have reached the maximum amount of uploads, remove existing apps to upload more");
        }

        const apk_size = Math.ceil(megabyteConversion(appFile.size));

        if (planType == "Hobbyist" && apk_size > 300) {
            res.status(400);
            throw new Error("App size exceeds what current plan offers");
        }

        if (planType == "Standard" && apk_size > 500) {
            res.status(400);
            throw new Error("App size exceeds what current plan offers");
        }

        // Construct URLs
        const baseUrl = process.env.SERVER_BASE_URL;

        // appFile.path looks like 'uploads\\userid\\filename'. We need to make it url friendly
        const appUrlPath = appFile.path.replace(/\\/g, "/");
        const iconUrlPath = iconFile.path.replace(/\\/g, "/");

        const app_url = `${baseUrl}/${appUrlPath}`;
        const icon_url = `${baseUrl}/${iconUrlPath}`;

        // Generate placeholder IDs for supabase_id columns to satisfy schema
        const supabase_app_id = uuid.v4();

        let sql = "INSERT INTO app_tbl (developer_id, app_name, app_category, app_size, app_url, app_icon_url, app_description, supabase_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";

        const [result] = await mysql.query(sql, [req.id, app_name, app_category, apk_size, app_url, icon_url, app_description, supabase_app_id]);


        sql = "INSERT INTO image_tbl (app_id, image_url, supabase_id) VALUES (?,?,?);";

        // Handle images
        // Limit to 4 images
        const imagesToProcess = imageFiles.slice(0, 4);

        for (let imageFile of imagesToProcess) {
            const imageUrlPath = imageFile.path.replace(/\\/g, "/");
            const imageUrl = `${baseUrl}/${imageUrlPath}`;
            const imageSupabaseId = uuid.v4();

            await mysql.query(sql, [result.insertId, imageUrl, imageSupabaseId]);
        }

        res.status(200).json({ message: "Uploaded successfully" });

    } catch (error) {
        console.log(error);
        next(error.message);
    }
}


const download = async (req, res, next) => {
    try {
        const { appId } = req.params;
        let sql = "";

        // Get App Details & Developer ID (for email later maybe?)
        sql = "SELECT app_url, app_name, number_of_downloads, developer_id FROM app_tbl WHERE app_id = ?";
        let [rows] = await mysql.query(sql, [appId]);

        if (rows.length === 0) {
            res.status(404);
            throw new Error("App not found");
        }

        const app = rows[0];
        const newDownloadCount = app.number_of_downloads + 1;

        // Increment Download Count
        sql = "UPDATE app_tbl SET number_of_downloads = ? WHERE app_id = ?";
        await mysql.query(sql, [newDownloadCount, appId]);

        // Serve File
        if (app.app_url) {
            const urlObj = new URL(app.app_url);
            const relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;

            // DECISION: Decode the path to handle spaces and special chars (e.g. %20 -> space)
            const decodedPath = decodeURIComponent(relativePath);
            const filePath = path.join(__dirname, '..', decodedPath);

            // Clean filename
            const safeFilename = app.app_name.replace(/[^a-z0-9]/gi, '_') + ".apk";

            if (fs.existsSync(filePath)) {
                res.download(filePath, safeFilename);
            } else {
                console.log("File does not exist at:", filePath);
                res.status(404).json({ message: "File not found on server" });
            }
        } else {
            res.status(404).json({ message: "No APK file associated" });
        }

    } catch (error) {
        console.log(error);
        if (!res.headersSent) next(error.message);
    }
}

const updateApp = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { description, deletedImages, appUrl, iconUrl, appSize, uploadId, totalChunks } = req.body;

        console.log("updateApp called for id:", id);

        // Get current app state to access old URLs for deletion
        let currentAppSql = "SELECT app_url, app_icon_url FROM app_tbl WHERE app_id = ?";
        const [currentAppRows] = await mysql.query(currentAppSql, [id]);
        const currentApp = currentAppRows[0];


        // Check for files
        let appFile = req.files && req.files['app'] ? req.files['app'][0] : null;

        // Handle chunked app assembly if uploadId is provided
        if (uploadId && totalChunks) {
            const tempDir = path.join(__dirname, "..", "uploads", "temp", uploadId);
            const finalAppPath = path.join(__dirname, "..", "uploads", "temp", `${uploadId}-final.apk`);

            const writeStream = fs.createWriteStream(finalAppPath);

            for (let i = 0; i < totalChunks; i++) {
                const chunkPath = path.join(tempDir, `chunk-${i}`);
                if (!fs.existsSync(chunkPath)) {
                    throw new Error(`Missing chunk ${i}`);
                }
                const chunkBuffer = fs.readFileSync(chunkPath);
                writeStream.write(chunkBuffer);
                fs.unlinkSync(chunkPath);
            }
            writeStream.end();
            await new Promise((resolve) => writeStream.on('finish', resolve));

            const stats = fs.statSync(finalAppPath);

            // For updates, we reuse the existing folder logic from the middleware if possible, 
            // but since we are manually assembling, we need to find the old folder.
            let targetDir;
            if (currentApp && currentApp.app_url) {
                const urlObj = new URL(currentApp.app_url);
                const relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
                targetDir = path.join(__dirname, "..", path.dirname(relativePath));
            } else {
                // Fallback (should not happen for updates usually)
                targetDir = path.join(__dirname, "..", "uploads", "updates", id);
            }

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const fileName = `app-${Date.now()}.apk`;
            const finalPath = path.join(targetDir, fileName);
            fs.renameSync(finalAppPath, finalPath);
            fs.rmdirSync(tempDir);

            appFile = {
                path: path.relative(path.join(__dirname, ".."), finalPath),
                size: stats.size
            };
        }

        const iconFile = req.files && req.files['icon'] ? req.files['icon'][0] : null;
        // IMPORTANT: multer provides 'images' as array
        const imageFiles = req.files && req.files['images'] ? req.files['images'] : [];

        if (description == null || description == "") {
            res.status(400);
            throw new Error("Please enter a description");
        }

        let sql = "UPDATE app_tbl SET app_description = ? WHERE app_id = ?";
        await mysql.query(sql, [description, id]);

        if (deletedImages) {
            const deletedImagesArr = JSON.parse(deletedImages);

            for (let image of deletedImagesArr) {
                // Delete file from local storage
                deleteFile(image.image_url);

                sql = "DELETE FROM image_tbl WHERE image_url = ?";
                await mysql.query(sql, image.image_url);
            }
        }

        const baseUrl = process.env.SERVER_BASE_URL;

        if (appFile) {
            // Delete old app file
            if (currentApp && currentApp.app_url) {
                deleteFile(currentApp.app_url);
            }

            const appPath = appFile.path.replace(/\\/g, "/");
            const newAppUrl = `${baseUrl}/${appPath}`;
            const newAppSize = Math.ceil(megabyteConversion(appFile.size));

            sql = "UPDATE app_tbl SET app_size = ?, app_url = ? WHERE app_id = ?";
            await mysql.query(sql, [newAppSize, newAppUrl, id]);
        }

        if (iconFile) {
            // Delete old icon
            if (currentApp && currentApp.app_icon_url) {
                deleteFile(currentApp.app_icon_url);
            }

            const iconPath = iconFile.path.replace(/\\/g, "/");
            const newIconUrl = `${baseUrl}/${iconPath}`;

            sql = "UPDATE app_tbl SET app_icon_url = ? WHERE app_id = ?";
            await mysql.query(sql, [newIconUrl, id]);
        }


        // Handle new images
        if (imageFiles.length > 0) {
            console.log("Processing new images insertion...", imageFiles.length);
            sql = "INSERT INTO image_tbl (app_id, image_url, supabase_id) VALUES (?,?,?);";
            for (let imageFile of imageFiles) {
                const imagePath = imageFile.path.replace(/\\/g, "/");
                const imageUrl = `${baseUrl}/${imagePath}`;
                const imageSupabaseId = uuid.v4();

                console.log("Inserting image URL:", imageUrl);
                await mysql.query(sql, [id, imageUrl, imageSupabaseId]);
            }
        }

        res.status(200).json({ message: "Update succesful" });

    } catch (error) {
        res.status(400);
        console.log("Error in updateApp:", error);
        next(error.message);
    }
}

const getApps = async (req, res, next) => {

    try {
        const sql = "SELECT app_tbl.*, dev.username FROM app_tbl, developer_tbl AS dev WHERE dev.developer_id = app_tbl.developer_id;";

        const [rows] = await mysql.query(sql);

        res.status(200).json({ apps: rows });

    } catch (error) {
        next(error.message);
    }
}

const getApp = async (req, res, next) => {

    //
    try {
        const appId = req.params.id;
        let sql = "";
        let data = {};

        sql = "SELECT app.app_name, app.app_category, app.app_url, app.app_icon_url, app.app_description, app.app_size, app.number_of_downloads, dev.username, dev.developer_id FROM app_tbl AS app, developer_tbl AS dev WHERE dev.developer_id = app.developer_id AND app_id = ?;"
        let [rows] = await mysql.query(sql, [appId]);

        data.app = rows[0];

        sql = "SELECT image_url FROM image_tbl WHERE app_id = ?";
        [rows] = await mysql.query(sql, [appId]);

        data.media = rows;

        sql = "SELECT review.*, dev.username, dev.profile_image, dev.first_name, dev.last_name FROM review_tbl AS review, developer_tbl AS dev WHERE dev.developer_id = review.developer_id AND review.app_id = ?";
        [rows] = await mysql.query(sql, [appId]);

        data.reviews = rows;

        res.status(200).json(data);
    } catch (error) {
        next(error.message);
    }
}



const remove = async (req, res, next) => {
    try {

        const { id } = req.params;

        let sql = "";

        // Collect all file URLs associated with the app to delete them
        const fileUrlsToDelete = [];

        // 1. Get App APK and Icon
        sql = "SELECT app_url, app_icon_url FROM app_tbl WHERE app_id = ?";
        const [appRows] = await mysql.query(sql, [id]);

        if (appRows.length > 0) {
            if (appRows[0].app_url) fileUrlsToDelete.push(appRows[0].app_url);
            if (appRows[0].app_icon_url) fileUrlsToDelete.push(appRows[0].app_icon_url);
        }

        // 2. Get Images
        sql = "SELECT image_url FROM image_tbl WHERE app_id = ?";
        const [imageRows] = await mysql.query(sql, [id]);

        for (let row of imageRows) {
            if (row.image_url) fileUrlsToDelete.push(row.image_url);
        }

        // 3. Delete files and collect directories
        const directoriesTryDelete = new Set();

        for (let url of fileUrlsToDelete) {
            deleteFile(url);

            try {
                const urlObj = new URL(url);
                const relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
                const fullPath = path.join(__dirname, '..', relativePath);
                const dirPath = path.dirname(fullPath);
                directoriesTryDelete.add(dirPath);
            } catch (e) {
                // ignore parsing errors
            }
        }

        // 4. Try to delete directories (if empty)
        for (let dir of directoriesTryDelete) {
            try {
                if (fs.existsSync(dir)) {
                    // check if empty
                    const files = fs.readdirSync(dir);
                    if (files.length === 0) {
                        fs.rmdirSync(dir);
                    }
                }
            } catch (e) {
                console.log("Could not delete directory:", dir, e.message);
            }
        }


        // 5. Delete DB records
        sql = "DELETE app_tbl, image_tbl, review_tbl FROM app_tbl LEFT JOIN image_tbl ON app_tbl.app_id = image_tbl.app_id LEFT JOIN review_tbl ON app_tbl.app_id = review_tbl.app_id WHERE app_tbl.app_id =?;";
        await mysql.query(sql, [id]);

        res.status(200).json({ message: "Deleted" });

    } catch (error) {
        next(error.message)
    }
}

module.exports = {
    upload,
    chunkUpload,
    remove,
    getApp,
    download,
    updateApp,
    getApps
}