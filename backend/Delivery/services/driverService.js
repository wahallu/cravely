const Driver = require('../models/Driver');

/**
 * Get all drivers
 */
const getAllDrivers = async () => {
  return await Driver.find();
};

/**
 * Get a driver by ID
 */
const getDriverById = async (driverId) => {
  return await Driver.findOne({ driverId });
};

/**
 * Update driver's earnings and completed orders
 */
const updateDriverStats = async (driverId, earnings) => {
  const driver = await Driver.findOne({ driverId });
  if (!driver) throw new Error('Driver not found');

  driver.totalEarnings += earnings;
  driver.completedOrders += 1;

  return await driver.save();
};

/**
 * Add a new driver
 */
const addDriver = async (driverData) => {
  const newDriver = new Driver(driverData);
  return await newDriver.save();
};

module.exports = {
  getAllDrivers,
  getDriverById,
  updateDriverStats,
  addDriver
};
