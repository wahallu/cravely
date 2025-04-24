const axios = require('axios');
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL || 'http://localhost:5001/api';

/**
 * Update driver statistics after delivery
 * @param {string} driverId - The driver's ID
 * @param {number} earnings - The amount earned from this delivery
 */
const updateDriverStats = async (driverId, earnings) => {
  try {
    const response = await axios.post(`${DELIVERY_SERVICE_URL}/drivers/stats/update`, {
      driverId,
      earnings
    });
    return response.data;
  } catch (error) {
    console.error('Error updating driver stats:', error);
    throw error;
  }
};

module.exports = {
  updateDriverStats
};