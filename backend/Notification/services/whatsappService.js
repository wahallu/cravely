const twilio = require('twilio');
require('dotenv').config();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

/**
 * Send a WhatsApp message using Twilio
 * @param {string} to - Recipient's phone number (with WhatsApp format)
 * @param {string} message - Message content to send
 */
const sendWhatsAppMessage = async (to, message) => {
  try {
    // Format the phone number to ensure it has proper Sri Lankan format
    const formattedNumber = formatPhoneNumberForSriLanka(to);
    
    const result = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to:   `whatsapp:${formattedNumber}`,
        body: message
      });
    
    console.log(`WhatsApp message sent with SID: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Helper function to format phone numbers for Sri Lanka
function formatPhoneNumberForSriLanka(phone) {
  // Remove any non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Debug the incoming number
  console.log('Original number:', phone);
  console.log('Digits only:', digits);
  
  // Check if it already has Sri Lanka's country code with correct format
  if (digits.startsWith('94')) {
    // Remove any leading 0 after country code (94[0]XXXXXXXX)
    if (digits.length > 2 && digits.charAt(2) === '0') {
      digits = '94' + digits.substring(3);
    }
    return `+${digits}`;
  }
  
  // If it starts with 0, it's likely a local number (e.g., 071XXXXXXX)
  if (digits.startsWith('0')) {
    digits = digits.substring(1); // Remove leading 0
    return `+94${digits}`;
  }
  
  // If it's just the number without 0 (e.g., 71XXXXXXX)
  if ((digits.length === 9 || digits.length === 10) && 
      (digits.startsWith('7') || digits.startsWith('1'))) {
    return `+94${digits}`;
  }
  
  // Default case - assume we need to add the country code
  return `+94${digits}`;
}

/**
 * Format phone number to international format for WhatsApp
 */


// Create notification templates for different events
const notifications = {
  paymentComplete: (customerName, orderId, amount) => ({
    message: `Hello ${customerName}! Your payment of $${amount} for order #${orderId} has been successfully processed. We'll notify you when the restaurant confirms your order.`
  }),
  
  orderConfirmed: (customerName, orderId, restaurantName, estimatedTime) => ({
    message: `Great news, ${customerName}! Your order #${orderId} has been confirmed by ${restaurantName}. Your food is now being prepared and should be ready for delivery ${estimatedTime ? `by ${estimatedTime}` : 'soon'}.`
  }),
  
  orderDelivered: (customerName, orderId, restaurantName) => ({
    message: `Hi ${customerName}! Your order #${orderId} from ${restaurantName} has been delivered. Enjoy your meal! 😋 Please rate your experience in the app.`
  })
};

module.exports = {
  sendWhatsAppMessage,
  notifications,
  formatPhoneNumber: formatPhoneNumberForSriLanka  // Export the existing function with the name the controller expects
};