// routes/shippingAddressRoutes.js
const express = require('express');
const router = express.Router();
const shippingAddressController = require('../controllers/shippingAddressController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Shipping address routes
router.get('/', shippingAddressController.getUserAddresses);
router.post('/', shippingAddressController.addAddress);
router.put('/:addressId', shippingAddressController.updateAddress);
router.delete('/:addressId', shippingAddressController.deleteAddress);
router.put('/:addressId/default', shippingAddressController.setDefaultAddress);

module.exports = router;