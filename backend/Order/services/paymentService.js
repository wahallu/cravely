const axios = require('axios');

/**
 * Process a credit card payment - MOCK implementation for testing
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} - Payment result
 */
const processCardPayment = async (paymentData) => {
  console.log('MOCK: Processing card payment', paymentData);
  
  // For testing, use a status that matches your Order model enum
  return {
    success: true,
    paymentIntentId: `test_pi_${Date.now()}`,
    status: 'completed' // Changed from 'succeeded' to a valid enum value
  };
};

/**
 * Save card details for future payments - MOCK implementation
 * @param {Object} cardData - Card details
 * @returns {Promise<Object>} - Card save result
 */
const saveCardDetails = async (cardData) => {
  console.log('MOCK: Saving card details', cardData);
  
  return {
    success: true,
    cardId: `card_${Date.now()}`
  };
};

/**
 * Process a cash payment (no actual processing needed)
 * @returns {Object} - Cash payment result
 */
const processCashPayment = () => {
  return {
    success: true,
    paymentIntentId: `cash-${Date.now()}`,
    status: 'pending'
  };
};

module.exports = {
  processCardPayment,
  saveCardDetails,
  processCashPayment
};
