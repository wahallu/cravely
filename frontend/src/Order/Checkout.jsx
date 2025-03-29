import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "../Home/components/header";
import Footer from "../Home/components/footer";
// Import icons for enhanced visual appeal
import { FaUser, FaEnvelope, FaPhone, FaHome, FaCity, FaMapMarkerAlt, FaMapPin } from 'react-icons/fa';
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaCheck, FaShoppingCart } from 'react-icons/fa';

export default function Checkout() {
  // Sample cart summary data
  const cartSummary = {
    subtotal: 29.96,
    tax: 2.99,
    delivery: 1.99,
    total: 34.94,
    items: [
      { id: 1, name: "Mushroom Pizza", price: 7.49, quantity: 2 },
      { id: 2, name: "Italian Pizza", price: 7.49, quantity: 1 },
      { id: 3, name: "Sausage Pizza", price: 7.49, quantity: 1 }
    ]
  };

  // State for form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'creditCard',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  // State for animation
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate processing time
    setTimeout(() => {
      console.log("Order submitted:", formData);
      alert("Order placed successfully!");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-orange-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-orange-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-30"></div>
        
        {/* Checkout progress indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <FaShoppingCart />
              </div>
              <span className="text-sm mt-1 font-medium text-gray-600">Cart</span>
            </div>
            <div className="flex-1 h-1 bg-orange-500 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                <FaHome />
              </div>
              <span className="text-sm mt-1 font-medium text-gray-800">Checkout</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white shadow-lg">
                <FaCheck />
              </div>
              <span className="text-sm mt-1 font-medium text-gray-600">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column: Form */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 relative inline-block">
              Checkout
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-orange-500"></span>
            </h1>
            
            <form onSubmit={handleSubmit}>
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 transform transition-all hover:shadow-lg border-l-4 border-orange-500">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                  <FaHome className="mr-2 text-orange-500" /> 
                  <span>Shipping Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="transform transition-all hover:-translate-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaUser className="mr-2 text-orange-400" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="transform transition-all hover:-translate-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaEnvelope className="mr-2 text-orange-400" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="transform transition-all hover:-translate-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaPhone className="mr-2 text-orange-400" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div className="transform transition-all hover:-translate-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-orange-400" /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="transform transition-all hover:-translate-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaCity className="mr-2 text-orange-400" /> City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="New York"
                    />
                  </div>
                  <div className="transform transition-all hover:-translate-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-orange-400" /> State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="NY"
                    />
                  </div>
                  <div className="transform transition-all hover:-translate-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaMapPin className="mr-2 text-orange-400" /> ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 transform transition-all hover:shadow-lg border-l-4 border-orange-500">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                  <FaCreditCard className="mr-2 text-orange-500" /> 
                  <span>Payment Method</span>
                </h2>
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div 
                      className={`border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.paymentMethod === 'creditCard' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-orange-300'}`}
                      onClick={() => setFormData({...formData, paymentMethod: 'creditCard'})}
                    >
                      <FaCreditCard className={`text-3xl mb-2 ${formData.paymentMethod === 'creditCard' ? 'text-orange-500' : 'text-gray-500'}`} />
                      <label htmlFor="creditCard" className={`text-sm font-medium ${formData.paymentMethod === 'creditCard' ? 'text-orange-700' : 'text-gray-700'}`}>
                        Credit Card
                      </label>
                      <input
                        type="radio"
                        id="creditCard"
                        name="paymentMethod"
                        value="creditCard"
                        checked={formData.paymentMethod === 'creditCard'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.paymentMethod === 'paypal' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-orange-300'}`}
                      onClick={() => setFormData({...formData, paymentMethod: 'paypal'})}
                    >
                      <FaPaypal className={`text-3xl mb-2 ${formData.paymentMethod === 'paypal' ? 'text-orange-500' : 'text-gray-500'}`} />
                      <label htmlFor="paypal" className={`text-sm font-medium ${formData.paymentMethod === 'paypal' ? 'text-orange-700' : 'text-gray-700'}`}>
                        PayPal
                      </label>
                      <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-orange-300'}`}
                      onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                    >
                      <FaMoneyBillWave className={`text-3xl mb-2 ${formData.paymentMethod === 'cash' ? 'text-orange-500' : 'text-gray-500'}`} />
                      <label htmlFor="cash" className={`text-sm font-medium ${formData.paymentMethod === 'cash' ? 'text-orange-700' : 'text-gray-700'}`}>
                        Cash on Delivery
                      </label>
                      <input
                        type="radio"
                        id="cash"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                    </div>
                  </div>

                  {formData.paymentMethod === 'creditCard' && (
                    <div className="border border-gray-200 rounded-md p-6 bg-gray-50 shadow-inner animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaCreditCard className="mr-2 text-orange-400" /> Card Number
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input
                            type="text"
                            name="cardCvv"
                            value={formData.cardCvv}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="123"
                            maxLength="3"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right column: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6 border-t-4 border-orange-500">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <FaShoppingCart className="mr-2 text-orange-500" /> Order Summary
              </h2>
              
              <div className="mb-6 max-h-64 overflow-y-auto">
                {cartSummary.items.map(item => (
                  <div key={item.id} className="flex justify-between py-3 border-b border-gray-100 hover:bg-orange-50 transition-colors rounded px-2">
                    <div className="flex items-start">
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-3">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">${cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-800">${cartSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-gray-800">${cartSummary.delivery.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-2 border-gray-200">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-800">Total</span>
                    <span className="text-2xl text-orange-600">${cartSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Place Order</>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/cart" className="text-orange-500 hover:text-orange-700 text-sm font-medium flex items-center justify-center">
                  <FaShoppingCart className="mr-1" /> Return to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Add global CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
}
