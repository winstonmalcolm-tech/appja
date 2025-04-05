const express = require("express");
const multer = require("multer");
const router = express.Router();
const protect = require("../middlewares/authorize_middleware");
const { getDeveloper, updateDeveloper, getPlan } = require("../controllers/developer_controller");
const path = require("node:path");
const fs = require("node:fs/promises");

const fileFilter = (req, file, cb) => {
    
    const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (file.fieldname === "profileImg") {
        
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only jpg, jpeg and png files are allowed!"), false);
        }

    } 
}

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        
        if (req.body.oldFile !="null") {
            const parsedUrl = URL.parse(req.body.oldFile);
            const filePath = path.join(__dirname+`../${parsedUrl.pathname}`);
            const parentDirectory = path.join(__dirname, '..');
            const fullPath = `${parentDirectory}${parsedUrl.pathname}`;


            fs.unlink(fullPath, (err) => {
                if (err) {
                  console.error(`Error removing file: ${err}`);
                  return;
                }
              
                console.log(`File ${filePath} has been successfully removed.`);
              });
        }

        const directory = `uploads/${req.id}`;
        await fs.mkdir(directory, {recursive: true});
        
        cb(null, directory);
    },

    filename: (req,file,cb) => {
        cb(null, file.originalname.replace(" ", ""));
    }
});

const fileUpload = multer({storage: storage, fileFilter: fileFilter});

router.get("/current-plan/:id", protect, getPlan);
router.get("/", protect, getDeveloper);
router.get("/:id", getDeveloper);

router.put("/update", protect, fileUpload.single("profileImg"), updateDeveloper);



module.exports = router;