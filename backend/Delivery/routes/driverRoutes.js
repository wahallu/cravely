const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getDriverStats,getAllDrivers, getDriverByDriverId } = require("../controllers/driverController");

router.get("/stats/:id", protect, getDriverStats);
router.get("/", getAllDrivers); 
router.get("/:driverId", getDriverByDriverId); 


module.exports = router;
