const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAllDeliveries,
  createDelivery,
  updateDeliveryStatus
} = require("../controllers/deliveryController");

router.get("/",protect, getAllDeliveries);
router.post("/",protect, createDelivery);
router.put("/:id/status",protect, updateDeliveryStatus);

module.exports = router;