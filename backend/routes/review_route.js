const router = require("express").Router();
const protect = require("../middlewares/authorize_middleware");
const { newReview, getReviews } = require("../controllers/review_controller");


router.post("/new", protect, newReview);
router.get("/all/:appID", getReviews);


module.exports = router;