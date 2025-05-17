const axios = require('axios');
require('dotenv').config();

// Use injected env var, or Docker DNS fallback
const DELIVERY_SERVICE_URL =
  process.env.DELIVERY_SERVICE_URL
  || 'http://delivery:5001/api/drivers';

const updateDriverStatus = async (driverId, status) => {
  try {
    return (await axios.put(
      `${DELIVERY_SERVICE_URL}/${driverId}`,
      { status }
    )).data;
  } catch (error) {
    console.error('Error updating driver status in Delivery service:', error.message);
    throw error;
  }
};

const getDriversForCity = async (city) => {
  try {
    const res = await axios.get(
      `${DELIVERY_SERVICE_URL}/city/${encodeURIComponent(city)}`
    );
    return (res.data && res.data.success) ? res.data.drivers : [];
  } catch (error) {
    console.error('Error getting drivers for city in Delivery service:', error.message);
    return [];
  }
};

const updateDriverStats = async (driverId, earnings) => {
  try {
    return (await axios.put(
      `${DELIVERY_SERVICE_URL}/${driverId}/stats`,
      { earnings }
    )).data;
  } catch (error) {
    console.error('Error updating driver stats:', error.message);
    throw error;
  }
};

module.exports = {
  updateDriverStatus,
  getDriversForCity,
  updateDriverStats,
};
