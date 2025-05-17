const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['order_status', 'delivery_update', 'promotion', 'account'],
    required: true
  },
  channel: {
    type: String,
    enum: ['sms', 'whatsapp', 'email'], 
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    orderId: String,
    orderStatus: String,
    restaurantName: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered'],
    default: 'pending'
  },
  errorMessage: String,
  sentAt: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster querying
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
