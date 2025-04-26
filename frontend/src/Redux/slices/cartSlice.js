import { createSlice } from "@reduxjs/toolkit";

// Update the loadCartFromStorage function to validate structure
const loadCartFromStorage = () => {
  try {
    const persistedCart = localStorage.getItem('cart');
    if (persistedCart) {
      const parsedCart = JSON.parse(persistedCart);
      // Validate the structure is intact
      if (parsedCart && typeof parsedCart === 'object' && 
          Array.isArray(parsedCart.items)) {
        return parsedCart;
      }
      // If invalid structure, throw to reset
      console.warn('Invalid cart structure in localStorage, resetting');
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    localStorage.removeItem('cart'); // Clean up corrupted data
  }
  return {
    items: [],
    totalItems: 0,
    totalAmount: 0,
  };
};

const initialState = loadCartFromStorage();

// Helper function to save cart to localStorage
const saveCartToStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, quantity = 1, addAsNew = false } = action.payload;
      
      // Ensure state has proper structure
      if (!state.items) {
        state.items = [];
      }
      
      // Generate a unique cart item ID if adding as new
      if (addAsNew) {
        const uniqueId = `${item.id}_${Date.now()}`;
        state.items.push({
          ...item,
          cartItemId: uniqueId,
          quantity,
          isFavorite: false,
        });
      } else {
        // Check if the exact same item already exists in cart
        const existingItem = state.items.find(
          (cartItem) => cartItem.id === item.id
        );

        if (existingItem) {
          // If item already exists, increase quantity
          existingItem.quantity += quantity;
        } else {
          // Add new item to cart
          state.items.push({
            ...item,
            cartItemId: item.id,
            quantity,
            isFavorite: false,
          });
        }
      }

      // Recalculate totals
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      
      // Save updated cart to localStorage
      saveCartToStorage(state);
    },
    removeFromCart: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter((item) => 
        item.id !== id && item.cartItemId !== id
      );

      // Recalculate totals
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      
      // Save updated cart to localStorage
      saveCartToStorage(state);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => 
        item.id === id || item.cartItemId === id
      );

      if (item) {
        item.quantity = Math.max(1, quantity);
      }

      // Recalculate totals
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      
      // Save updated cart to localStorage
      saveCartToStorage(state);
    },
    toggleFavorite: (state, action) => {
      const { id } = action.payload;
      const item = state.items.find((item) => 
        item.id === id || item.cartItemId === id
      );

      if (item) {
        item.isFavorite = !item.isFavorite;
      }
      
      // Save updated cart to localStorage
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      
      // Clear cart in localStorage
      localStorage.removeItem('cart');
    },
    setCartItems: (state, action) => {
      state.items = action.payload;
      
      // Recalculate totals
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      
      // Save updated cart to localStorage
      saveCartToStorage(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  toggleFavorite,
  clearCart,
  setCartItems, // Export the new action
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;

export default cartSlice.reducer;