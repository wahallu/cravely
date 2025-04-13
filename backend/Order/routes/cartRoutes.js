const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// Get cart contents
router.get('/', protect, getCart);

// Add item to cart
router.post('/items', protect, addToCart);

// Update cart item
router.put('/items/:itemId', protect, updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', protect, removeFromCart);

// Clear cart
router.delete('/', protect, clearCart);

module.exports = router;