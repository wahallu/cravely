const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
// Load environment variables properly
require('dotenv').config();

// Initialize Stripe with the API key from environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Make sure these routes are registered and working properly

router.post('/payments/create-intent', protect, async (req, res) => {
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
    const { paymentMethodId, cardholderName, last4 } = req.body;
    
    // Attach the payment method to the customer
    // First ensure the user has a Stripe customer ID
    let customerId;
    // This would typically be stored in your user database
    // Here, we're creating a new one for simplicity
    
    // Check if user already has a Stripe customer ID
    const user = await User.findById(req.user._id);
    
    if (user.stripeCustomerId) {
      customerId = user.stripeCustomerId;
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: req.user._id
        }
      });
      
      customerId = customer.id;
      
      // Save the customer ID to the user
      await User.findByIdAndUpdate(req.user._id, {
        stripeCustomerId: customerId
      });
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

// Get saved cards
router.get('/saved-cards', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
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