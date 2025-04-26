const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrderById, 
  getUserOrders, 
  getRestaurantOrders, 
  updateOrderStatus, 
  cancelOrder,
  // Add new controller functions
  getAvailableOrders,
  assignDriver,
  getDriverOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Existing routes
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrderById);
router.get('/user/me', protect, getUserOrders);
router.get('/restaurant/:id', protect, authorize('admin', 'restaurant'), getRestaurantOrders);
router.put('/:id/status', protect, authorize('admin', 'restaurant', 'delivery'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

// New routes for driver functionality
router.get('/available-for-delivery', protect, authorize('delivery', 'driver'), getAvailableOrders);
router.put('/:id/assign-driver', protect, authorize('delivery', 'driver'), assignDriver);
router.get('/driver/:driverId', protect, authorize('delivery', 'driver'), getDriverOrders);
router.get(
  '/driver/my-orders', 
  protect,
  authorize('driver', 'delivery'),  
  getDriverOrders
);
module.exports = router;
