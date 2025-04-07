const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authorize_middleware");
const { getDeveloper, updateDeveloper, getPlan } = require("../controllers/developer_controller");

router.get("/current-plan/:id", protect, getPlan);
router.get("/", protect, getDeveloper);
router.get("/:id", getDeveloper);

router.put("/update", protect, updateDeveloper);



module.exports = router;