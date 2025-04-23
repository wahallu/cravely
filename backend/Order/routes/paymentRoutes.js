const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const Card = require('../models/Card');
const { protect } = require('../middleware/auth');
// Load environment variables properly
require('dotenv').config();

// Initialize Stripe with the API key from environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Make sure these routes are registered and working properly
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount, currency, paymentMethodId, description, metadata, saveCard } = req.body;
    
    if (!amount || !currency || !paymentMethodId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required payment information' 
      });
    }
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      description,
      metadata: {
        ...metadata,
        userId: req.user._id
      },
      confirm: false,
      setup_future_usage: saveCard ? 'off_session' : undefined
    });
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment service error'
    });
  }
});

// Save a payment method
router.post('/save-card', protect, async (req, res) => {
  try {
    // Destructure with fallbacks to handle different parameter naming
    const { 
      paymentMethodId, 
      cardholderName = req.body.nameOnCard, // Accept either cardholderName or nameOnCard
      last4
    } = req.body;
    
    console.log("Received card save request:", { paymentMethodId, cardholderName, last4 });
    
    // Extract token from request
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      });
    }
    
    // Get user from User service
    let user;
    // res.json({user: req.user._id, token: token})
    try {
      user = await UserService.getUserById(req.user._id, token);
      console.log('User fetched from User service:', user);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user information: ' + error.message
      });
    }
    
    // Attach the payment method to the customer
    let customerId = user.stripeCustomerId;
    
    // If user doesn't have a Stripe customer ID, create one
    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: req.user._id
        }
      });
      
      customerId = customer.id;
      
      // Update user with stripe customer ID via User service
      try {
        await UserService.updateUser(
          req.user._id, 
          { stripeCustomerId: customerId },
          token
        );
      } catch (error) {
        console.error('Error updating user with Stripe customer ID:', error);
        // Continue anyway since we have the customer ID
      }
    }
    
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    // Save the card details in your database
    const newCard = await Card.create({
      userId: req.user._id,
      cardholderName,
      last4,
      paymentMethodId,
      isDefault: true
    });
    
    res.status(200).json({
      success: true,
      message: 'Card saved successfully',
      card: {
        id: newCard._id,
        last4: newCard.last4,
        cardholderName: newCard.cardholderName
      }
    });
  } catch (error) {
    console.error('Save card error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save card'
    });
  }
});
// In your backend payments routes file
// GET direct database cards
router.get('/db-cards', protect, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user._id });
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards from database:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching cards'
    });
  }
});
// Get saved cards
router.get('/saved-cards', protect, async (req, res) => {
  try {
    // Extract token from request
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      });
    }
    
    // Get user from User service
    let user;
    try {
      user = await UserService.getUserById(req.user._id, token);
    } catch (error) {
      console.error('Error fetching user from User service:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user information'
      });
    }
    
    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        cards: []
      });
    }
    
    // Get saved payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });
    
    // Format cards for frontend
    const cards = paymentMethods.data.map(method => ({
      id: method.id,
      cardType: method.card.brand,
      cardNumber: `•••• •••• •••• ${method.card.last4}`,
      expiryDate: `${method.card.exp_month}/${method.card.exp_year}`,
      nameOnCard: method.billing_details.name || 'Card Holder',
      isDefault: user.defaultPaymentMethod === method.id
    }));
    
    res.json({
      success: true,
      cards
    });
  } catch (error) {
    console.error('Error fetching saved cards:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch saved cards'
    });
  }
});

module.exports = router;