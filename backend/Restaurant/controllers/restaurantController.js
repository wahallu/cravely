const Restaurant = require("../models/restaurant");
const jwt = require("jsonwebtoken");

// @desc    Register a new restaurant
// @route   POST /api/restaurants/register
// @access  Public
exports.registerRestaurant = async (req, res, next) => {
  try {
    const {
      restaurantName,
      address,
      city,
      phone,
      email,
      password,
      cuisineType,
      description,
    } = req.body;

    // Check if restaurant already exists
    const existingRestaurant = await Restaurant.findOne({ email });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        error: "Email already in use",
      });
    }

    // Create new restaurant
    const restaurant = await Restaurant.create({
      name: restaurantName,
      address,
      city,
      phone,
      email,
      password,
      cuisineType,
      description,
    });

    // Generate JWT token with role included
    const token = jwt.sign(
      {
        id: restaurant._id,
        role: restaurant.role, // Include role in the token
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.status(201).json({
      success: true,
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        email: restaurant.email,
        status: restaurant.status,
        role: restaurant.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login restaurant
// @route   POST /api/restaurants/login
// @access  Public
exports.loginRestaurant = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findOne({ email }).select("+password");

    if (!restaurant) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await restaurant.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token with role included
    const token = jwt.sign(
      {
        id: restaurant._id,
        role: restaurant.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.status(200).json({
      success: true,
      token,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        email: restaurant.email,
        status: restaurant.status,
        role: restaurant.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant profile
// @route   GET /api/restaurants/profile
// @access  Private
exports.getRestaurantProfile = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant._id);

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant profile
// @route   PUT /api/restaurants/profile
// @access  Private
exports.updateRestaurantProfile = async (req, res, next) => {
  try {
    // Remove fields that shouldn't be updated
    const { password, email, ...updateData } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.restaurant._id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all restaurants (for admin use)
// @route   GET /api/restaurants
// @access  Public (would be restricted in a real app)
exports.getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find();

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant by ID (public)
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant status (for admin)
// @route   PUT /api/restaurants/:id/status
// @access  Private (Admin only)
exports.updateRestaurantStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value"
      });
    }

    // Update the restaurant status
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found"
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};
