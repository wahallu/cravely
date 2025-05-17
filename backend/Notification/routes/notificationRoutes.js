const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Send SMS notification
router.post('/sms', notificationController.sendSMS);

// Send order status notification
router.post('/order-status', notificationController.sendOrderStatusNotification);

// Get user notification history
router.get('/user/:userId', notificationController.getUserNotifications);

// Routes for specific notification types
router.post('/whatsapp/payment-completed', notificationController.sendPaymentNotification);
router.post('/whatsapp/order-confirmed', notificationController.sendOrderConfirmedNotification);
router.post('/whatsapp/order-delivered', notificationController.sendOrderDeliveredNotification);

// New Email routes
router.post('/email/payment-completed', notificationController.sendPaymentEmailNotification);
router.post('/email/order-confirmed', notificationController.sendOrderConfirmedEmailNotification);
router.post('/email/order-delivered', notificationController.sendOrderDeliveredEmailNotification);

module.exports = router;
