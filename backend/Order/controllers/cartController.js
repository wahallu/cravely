
// Add at the top of cartController.js
const Cart = require('../models/Cart');
/**
 * Get cart contents
 * @route GET /api/cart
 * @access Private
 */
const getCart = async (req, res) => {
  try {
    // For now, we'll just return a sample cart or empty cart
    // In a real implementation, you'd fetch from database
    const cart = {
      userId: req.user._id,
      items: [],
      total: 0
    };
    
    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Add item to cart
 * @route POST /api/cart/items
 * @access Private
 */
const addToCart = async (req, res) => {
  try {
    const { itemId, name, price, quantity, imageUrl, note, restaurantId } = req.body;
    
    if (!itemId || !quantity || !price || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Find the user's cart or create a new one
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      // If restaurantId is not provided when creating a new cart
      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID is required for a new cart'
        });
      }
      
      // Create a new cart
      cart = new Cart({
        userId: req.user._id,
        restaurantId,
        items: []
      });
    } else if (restaurantId && cart.restaurantId !== restaurantId) {
      // If the user tries to add items from a different restaurant
      return res.status(400).json({
        success: false,
        message: 'Items from different restaurants cannot be added to the same cart'
      });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.id === itemId);
    
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
      
      // Update note if provided
      if (note) {
        cart.items[existingItemIndex].note = note;
      }
    } else {
      // Add new item
      cart.items.push({
        id: itemId,
        name,
        price,
        quantity,
        imageUrl: imageUrl || '',
        note: note || '',
        isFavorite: false
      });
    }
    
    // Save cart to database
    await cart.save();
    
    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update cart item
 * @route PUT /api/cart/items/:itemId
 * @access Private
 */
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quantity'
      });
    }
    
    // Mock successful update
    res.status(200).json({
      success: true,
      message: 'Cart item updated'
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/items/:itemId
 * @access Private
 */
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Mock successful removal
    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Clear cart
 * @route DELETE /api/cart
 * @access Private
 */
const clearCart = async (req, res) => {
  try {
    // Mock successful clear
    res.status(200).json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};