const axios = require('axios');
require('dotenv').config();

// Use injected env var, or Docker DNS fallback
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL
  || 'http://notification:5007/api/notifications';

class NotificationService {
  static async sendOrderStatusNotification(orderId, userId) {
    try {
      const response = await axios.post(
        `${NOTIFICATION_SERVICE_URL}/order-status`,
        { orderId, userId }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending order status notification:', error);
      throw error;
    }
  }
}

const sendPaymentNotification = async (orderData) => {
  try {
    const { customer, orderId, payment } = orderData;
    const notificationData = {
      customerName: customer.fullName,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      orderId,
      amount: payment.amount.toFixed(2),
    };

    // Send WhatsApp notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/whatsapp/payment-completed`,
      notificationData
    );
    
    // Send Email notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/email/payment-completed`,
      notificationData
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error sending payment notification:', error.message);
    // swallow so order flow continues
  }
};

const sendOrderConfirmedNotification = async (orderData) => {
  try {
    const { customer, orderId, restaurant, estimatedDelivery } = orderData;
    let estimatedTimeString = null;
    if (estimatedDelivery) {
      const t = new Date(estimatedDelivery);
      estimatedTimeString = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const notificationData = {
      customerName: customer.fullName,
      customerPhone: customer.phone,
      orderId,
      restaurantName: restaurant.name,
      estimatedTime: estimatedTimeString,
    };

    // Send WhatsApp notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/whatsapp/order-confirmed`,
      notificationData
    );

    // Send Email notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/email/order-confirmed`,
      notificationData
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmed notification:', error.message);
  }
};

const sendOrderDeliveredNotification = async (orderData) => {
  try {
    const { customer, orderId, restaurant } = orderData;
    const notificationData = {
      customerName: customer.fullName,
      customerPhone: customer.phone,
      orderId,
      restaurantName: restaurant.name,
    };

    // Send WhatsApp notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/whatsapp/order-delivered`,
      notificationData
    );

    // Send Email notification
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/email/order-delivered`,
      notificationData
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending order delivered notification:', error.message);
  }
};

module.exports = {
  NotificationService,
  sendPaymentNotification,
  sendOrderConfirmedNotification,
  sendOrderDeliveredNotification,
};
