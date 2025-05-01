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

/**
 * Get available drivers for a city
 * @param {string} city - The city to find drivers for
 */
const getDriversForCity = async (city) => {
  try {
    const response = await axios.get(`${DELIVERY_SERVICE_URL}/drivers/city/${encodeURIComponent(city)}`);
    if (response.data && response.data.success) {
      return response.data.drivers || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting drivers for city in Delivery service:', error);
    return [];
  }
};

/**
 * Update driver stats after successful delivery
 * @param {string} driverId - The driver's ID
 * @param {number} earnings - The amount earned from the delivery
 */
const updateDriverStats = async (driverId, earnings) => {
  try {
    // Directly use a PUT request instead of importing the function
    const response = await axios.put(`${DELIVERY_SERVICE_URL}/drivers/${driverId}/stats`, {
      earnings
    });
    return response.data;
  } catch (error) {
    console.error('Error updating driver stats:', error);
    throw error;
  }
};

module.exports = {
  updateDriverStatus,
  getDriversForCity,
  updateDriverStats
};