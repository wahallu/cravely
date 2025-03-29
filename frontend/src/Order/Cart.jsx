import React, { useState } from "react";
import Header from "../Home/components/header"; // added header import

export default function MyCart() {
  // Sample cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Mushroom Pizza",
      price: 7.49,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
    },
    {
      id: 2,
      name: "Italian Pizza",
      price: 7.49,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
    },
    {
      id: 3,
      name: "Sausage Pizza",
      price: 7.49,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1571066811602-716837d681de?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
    },
    {
      id: 4,
      name: "Cheese Pizza",
      price: 7.49,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
    },
  ]);

  // Remove item from cart by id
  const handleRemove = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Increment item quantity
  const incrementQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrement item quantity
  const decrementQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  return (
    <>
        {/* Professional Styled Header */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4 pb-2">My Cart</h2>
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-50 to-white shadow-md transform hover:scale-105 transition-transform"
            >
              {/* Pizza Image */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-14 h-14 rounded-full object-cover border border-gray-200"
              />

              {/* Name and Quantity */}
              <div className="flex-1 ml-4">
                <div className="font-semibold text-gray-800">{item.name}</div>
                
                {/* Stylish Quantity Controls */}
                <div className="flex items-center mt-2">
                  <button 
                    onClick={() => decrementQuantity(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="mx-3 text-orange-600 font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => incrementQuantity(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="font-bold text-gray-900 mr-4">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Stylish Checkout Button */}
        <button 
          className="w-full py-3 text-white font-semibold rounded-lg shadow-lg transition-all"
          style={{ 
            background: "linear-gradient(to right, #FF6B00, #FF8900)",
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "linear-gradient(to right, #e66000, #e57a00)"}
          onMouseOut={(e) => e.currentTarget.style.background = "linear-gradient(to right, #FF6B00, #FF8900)"}
        >
          Checkout
        </button>
    </>
  );
}
