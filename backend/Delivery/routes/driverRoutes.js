const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAllDrivers,
  getDriverByDriverId,
  getDriverStats,
  addDriver, 
  updateDriver,
  deleteDriver,
  registerDriver, 
  loginDriver, 
  getDriverProfile,
  getDriversByCity
} = require("../controllers/driverController");

// Base driver routes
router.get("/", getAllDrivers);
router.get("/:driverId", getDriverByDriverId);
router.get("/profile/:id", getDriverByDriverId);
router.post("/", protect, addDriver);
router.put("/:driverId", protect, updateDriver);
router.delete("/:driverId", protect, deleteDriver);

// Authentication and profile routes
router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.get('/profile', protect, getDriverProfile);

// Get drivers by city
router.get('/city/:city', getDriversByCity);

module.exports = router;
