const Driver = require("../models/Driver");

const getDriverStats = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL params
    const driver = await Driver.findOne({ driverId: id });

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDriverByDriverId = async (req, res) => {
  try {
    const driver = await Driver.findOne({ driverId: req.params.driverId });
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllDrivers,
  getDriverByDriverId,
  getDriverStats
};
