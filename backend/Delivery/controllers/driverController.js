const Driver = require("../models/Driver");
const Delivery = require("../models/Delivery");

const getDriverStats = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOne({ driverId: id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // Find completed deliveries for this driver
    const deliveredOrders = await Delivery.find({ driver: driver.name, driverStatus: "Delivered" });


    const completedOrders = deliveredOrders.length;
    const totalEarnings = deliveredOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    res.json({
      driverId: id,
      name: driver.name,
      completedOrders,
      totalEarnings
    });
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

const addDriver = async (req, res) => {
  try {
    // Check if driver with this ID already exists
    const existingDriver = await Driver.findOne({ driverId: req.body.driverId });
    if (existingDriver) {
      return res.status(400).json({ 
        message: "A driver with this ID already exists" 
      });
    }

    // Create new driver
    const newDriver = new Driver(req.body);
    const savedDriver = await newDriver.save();
    res.status(201).json(savedDriver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Find driver and update
    const updatedDriver = await Driver.findOneAndUpdate(
      { driverId },
      req.body,
      { new: true } // Return the updated document
    );
    
    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    
    res.json(updatedDriver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Find and delete driver
    const deletedDriver = await Driver.findOneAndDelete({ driverId });
    
    if (!deletedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    
    res.json({ message: "Driver deleted successfully", driverId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDrivers,
  getDriverByDriverId,
  getDriverStats,
  addDriver,
  updateDriver,
  deleteDriver
};
