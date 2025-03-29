import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MdDelete, 
  MdAdd, 
  MdRemove, 
  MdArrowBack, 
  MdPayment, 
  MdLocalOffer, 
  MdRestaurant,
  MdLocationOn,
  MdDeliveryDining,
  MdInfo
} from 'react-icons/md';

export default function Cart() {
  // Mock data for cart items
  const [cartItems, setCartItems] = useState([
    { 
      id: 1, 
      name: 'Classic Cheeseburger', 
      price: 8.99, 
      quantity: 2, 
      restaurant: 'Burger Arena',
      image: '/hero1.png',
      options: ['Extra cheese', 'No onions']
    },
    { 
      id: 2, 
      name: 'Crispy Chicken Sandwich', 
      price: 7.99, 
      quantity: 1, 
      restaurant: 'Burger Arena',
      image: '/hero1.png',
      options: ['Spicy sauce']
    },
    { 
      id: 3, 
      name: 'French Fries (Large)', 
      price: 3.99, 
      quantity: 1, 
      restaurant: 'Burger Arena',
      image: '/hero1.png',
      options: []
    }
  ]);

  // State for promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Delivery options
  const [deliveryOption, setDeliveryOption] = useState('standard');

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'standard' ? 2.99 : deliveryOption === 'express' ? 4.99 : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax - promoDiscount;

  // Handle quantity change
  const handleQuantityChange = (id, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Handle item removal
  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Handle promo code application
  const applyPromoCode = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoDiscount(subtotal * 0.1); // 10% discount
      setPromoCodeApplied(true);
    } else if (promoCode.toUpperCase() === 'FREEDEL') {
      setPromoDiscount(deliveryFee);
      setPromoCodeApplied(true);
    } else {
      alert('Invalid promo code');
      setPromoCodeApplied(false);
      setPromoDiscount(0);
    }
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto p-4 md:p-6"
      >
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <MdShoppingCart className="text-5xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/restaurants">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Browse Restaurants
            </motion.button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto p-4 md:p-6"
    >
      <div className="mb-6">
        <Link to="/user" className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium">
          <MdArrowBack className="mr-2" />
          Continue Shopping
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">Your Cart (3 items)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center">
                <MdRestaurant className="text-orange-500 mr-2" />
                <h2 className="font-bold text-gray-800">Burger Arena</h2>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MdLocationOn className="mr-1" />
                <span>123 Main St, Springfield</span>
              </div>
            </div>

            <ul className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <motion.li 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-5"
                >
                  <div className="flex">
                    <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          {item.options.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.options.join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button 
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="px-3 py-1 text-gray-600 hover:text-orange-500"
                          >
                            <MdRemove />
                          </button>
                          <span className="px-3 py-1 border-x border-gray-200">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="px-3 py-1 text-gray-600 hover:text-orange-500"
                          >
                            <MdAdd />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-xl shadow-sm mt-6 p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center">
              <MdDeliveryDining className="mr-2 text-orange-500" />
              Delivery Options
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                <input 
                  type="radio" 
                  name="deliveryOption" 
                  value="standard"
                  checked={deliveryOption === 'standard'}
                  onChange={() => setDeliveryOption('standard')}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3 flex-grow">
                  <div className="font-medium text-gray-800">Standard Delivery</div>
                  <div className="text-sm text-gray-500">Estimated delivery: 30-45 minutes</div>
                </div>
                <div className="font-medium text-gray-800">$2.99</div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                <input 
                  type="radio" 
                  name="deliveryOption" 
                  value="express"
                  checked={deliveryOption === 'express'}
                  onChange={() => setDeliveryOption('express')}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3 flex-grow">
                  <div className="font-medium text-gray-800">Express Delivery</div>
                  <div className="text-sm text-gray-500">Estimated delivery: 15-25 minutes</div>
                </div>
                <div className="font-medium text-gray-800">$4.99</div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                <input 
                  type="radio" 
                  name="deliveryOption" 
                  value="pickup"
                  checked={deliveryOption === 'pickup'}
                  onChange={() => setDeliveryOption('pickup')}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3 flex-grow">
                  <div className="font-medium text-gray-800">Pickup</div>
                  <div className="text-sm text-gray-500">Ready in: 15-20 minutes</div>
                </div>
                <div className="font-medium text-gray-800">Free</div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
            
            {/* Promo Code */}
            <div className="mb-5">
              <div className="flex items-center mb-2">
                <MdLocalOffer className="text-orange-500 mr-2" />
                <h3 className="font-medium text-gray-700">Promo Code</h3>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoCodeApplied}
                  placeholder="Enter promo code"
                  className="flex-grow border border-gray-200 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  onClick={promoCodeApplied ? () => {
                    setPromoCodeApplied(false);
                    setPromoDiscount(0);
                    setPromoCode('');
                  } : applyPromoCode}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    promoCodeApplied
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {promoCodeApplied ? 'Remove' : 'Apply'}
                </button>
              </div>
              {promoCodeApplied && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <MdInfo className="mr-1" />
                  Promo code applied successfully!
                </div>
              )}
            </div>
            
            {/* Price Breakdown */}
            <div className="border-t border-b border-gray-100 py-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="text-gray-800">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-800">${tax.toFixed(2)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-xl text-gray-800">${total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-3">
              <Link to="/checkout">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <MdPayment className="mr-2" />
                  Proceed to Checkout
                </motion.button>
              </Link>
              
              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
