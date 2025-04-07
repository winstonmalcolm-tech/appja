const router = require("express").Router();
const protect = require("../middlewares/authorize_middleware");
const { upload, remove, getApp, download, updateApp, getApps } = require("../controllers/app_controllers");


router.get("/", getApps);
router.post("/upload", protect, upload);
router.get("/:id", getApp);
router.post("/download/:appId", download);
router.put("/:id", protect, updateApp);
router.delete("/remove/:id", protect, remove);

module.exports = router;