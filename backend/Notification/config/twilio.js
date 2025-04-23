const dotenv = require('dotenv');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Configuration object
const twilioConfig = {
  client: twilioClient,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
};

module.exports = twilioConfig;
