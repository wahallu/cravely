const express = require("express");
const router = express.Router();
const { getDriverStats } = require("../controllers/driverController");

router.get("/stats", getDriverStats);

module.exports = router;
