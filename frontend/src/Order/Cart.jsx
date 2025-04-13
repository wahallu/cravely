import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotalAmount,
  removeFromCart,
  updateQuantity,
  toggleFavorite,
  clearCart
} from "../Redux/slices/cartSlice";
import { toast } from "react-hot-toast";

export default function RestaurantCart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get cart items from Redux state
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotalAmount);
  
  // Track selected items with local state
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  // Calculate estimated total based on selected items only
  const estimatedTotal = cartItems.reduce(
    (acc, item) => selectedItems[item.id] ? acc + item.price * item.quantity : acc,
    0
  );
  
  // Get count of selected items
  const selectedItemsCount = Object.values(selectedItems).filter(Boolean).length;

  // Remove item by ID
  const handleRemove = (id) => {
    dispatch(removeFromCart({ id }));
    toast.success("Item removed from cart");
  };

  // Increase/Decrease quantity
  const handleChangeQuantity = (id, delta) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };
  
  // Toggle favorite status
  const handleToggleFavorite = (id) => {
    dispatch(toggleFavorite({ id }));
  };

  // Handle item selection
  const handleSelectItem = (id) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // Check if all items are now selected
    const updatedSelection = {...selectedItems, [id]: !selectedItems[id]};
    const allSelected = cartItems.every(item => updatedSelection[item.id]);
    setSelectAll(allSelected);
  };

  // Handle select all items
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    // Update all individual selections
    const newSelectedItems = {};
    cartItems.forEach(item => {
      newSelectedItems[item.id] = newSelectAll;
    });
    setSelectedItems(newSelectedItems);
  };

  // Navigate to checkout page
  const handleCheckout = () => {
    // You could optionally only checkout with selected items
    navigate("/checkout");
  };

  // Brand colors
  const brandPrimary = "#ff6b00";
  const brandSecondary = "#ff8900";

  // Show empty cart message if no items
  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center py-16">
        <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to your cart and they will appear here.</p>
          <button
            onClick={() => navigate("/meals&menus")}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition"
          >
            Browse Meals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:flex md:space-x-6">
      {/* LEFT COLUMN: CART ITEMS */}
      <div className="md:w-2/3 mb-6 md:mb-0">
        {/* Header row with cart count and "select all" (functional) */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Cart ({cartItems.length})</h2>
          <div className="flex items-center space-x-2 text-sm">
            <input 
              type="checkbox" 
              id="selectAll" 
              checked={selectAll}
              onChange={handleSelectAll}
              style={{ accentColor: brandPrimary }}
            />
            <label htmlFor="selectAll" className="text-gray-600 cursor-pointer">
              Select all items
            </label>
          </div>
        </div>

        {/* "Delivered by ..." or "Dine in" notice (inspired by the screenshot) */}
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded mb-4">
          <span style={{ backgroundColor: brandPrimary }} className="text-white text-xs px-2 py-1 rounded">
            Choice
          </span>
          <span>Delivered by RestoExpress</span>
        </div>

        {/* Cart item list */}
        {cartItems.map((item) => (
          <div
            key={item.cartItemId || item.id}
            className="flex flex-col md:flex-row items-start md:items-center bg-white p-4 mb-4 rounded shadow-sm"
          >
            {/* Checkbox (functional) */}
            <div className="mr-3">
              <input 
                type="checkbox" 
                className="mt-1" 
                checked={selectedItems[item.cartItemId || item.id] || false}
                onChange={() => handleSelectItem(item.cartItemId || item.id)}
                style={{ accentColor: brandPrimary }}
              />
            </div>

            {/* Item image */}
            <img
              src={item.image || "/hero1.png"} // Use image directly, or a fallback
              alt={item.name}
              className="w-20 h-20 object-cover rounded-md mr-4 mb-2 md:mb-0"
            />

            {/* Item info */}
            <div className="flex-1">
              <div className="flex justify-between items-start md:items-center">
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    {item.name}
                  </h4>
                  {item.note && (
                    <p className="text-sm text-gray-500 mt-1">
                      Note: {item.note}
                    </p>
                  )}
                  <p className="text-sm mt-1" style={{ color: brandPrimary }}>
                    Only 1 left!
                  </p>
                </div>
                <div className="flex items-center">
                  {/* Heart/Favorite icon */}
                  <button 
                    onClick={() => handleToggleFavorite(item.cartItemId || item.id)} 
                    className="mr-4 focus:outline-none"
                  >
                    {item.isFavorite ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 20 20" style={{ color: brandPrimary }}>
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                  <div className="md:ml-4 text-gray-700 font-bold">
                    ${item.price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Quantity and remove controls */}
              <div className="flex items-center mt-3 space-x-4">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => handleChangeQuantity(item.cartItemId || item.id, -1)}
                    className="px-2 py-1 text-gray-700 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <div className="px-3 py-1">{item.quantity}</div>
                  <button
                    onClick={() => handleChangeQuantity(item.cartItemId || item.id, 1)}
                    className="px-2 py-1 text-gray-700 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(item.cartItemId || item.id)}
                  className="flex items-center text-white px-3 py-1 rounded transition-colors"
                  style={{ 
                    backgroundColor: brandPrimary,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = brandSecondary}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandPrimary}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>

              {/* Example "New diners" text, if you want a promo line */}
              <div className="text-xs text-gray-400 mt-2">
                New diners save ${Math.floor(item.price * 0.3).toFixed(2)} on
                this item!
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: SUMMARY */}
      <div className="md:w-1/3">
        <div className="bg-gray-50 p-4 rounded shadow-sm">
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Estimated total</span>
            <span className="font-semibold text-gray-800">
              ${(selectedItemsCount > 0 ? estimatedTotal : cartTotal).toFixed(2)}
            </span>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full py-3 mt-2 text-white font-semibold rounded transition-colors"
            style={{ 
              backgroundColor: brandPrimary,
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = brandSecondary}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandPrimary}
            disabled={selectedItemsCount === 0 && cartItems.length > 0}
          >
            Checkout {selectedItemsCount > 0 ? `(${selectedItemsCount})` : ''}
          </button>

          {/* Payment icons with corrected links */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Pay with</p>
            <div className="flex items-center space-x-2">
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                alt="Visa"
                className="w-10 h-6 object-contain"
              />
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mastercard.svg"
                alt="Mastercard"
                className="w-10 h-6 object-contain"
              />
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/paypal.svg"
                alt="PayPal"
                className="w-10 h-6 object-contain"
              />
            </div>
          </div>

          {/* Buyer protection note */}
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-semibold text-gray-700">Buyer protection</p>
            <p className="text-xs text-gray-500 mt-1">
              Get a full refund if your meal is not delivered or not as
              described.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
