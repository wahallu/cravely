const axios = require('axios');
require('dotenv').config();

// URL for the notification service
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5007/api/notifications';

/**
 * Client for interacting with the Notification service
 */
class NotificationService {
  /**
   * Send order status notification
   * @param {string} orderId - The order ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Notification result
   */
  static async sendOrderStatusNotification(orderId, userId) {
    try {
      const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/order-status`, {
        orderId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending order status notification:', error.message);
      throw error;
    }
  }
}

/**
 * Send a WhatsApp notification for payment completed
 */
const sendPaymentNotification = async (orderData) => {
  try {
    const { customer, orderId, payment } = orderData;
    
    // Prepare notification data
    const notificationData = {
      customerName: customer.fullName,
      customerPhone: customer.phone,
      orderId,
      amount: (payment.amount).toFixed(2) // Convert cents to dollars
    };
    
    // Send notification request to the notification service
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/whatsapp/payment-completed`, 
      notificationData
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending payment notification:', error);
    // Don't throw the error to avoid breaking the order flow
  }
};

/**
 * Send a WhatsApp notification for order confirmed
 */
const sendOrderConfirmedNotification = async (orderData) => {
  try {
    const { customer, orderId, restaurant, estimatedDelivery } = orderData;
    
    // Format estimated delivery time if available
    let estimatedTimeString = null;
    if (estimatedDelivery) {
      const estimatedTime = new Date(estimatedDelivery);
      estimatedTimeString = estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Prepare notification data
    const notificationData = {
      customerName: customer.fullName,
      customerPhone: customer.phone,
      orderId,
      restaurantName: restaurant.name,
      estimatedTime: estimatedTimeString
    };
    
    // Send notification request
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/whatsapp/order-confirmed`, 
      notificationData
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending order confirmed notification:', error);
  }
};

/**
 * Send a WhatsApp notification for order delivered
 */
const sendOrderDeliveredNotification = async (orderData) => {
  try {
    const { customer, orderId, restaurant } = orderData;
    
    // Prepare notification data
    const notificationData = {
      customerName: customer.fullName,
      customerPhone: customer.phone,
      orderId,
      restaurantName: restaurant.name
    };
    
    // Send notification request
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/whatsapp/order-delivered`, 
      notificationData
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending order delivered notification:', error);
  }
};

/**
 * Send a WhatsApp notification to driver about new order assignment
 */
const sendDriverAssignmentNotification = async (orderData) => {
  try {
    const { driver, orderId, restaurant, customer } = orderData;
    
    // Format customer address properly
    const customerAddress = customer.address || 'Address not provided';
    
    // Prepare notification data
    const notificationData = {
      driverName: driver.name,
      driverPhone: driver.phone,
      orderId,
      restaurantName: restaurant.name,
      customerAddress
    };
    
    // Send notification request
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/whatsapp/driver-assignment`, 
      notificationData
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending driver assignment notification:', error);
    // Don't throw the error to avoid breaking the order flow
  }
};

module.exports = {
  sendPaymentNotification,
  sendOrderConfirmedNotification,
  sendOrderDeliveredNotification,
  sendDriverAssignmentNotification
};
