const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAllDrivers,
  getDriverByDriverId,
  getDriverStats,
  addDriver, 
  updateDriver,
  deleteDriver
} = require("../controllers/driverController");

// Base driver routes
router.get("/", getAllDrivers);
router.get("/:driverId", getDriverByDriverId);
router.post("/", protect, addDriver);
router.put("/:driverId", protect, updateDriver);
router.delete("/:driverId", protect, deleteDriver);

module.exports = router;
