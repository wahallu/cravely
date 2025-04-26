const twilioConfig = require('../config/twilio');
const Notification = require('../models/notification');

/**
 * Service for sending notifications via Twilio
 */
class TwilioService {
  /**
   * Send SMS notification
   * @param {string} to - Recipient phone number (E.164 format)
   * @param {string} body - Message content
   * @param {Object} metadata - Additional metadata about the notification
   * @returns {Promise<Object>} Twilio message object
   */
  static async sendSMS(to, body, userId, metadata = {}) {
    try {
      // Create notification record in pending state
      const notification = new Notification({
        userId,
        type: metadata.type || 'order_status',
        channel: 'sms',
        recipient: to,
        content: body,
        metadata,
        status: 'pending'
      });
      
      // Send the SMS via Twilio
      const message = await twilioConfig.client.messages.create({
        body,
        from: twilioConfig.phoneNumber,
        to
      });
      
      // Update the notification record with success status
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
      
      console.log(`SMS sent to ${to}: ${message.sid}`);
      
      return {
        success: true,
        messageId: message.sid,
        notification
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // Save the failed notification with error details
      const notification = new Notification({
        userId,
        type: metadata.type || 'order_status',
        channel: 'sms',
        recipient: to,
        content: body,
        metadata,
        status: 'failed',
        errorMessage: error.message
      });
      
      await notification.save();
      
      return {
        success: false,
        error: error.message,
        notification
      };
    }
  }
  
  /**
   * Send order status update notification
   * @param {Object} order - Order object
   * @param {Object} user - User object with contact information
   * @returns {Promise<Object>} Result of the notification attempt
   */
  static async sendOrderStatusUpdate(order, user) {
    if (!user.phone) {
      return { success: false, error: 'No phone number available for user' };
    }
    
    // Format order status to be more user-friendly
    const formatOrderStatus = (status) => {
      switch(status) {
        case 'pending': return 'Pending Confirmation';
        case 'confirmed': return 'Order Confirmed';
        case 'preparing': return 'Preparing Your Order';
        case 'out_for_delivery': return 'On the Way!';
        case 'delivered': return 'Order Delivered';
        case 'canceled': return 'Order Canceled';
        default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
      }
    };
    
    // Create SMS message
    const restaurantName = order.restaurant?.name || 'Restaurant';
    const status = formatOrderStatus(order.status);
    const orderNumber = order.orderId || order._id;
    
    let messageBody = `Cravely: Your order #${orderNumber} from ${restaurantName} is now ${status}.`;
    
    // Add ETA for delivery if available
    if (order.status === 'out_for_delivery' && order.estimatedDelivery) {
      const eta = new Date(order.estimatedDelivery).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      messageBody += ` Estimated delivery time: ${eta}.`;
    }
    
    // Add tracking link
    messageBody += ` Track your order: https://cravely.com/orders/${orderNumber}`;
    
    // Send the notification
    return await this.sendSMS(
      user.phone,
      messageBody,
      user._id,
      {
        type: 'order_status',
        orderId: orderNumber,
        orderStatus: order.status,
        restaurantName
      }
    );
  }
}

module.exports = TwilioService;
