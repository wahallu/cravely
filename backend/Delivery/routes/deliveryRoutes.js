const express = require("express");
const router = express.Router();
const {
  getAllDeliveries,
  createDelivery,
  updateDeliveryStatus
} = require("../controllers/deliveryController");

router.get("/", getAllDeliveries);
router.post("/", createDelivery);
router.put("/:id/status", updateDeliveryStatus);

module.exports = router;
