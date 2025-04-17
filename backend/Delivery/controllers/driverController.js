const Driver = require("../models/Driver");

const getDriverStats = async (req, res) => {
  try {
    const driver = await Driver.findOne({ name: req.query.name });
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDriverStats
};
