const axios = require('axios');
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL || 'http://localhost:5001/api';

/**
 * Update driver status in the Delivery service
 * @param {string} driverId - The driver's ID
 * @param {string} status - The new status to set
 */
const updateDriverStatus = async (driverId, status) => {
  try {
    const response = await axios.put(`${DELIVERY_SERVICE_URL}/drivers/${driverId}`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating driver status in Delivery service:', error);
    throw error;
  }
};

module.exports = {
  updateDriverStatus,
  // Include your existing methods if there are any
  updateDriverStats: require('./deliveryService').updateDriverStats
};