const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send an email notification
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} html - Email content in HTML
 * @returns {Promise<Object>} Result of the email sending operation
 */
const sendEmailMessage = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Cravely" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Create email templates for different events
const notifications = {
  paymentComplete: (customerName, orderId, amount) => ({
    subject: `Payment Received for Order #${orderId}`,
    html: `
      <h2>Payment Confirmed</h2>
      <p>Hello ${customerName},</p>
      <p>Your payment of $${amount} for order #${orderId} has been successfully processed.</p>
      <p>We'll notify you when the restaurant confirms your order.</p>
      <p>Thank you for using Cravely!</p>
    `
  }),
  
  orderConfirmed: (customerName, orderId, restaurantName, estimatedTime) => ({
    subject: `Order #${orderId} Confirmed`,
    html: `
      <h2>Order Confirmed</h2>
      <p>Great news, ${customerName}!</p>
      <p>Your order #${orderId} has been confirmed by ${restaurantName}.</p>
      <p>Your food is now being prepared and should be ready for delivery 
        ${estimatedTime ? `by ${estimatedTime}` : 'soon'}.</p>
      <p>Thank you for using Cravely!</p>
    `
  }),
  
  orderDelivered: (customerName, orderId, restaurantName) => ({
    subject: `Order #${orderId} Delivered`,
    html: `
      <h2>Order Delivered</h2>
      <p>Hi ${customerName}!</p>
      <p>Your order #${orderId} from ${restaurantName} has been delivered.</p>
      <p>Enjoy your meal! 😋</p>
      <p>Please rate your experience in the app.</p>
      <p>Thank you for using Cravely!</p>
    `
  })
};

module.exports = {
  sendEmailMessage,
  notifications
};