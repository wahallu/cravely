const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getDriverStats } = require("../controllers/driverController");

router.get("/stats", protect, getDriverStats);

module.exports = router;
