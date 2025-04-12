const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrderById, 
  getUserOrders, 
  getRestaurantOrders, 
  updateOrderStatus, 
  cancelOrder 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Create a new order
router.post('/', protect, createOrder);

// Get order by ID
router.get('/:id', protect, getOrderById);

// Get all user orders
router.get('/user/me', protect, getUserOrders);

// Get all restaurant orders
router.get('/restaurant/:id', protect, authorize('admin', 'restaurant'), getRestaurantOrders);

// Update order status
router.put('/:id/status', protect, authorize('admin', 'restaurant', 'delivery'), updateOrderStatus);

// Cancel an order
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
