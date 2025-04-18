const axios = require('axios');
const Delivery = require('../models/Delivery'); 
require('dotenv').config();

// Base URL for the Order Service 
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:5002/api/orders';

/**
 * Get all delivery orders from the Order Service
 */
const getAllDeliveries = async () => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders from Order Service:', error.message);
    throw new Error('Could not fetch delivery orders');
  }
};

/**
 * Update driver status of a specific order
 */
const updateDriverStatus = async (orderId, newStatus) => {
  try {
    
    const response = await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating driver status:', error.message);
    throw new Error('Could not update driver status');
  }
};

/**
 * Get driver dashboard stats
 */
const getDriverStats = async (driverId) => {
  
  const completedOrders = await Delivery.find({ driver: driverId, status: 'Delivered' });

  const totalEarnings = completedOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    totalEarnings,
    completedOrders: completedOrders.length,
  };
};

module.exports = {
  getAllDeliveries,
  updateDriverStatus,
  getDriverStats,
};
