const router = require("express").Router();
const protect = require("../middlewares/authorize_middleware");
const { upload, remove, getApp, download, updateApp, getApps, chunkUpload } = require("../controllers/app_controllers");

const uploadMiddleware = require("../middlewares/upload_middleware");

router.get("/", getApps);
router.post("/chunk", protect, uploadMiddleware, chunkUpload);
router.post("/upload", protect, uploadMiddleware, upload);
router.get("/:id", getApp);
router.get("/download/:appId", download);
router.put("/:id", protect, uploadMiddleware, updateApp);
router.delete("/remove/:id", protect, remove);

module.exports = router;