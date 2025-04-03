import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../Home/components/header';
import Footer from '../Home/components/footer';
import { 
  FaCheck, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaShoppingBag, 
  FaReceipt,
  FaArrowLeft,
  FaTruck,
  FaHome,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaInfo
} from 'react-icons/fa';

export default function OrderConfirmation() {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingStage, setLoadingStage] = useState(0);
  
  // Retrieve the order details passed from checkout
  useEffect(() => {
    if (location.state?.orderDetails) {
      setOrderDetails(location.state.orderDetails);
      
      // Stagger loading animation stages
      const timer1 = setTimeout(() => setLoadingStage(1), 400);
      const timer2 = setTimeout(() => setLoadingStage(2), 800);
      const timer3 = setTimeout(() => setLoadingStage(3), 1200);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [location.state]);

  // If no order details (direct navigation), show a fallback
  if (!orderDetails) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-orange-100 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Order Details Found</h2>
              <p className="text-gray-600 mb-6">
                It seems you've navigated here directly without completing a purchase.
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <FaArrowLeft className="mr-2" /> Return to Homepage
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 } 
    }
  };

  const { orderId, items, total, customer } = orderDetails;
  
  // Estimated delivery date (2 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long', 
    day: 'numeric'
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Confetti overlay */}
        <div className="fixed inset-0 pointer-events-none z-10 opacity-30">
          <div className="confetti-container">
            {Array.from({ length: 100 }).map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  backgroundColor: ['#FF6B00', '#FFB800', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          {/* Progress indicator */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <FaShoppingBag />
                </div>
                <span className="text-sm mt-1 font-medium text-gray-600">Cart</span>
              </div>
              <div className="flex-1 h-1 bg-orange-500 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <FaHome />
                </div>
                <span className="text-sm mt-1 font-medium text-gray-600">Checkout</span>
              </div>
              <div className="flex-1 h-1 bg-orange-500 mx-2"></div>
              <div className="flex flex-col items-center">
                <motion.div 
                  className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg relative"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.5 }}
                >
                  <FaCheck className="text-xl" />
                  <motion.div 
                    className="absolute w-full h-full rounded-full border-4 border-green-500"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
                <span className="text-sm mt-1 font-medium text-gray-800">Confirmation</span>
              </div>
            </div>
          </div>

          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Success Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border-t-4 border-green-500"
              variants={itemVariants}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <FaCheck className="text-orange-500 text-2xl" />
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
                      <p className="text-gray-600">Awaiting restaurant confirmation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono font-bold text-gray-800">{orderId}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-orange-500 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: "15%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="font-medium text-orange-600">Order Placed</span>
                    <span className="text-orange-500">Awaiting Confirmation</span>
                    <span className="text-gray-500">Preparing</span>
                    <span className="text-gray-500">On the Way</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Details */}
              <motion.div 
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                  <h2 className="text-xl font-semibold mb-4 pb-4 border-b border-gray-100 flex items-center">
                    <FaReceipt className="mr-2 text-orange-500" />
                    Order Details
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex justify-between items-center py-3 border-b border-gray-50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                      >
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
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Restaurant confirmation notice */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaInfo className="text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Your payment has been processed successfully. Your order has been sent to the restaurant
                          and is awaiting confirmation. You'll receive a notification once the restaurant confirms
                          your order.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">${(total - 4.98).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax & Fees</span>
                      <span className="text-gray-800">$4.98</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                      <span className="text-gray-800">Total</span>
                      <span className="text-xl text-orange-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Delivery & Customer Info */}
              <motion.div className="space-y-6" variants={itemVariants}>
                {/* Delivery Info */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center">
                    <FaTruck className="mr-2 text-orange-500" />
                    Delivery Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Delivery Address</p>
                        <p className="font-medium text-gray-800">
                          {customer.address}, {customer.city}, {customer.state} {customer.zipCode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Delivery</p>
                        <p className="font-medium text-gray-800">{formattedDeliveryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Customer Info */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center">
                    <FaUser className="mr-2 text-orange-500" />
                    Customer Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaUser />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-800">
                          {customer.fullName}
                        </p>
                      </div>
                    </div>
                    
                    {customer.email && (
                      <div className="flex items-start">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                          <FaEnvelope />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaPhone />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800">
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Link 
                    to="/orders" 
                    className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg flex-1 text-center font-medium transition-all transform hover:-translate-y-1"
                  >
                    View All Orders
                  </Link>
                  <Link 
                    to="/" 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex-1 text-center font-medium transition-all transform hover:-translate-y-1"
                  >
                    Back to Home
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
      
      {/* Confetti animation styles */}
      <style jsx global>{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 20px;
          opacity: 0.7;
          border-radius: 0 3px 3px 0;
          animation: confetti-fall 8s ease-in-out infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
