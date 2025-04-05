const router = require("express").Router();
const protect = require("../middlewares/authorize_middleware");
const { upload, remove, getApp, download, updateApp, getApps } = require("../controllers/app_controllers");
const fs = require("fs/promises");
const multer = require("multer");
const path = require("path");

const fileFilter = async (req, file, cb) => {
    
    const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (file.fieldname === "app") {
        
        if (file.mimetype === "application/vnd.android.package-archive") {
            cb(null, true);
        } else {
            cb(new Error("Only apk files are allowed!"), false);
        }

    } else if (file.fieldname === "images") {

        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only jpg, jpeg and png files are allowed"), false);
        }
    } else if(file.fieldname === "icon") {

        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only jpg, jpeg and png files are allowed"), false);
        }

    } else {
        cb(new Error("Unknown field!"), false);
    }
    
}

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const directory = `uploads/${req.id}/apps/${req.body.app_name.replace(" ", "_")}`;
        await fs.mkdir(directory, {recursive: true});

        cb(null, directory);
    },
    
    filename: (req, file, cb) => {
        cb(null, file.originalname.replace(" ", ""));
    }
})
const fileUpload = multer({storage, fileFilter: fileFilter});


router.get("/", getApps);
router.post("/upload", protect, fileUpload.fields([{name: "images", maxCount: 4}, {name: "app", maxCount: 1}, {name: "icon", maxCount: 1}]), upload);
router.get("/:id", getApp);
router.post("/download/:appId", download);


const modifyStorage = multer.diskStorage({
    destination: async function(req, file, cb) {

        if (req.body.deletedImages) {
            
            for (image of req.body.deletedImages) {
                let parsedUrl = URL.parse(image);
                let parentDirectory = path.join(__dirname, '..');
                const fullPath = `${parentDirectory}${parsedUrl.pathname}`;

                fs.unlink(fullPath, (err) => {
                    if (err) {
                        console.error(`Error removing file: ${err}`);
                        return;
                    }
                })
            }
        }

        const directory = `uploads/${req.id}/apps/${req.body.app_name.replace(" ", "_")}`;
        await fs.mkdir(directory, {recursive: true});

        cb(null, directory)

    },

    filename: function(req, file, cb) {
        cb(null, file.originalname.replace(" ", ""));
    }
});

const modifiedFileFilter = (req, file, cb) => {
    
    const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (file.fieldname === "apk") {
        
        if (file.mimetype === "application/vnd.android.package-archive") {
            cb(null, true);
        } else {
            cb(new Error("Only apk files are allowed!"), false);
        }

    } else if (file.fieldname === "newImages") {

        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only jpg, jpeg and png files are allowed"), false);
        }
    } else if(file.fieldname === "icon") {

        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only jpg, jpeg and png files are allowed"), false);
        }

    } else {
        cb(new Error("Unknown field!"), false);
    }
    
}

const modifiedUpload = multer({ storage: modifyStorage, fileFilter: modifiedFileFilter}); 


router.put("/:id", protect, modifiedUpload.fields([{name: "newImages", maxCount: 4}, {name: "apk", maxCount: 1}, {name: "icon", maxCount: 1}]), updateApp);
router.delete("/remove/:id", protect, remove);

module.exports = router;