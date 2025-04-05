const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authorize_middleware");
const {makePayment, completeOrder} = require("../controllers/payment_controller");

router.post("/pay", protect, makePayment);
router.get("/complete-order/:id", completeOrder)

module.exports = router;


