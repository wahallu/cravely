// Add at the top of cartController.js
const Cart = require('../models/Cart');

/**
 * Helper function to compare IDs
 */
const compareIds = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString();
};

/**
 * Get cart contents
 * @route GET /api/cart
 * @access Private
 */
const getCart = async (req, res) => {
  try {
    // Ensure we have a user ID from the auth middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please log in again.'
      });
    }
    
    console.log('Getting cart for user:', req.user._id);
    
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          userId: req.user._id,
          items: [],
          total: 0
        }
      });
    }
    
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
    const { itemId, id, name, price, quantity, imageUrl, restaurantId } = req.body;
    
    // Make sure we have a userId from auth middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please log in again.'
      });
    }
    
    const userId = req.user._id;
    console.log('Adding item to cart for user:', userId);
    
    // Find the user's cart or create a new one
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create a new cart with the restaurantId
      cart = new Cart({ 
        userId,
        restaurantId,
        items: [],
      });
      console.log('Created new cart for user:', userId);
    } else if (cart.restaurantId !== restaurantId && cart.items.length > 0) {
      // If user tries to add items from a different restaurant, return an error
      return res.status(400).json({
        success: false,
        message: 'You have items from another restaurant in your cart. Please clear your cart first.'
      });
    } else {
      // Update restaurantId if cart is empty
      cart.restaurantId = restaurantId;
    }
    
    // Use the provided id or itemId as the item identifier
    const actualItemId = id || itemId || null;
    
    if (!actualItemId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    // Check if item already exists in cart using helper function
    const existingItemIndex = cart.items.findIndex(item => 
      compareIds(item.id, actualItemId)
    );
    
    if (existingItemIndex !== -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        id: actualItemId,
        name,
        price: Number(price), // Ensure price is stored as a number
        quantity,
        imageUrl,
        note: req.body.note || '',
        isFavorite: req.body.isFavorite || false
      });
    }
    
    // Save the updated cart
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
    
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find item using helper function
    const itemIndex = cart.items.findIndex(item => 
      compareIds(item.id, itemId)
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    cart.items[itemIndex].quantity = parseInt(quantity, 10);
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      item: cart.items[itemIndex]
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
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Filter items using helper function
    cart.items = cart.items.filter(item => 
      !compareIds(item.id, itemId)
    );
    
    await cart.save();
    
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
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
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