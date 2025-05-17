const Driver = require("../models/Driver");
const jwt = require("jsonwebtoken");

const getDriverStats = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOne({ driverId: id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // Find completed deliveries for this driver
    const deliveredOrders = await Delivery.find({ driver: driver.name, driverStatus: "Delivered" });


    const completedOrders = deliveredOrders.length;
    const totalEarnings = deliveredOrders.reduce((acc, order) => acc + (order.total || 0), 0);

    driver.completedOrders = completedOrders;
    driver.totalEarnings = totalEarnings;
    await driver.save();


    res.json({
      driverId: id,
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      vehicleType: driver.vehicleType,
      status: driver.status,
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
    const driver = await Driver.findById(req.params.id).select('-password');
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.status(200).json({
      success: true,
      driver: {
        id: driver._id,
        driverId: driver.driverId,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        vehicleType: driver.vehicleType,
        status: driver.status,
        totalEarnings: driver.totalEarnings,
        completedOrders: driver.completedOrders
      }
    });
  } catch (err) {
    console.error('Get driver error:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Error retrieving driver"
    });
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

const registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNumber, vehicleType } = req.body;

    // Check if email already exists
    const existingDriver = await Driver.findOne({ email: email.toLowerCase() });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email address.'
      });
    }

    // Create driver
    const driver = await Driver.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      licenseNumber,
      vehicleType
    });

    // Generate token
    const token = jwt.sign(
      { id: driver._id, role: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        role: 'driver'
      }
    });

  } catch (error) {
    console.error('Driver registration error:', error);
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already registered'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find driver by email
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await driver.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token with role
    const token = jwt.sign(
      { 
        id: driver._id,
        role: 'driver'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        role: 'driver'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

const getDriverProfile = async (req, res) => {
  try {
    // Get driver ID from authenticated token
    const driverId = req.user.id;

    const driver = await Driver.findById(driverId).select('-password');
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      driver: {
        id: driver._id,
        driverId: driver.driverId,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        vehicleType: driver.vehicleType,
        status: driver.status,
        totalEarnings: driver.totalEarnings,
        completedOrders: driver.completedOrders
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving driver profile'
    });
  }
};

module.exports = {
  getAllDrivers,
  getDriverByDriverId,
  getDriverStats,
  addDriver,
  updateDriver,
  deleteDriver,
  registerDriver,
  loginDriver,
  getDriverProfile
};
