const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrderById, 
  getUserOrders, 
  getRestaurantOrders, 
  updateOrderStatus, 
  cancelOrder,
  getAvailableOrders,
  assignDriver,
  getDriverOrders,
  completeDelivery
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Define specific routes BEFORE parameterized routes
// New routes for driver functionality
router.get('/available-for-delivery', protect, authorize('delivery', 'driver'), getAvailableOrders);
router.get('/user/me', protect, getUserOrders);
router.get('/driver/my-orders', protect, authorize('driver', 'delivery'), getDriverOrders);

// Then define parameterized routes
router.get('/restaurant/:id', protect, authorize('admin', 'restaurant'), getRestaurantOrders);
router.get('/driver/:driverId', protect, authorize('delivery', 'driver'), getDriverOrders);
router.get('/:id', protect, getOrderById);

// Order action routes
router.post('/', protect, createOrder);
router.put('/:id/status', protect, authorize('admin', 'restaurant', 'delivery', 'driver'), updateOrderStatus);
router.put('/:id/assign-driver', protect, authorize('delivery', 'driver'), assignDriver);
router.put('/:id/delivered', protect, authorize('driver', 'delivery'), completeDelivery);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
