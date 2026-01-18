const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mysql = require("../config/db_config"); // Import simplified DB config for query

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const userId = req.id;

        if (req.uploadDir) {
            return cb(null, req.uploadDir);
        }

        // 1. Handle Profile Images
        if (file.fieldname === "profile_image") {
            req.uploadDir = path.join("uploads", userId.toString(), "profile");
            if (!fs.existsSync(req.uploadDir)) {
                fs.mkdirSync(req.uploadDir, { recursive: true });
            }
            return cb(null, req.uploadDir);
        }

        // 2. Handle App Updates (Reuse existing folder)
        if (req.params && req.params.id) {
            try {
                // Try to find existing app folder
                const [rows] = await mysql.query("SELECT app_url FROM app_tbl WHERE app_id = ?", [req.params.id]);

                if (rows.length > 0 && rows[0].app_url) {
                    const urlObj = new URL(rows[0].app_url);
                    // pathname: /uploads/1/my_app-123456/app.apk
                    // remove leading slash
                    const relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;

                    // dirname: uploads/1/my_app-123456
                    const folderPath = path.dirname(relativePath);

                    req.uploadDir = folderPath;

                    if (req.uploadDir && fs.existsSync(req.uploadDir)) {
                        return cb(null, req.uploadDir);
                    }
                }
            } catch (e) {
                console.log("Error finding existing app folder:", e.message);
                // Fallback to creating new folder if DB lookup fails or folder missing
            }
        }

        // 3. Handle New App Uploads (Create new Unique Folder)
        let appName = req.body.app_name || "untitled_app";
        const sanitizedAppName = appName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = Date.now();

        const uniqueFolder = `${sanitizedAppName}-${timestamp}`;
        req.uploadDir = path.join("uploads", userId.toString(), uniqueFolder);

        if (!fs.existsSync(req.uploadDir)) {
            fs.mkdirSync(req.uploadDir, { recursive: true });
        }

        cb(null, req.uploadDir);
    },
    filename: function (req, file, cb) {
        // Preserve original extension, prepend timestamp to avoid collisions
        // For updates, the old file is deleted by controller, so collision is handled there too.
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage: storage });

const uploadMiddleware = upload.fields([
    { name: "app", maxCount: 1 },
    { name: "icon", maxCount: 1 },
    { name: "images", maxCount: 4 },
    { name: "profile_image", maxCount: 1 },
]);

module.exports = uploadMiddleware;
