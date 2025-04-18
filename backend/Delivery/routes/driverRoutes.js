const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { 
  getDriverStats,
  getAllDrivers, 
  getDriverByDriverId,
  addDriver,
  updateDriver,
  deleteDriver
} = require("../controllers/driverController");

// Get routes
router.get("/stats/:id", protect, getDriverStats);
router.get("/", getAllDrivers); 
router.get("/:driverId", getDriverByDriverId);

// Create route
router.post("/", protect, addDriver);

// Update route
router.put("/:driverId", protect, updateDriver);

// Delete route
router.delete("/:driverId", protect, deleteDriver);

module.exports = router;
