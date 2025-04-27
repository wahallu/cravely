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
router.post('/whatsapp/driver-assignment', notificationController.sendDriverAssignmentNotification);

module.exports = router;
