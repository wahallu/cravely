const TwilioService = require('../services/twilioService');
const Notification = require('../models/notification');
const axios = require('axios');
const whatsappService = require('../services/whatsappService');

/**
 * Controller for notification-related endpoints
 */
const NotificationController = {
  /**
   * Send an SMS notification
   * @route POST /api/notifications/sms
   * @access Private
   */
  sendSMS: async (req, res) => {
    try {
      const { to, body, userId, metadata } = req.body;
      
      if (!to || !body || !userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: to, body, userId' 
        });
      }
      
      const result = await TwilioService.sendSMS(to, body, userId, metadata);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'SMS sent successfully',
          data: result
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send SMS',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Controller error sending SMS:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  /**
   * Send an order status notification
   * @route POST /api/notifications/order-status
   * @access Private
   */
  sendOrderStatusNotification: async (req, res) => {
    try {
      const { orderId, userId } = req.body;
      
      if (!orderId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: orderId, userId'
        });
      }
      
      // Fetch order details from Order service
      const orderResponse = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/${orderId}`
      );
      const order = orderResponse.data.order;
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Fetch user details from User service
      const userResponse = await axios.get(
        `${process.env.USER_SERVICE_URL}/${userId}`
      );
      const user = userResponse.data.user;
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Send notification
      const result = await TwilioService.sendOrderStatusUpdate(order, user);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Order status notification sent successfully',
          data: result
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send order status notification',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Controller error sending order notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  /**
   * Get notification history for a user
   * @route GET /api/notifications/user/:userId
   * @access Private
   */
  getUserNotifications: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, type } = req.query;
      
      const skip = (page - 1) * limit;
      
      // Build query
      const query = { userId };
      if (type) query.type = type;
      
      // Get notifications with pagination
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
        
      // Get total count
      const total = await Notification.countDocuments(query);
      
      return res.status(200).json({
        success: true,
        count: notifications.length,
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        notifications
      });
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  /**
   * Send WhatsApp notification for payment completed
   */
  sendPaymentNotification: async (req, res) => {
    try {
      const { customerName, customerPhone, orderId, amount } = req.body;
      
      if (!customerName || !customerPhone || !orderId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: customerName, customerPhone, orderId, amount'
        });
      }
      
      const formattedPhone = whatsappService.formatPhoneNumber(customerPhone);
      const { message } = whatsappService.notifications.paymentComplete(
        customerName, orderId, amount
      );
      
      const result = await whatsappService.sendWhatsAppMessage(formattedPhone, message);
      
      res.status(200).json({
        success: true,
        message: 'Payment notification sent via WhatsApp',
        messageId: result.sid
      });
    } catch (error) {
      console.error('Error sending payment notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp notification',
        error: error.message
      });
    }
  },

  /**
   * Send WhatsApp notification for order confirmed
   */
  sendOrderConfirmedNotification: async (req, res) => {
    try {
      const { customerName, customerPhone, orderId, restaurantName, estimatedTime } = req.body;
      
      if (!customerName || !customerPhone || !orderId || !restaurantName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      const formattedPhone = whatsappService.formatPhoneNumber(customerPhone);
      const { message } = whatsappService.notifications.orderConfirmed(
        customerName, orderId, restaurantName, estimatedTime
      );
      
      const result = await whatsappService.sendWhatsAppMessage(formattedPhone, message);
      
      res.status(200).json({
        success: true,
        message: 'Order confirmation notification sent via WhatsApp',
        messageId: result.sid
      });
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp notification',
        error: error.message
      });
    }
  },

  /**
   * Send WhatsApp notification for order delivered
   */
  sendOrderDeliveredNotification: async (req, res) => {
    try {
      const { customerName, customerPhone, orderId, restaurantName } = req.body;
      
      if (!customerName || !customerPhone || !orderId || !restaurantName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      const formattedPhone = whatsappService.formatPhoneNumber(customerPhone);
      const { message } = whatsappService.notifications.orderDelivered(
        customerName, orderId, restaurantName
      );
      
      const result = await whatsappService.sendWhatsAppMessage(formattedPhone, message);
      
      res.status(200).json({
        success: true,
        message: 'Delivery notification sent via WhatsApp',
        messageId: result.sid
      });
    } catch (error) {
      console.error('Error sending delivery notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp notification',
        error: error.message
      });
    }
  }
};

module.exports = NotificationController;
