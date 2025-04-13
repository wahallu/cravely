const express = require('express');
const { signup, login } = require('../controllers/authController');
const { updateUser, deleteUser, getAllUsers, getUserById } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authenticate');
const router = express.Router();

// Authentication routes
router.post('/signup', signup); // User signup
router.post('/login', login); // User login

// User routes
router.get('/', authenticate, authorize, getAllUsers); // Get all users
router.get('/:id', authenticate, authorize, getUserById); // Get user by ID
router.put('/:id', authenticate, authorize, updateUser); // Update user information
router.delete('/:id', authenticate, authorize, deleteUser); // Delete user

module.exports = router;