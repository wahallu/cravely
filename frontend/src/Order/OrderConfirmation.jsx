import React, { useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
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
  FaInfo,
  FaClock,
  FaSpinner,
  FaUtensils
} from 'react-icons/fa';
import { useGetOrderByIdQuery } from '../Redux/slices/orderSlice';
import toast from 'react-hot-toast';

export default function OrderConfirmation() {
  const location = useLocation();
  const { orderId: urlOrderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the orderId - either from URL params or location state
  const orderId = urlOrderId || location.state?.orderDetails?.orderId;
  
  // Use RTK Query to fetch order data if we have an ID
  const {
    data: fetchedOrder,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError
  } = useGetOrderByIdQuery(orderId, {
    skip: !orderId, // Only skip if no orderId exists
    pollingInterval: 15000 // Poll for updates every 15 seconds
  });

  // Retrieve the order details passed from checkout or from API
  useEffect(() => {
    // If we have data from the API, use it (most up-to-date)
    if (fetchedOrder && !isOrderLoading) {
      setOrderDetails(fetchedOrder);
      setIsLoading(false);
      
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
    // Otherwise, if we have location state data, use that until API data arrives
    else if (location.state?.orderDetails && isOrderLoading) {
      setOrderDetails(location.state.orderDetails);
      setIsLoading(false);
      
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
  }, [location.state, fetchedOrder, isOrderLoading]);

  // Show error if API fetch fails
  useEffect(() => {
    if (isOrderError && orderError) {
      toast.error('Failed to load order details');
      console.error('Order fetch error:', orderError);
    }
  }, [isOrderError, orderError]);

  // Show loading state when fetching from API
  if (isLoading || isOrderLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <FaSpinner className="animate-spin text-orange-500 text-4xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Order Details</h2>
              <p className="text-gray-600">
                Please wait while we retrieve your order information...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If no order details (direct navigation without orderId), show a fallback
  if (!orderDetails && !isOrderLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-orange-100 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Order Details Found</h2>
              <p className="text-gray-600 mb-6">
                It seems you've navigated here directly without providing a valid order ID.
              </p>
              <Link 
                to="/orders" 
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mr-4"
              >
                <FaReceipt className="mr-2" /> View My Orders
              </Link>
              <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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

  const { items, total, customer, subtotal, tax, deliveryFee, status, createdAt } = orderDetails;
  console.log('Order Details:', orderDetails);
  
  // Ensure order ID is properly displayed
  const displayOrderId = orderId || orderDetails.id || orderDetails._id || 'N/A';
  
  // Calculate the amounts if not provided
  const orderSubtotal = subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderTax = tax || (orderSubtotal * 0.1); // 10% tax if not specified
  const orderDeliveryFee = deliveryFee || 1.99;
  const orderTotal = total || (orderSubtotal + orderTax + orderDeliveryFee);
  
  // Estimated delivery date (same day delivery)
  const orderDate = createdAt ? new Date(createdAt) : new Date();
  const deliveryDate = new Date(orderDate);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long', 
    day: 'numeric'
  });
  
  // Format created date
  const formattedOrderDate = orderDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get status indicator width based on order status
  const getStatusIndicatorWidth = () => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return '15%';
      case 'confirmed':
        return '40%';
      case 'preparing':
        return '65%';
      case 'out_for_delivery':
        return '90%';
      case 'delivered':
        return '100%';
      case 'canceled':
        return '100%';
      default:
        return '15%';
    }
  };

  // Get status text colors
  const getStatusTextColor = (statusName) => {
    if (!status) return 'text-gray-500';
    
    const currentStatus = status.toLowerCase();
    const statusOrder = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const statusIndex = statusOrder.indexOf(currentStatus);
    const thisStatusIndex = statusOrder.indexOf(statusName.toLowerCase());
    
    if (currentStatus === 'canceled') {
      return statusName.toLowerCase() === 'canceled' ? 'text-red-600 font-medium' : 'text-gray-400';
    } else if (thisStatusIndex <= statusIndex) {
      return 'text-orange-600 font-medium';
    } else {
      return 'text-gray-500';
    }
  };

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
              className={`bg-white rounded-xl shadow-lg overflow-hidden mb-8 border-t-4 ${
                status === 'canceled' ? 'border-red-500' : 'border-green-500'
              }`}
              variants={itemVariants}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <div className={`${
                      status === 'canceled' ? 'bg-red-100' : 'bg-orange-100'
                    } p-3 rounded-full`}>
                      {status === 'canceled' ? (
                        <FaTimes className="text-red-500 text-2xl" />
                      ) : (
                        <FaCheck className="text-orange-500 text-2xl" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {status === 'canceled' ? 'Order Canceled' : 'Order Placed!'}
                      </h1>
                      <p className="text-gray-600">
                        Status: <span className={`font-medium ${
                          status === 'canceled' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {status || 'Awaiting restaurant confirmation'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono font-bold text-gray-800">{displayOrderId}</p>
                  </div>
                </div>
                
                {status !== 'canceled' && (
                  <div className="mt-6">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-orange-500 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: getStatusIndicatorWidth() }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className={getStatusTextColor('pending')}>Order Placed</span>
                      <span className={getStatusTextColor('confirmed')}>Confirmed</span>
                      <span className={getStatusTextColor('preparing')}>Preparing</span>
                      <span className={getStatusTextColor('out_for_delivery')}>On the Way</span>
                    </div>
                  </div>
                )}
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
                        key={item.id || index}
                        className="flex justify-between items-center py-3 border-b border-gray-50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                      >
                        <div className="flex items-start">
                          <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-3">
                            {item.imageUrl || item.image ? (
                              <img 
                                src={item.imageUrl || item.image} 
                                alt={item.name}
                                className="h-full w-full object-cover rounded-full"
                              />
                            ) : (
                              item.name.charAt(0)
                            )}
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
                  {status === 'pending' && (
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
                  )}
                  
                  {status === 'confirmed' && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaCheck className="text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            Your order has been confirmed by the restaurant. They're preparing your food now!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {status === 'preparing' && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaUtensils className="text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            The restaurant is currently preparing your food. It will be ready for delivery soon!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {status === 'out_for_delivery' && (
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 my-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaTruck className="text-purple-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-purple-700">
                            Your order is on the way! Track your delivery in real-time on the order tracking page.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {status === 'delivered' && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaCheck className="text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            Your order has been delivered successfully! We hope you enjoy your meal.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {status === 'canceled' && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaTimes className="text-red-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            This order has been canceled. If you have any questions, please contact customer service.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">${orderSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-800">${orderTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-gray-800">${orderDeliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                      <span className="text-gray-800">Total</span>
                      <span className="text-xl text-orange-600">${orderTotal.toFixed(2)}</span>
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
                          {customer.address}
                          {customer.city && `, ${customer.city}`}
                          {customer.state && `, ${customer.state}`}
                          {customer.zipCode && ` ${customer.zipCode}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Delivery</p>
                        <p className="font-medium text-gray-800">
                          {formattedDeliveryDate}{' '}
                          {(orderDetails.deliveryWindow || orderDetails.estimatedDeliveryTime) && (
                            <span className="text-orange-500">
                              ({orderDetails.deliveryWindow || ''}
                              {orderDetails.estimatedDeliveryTime && ` by ${orderDetails.estimatedDeliveryTime}`})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaClock />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium text-gray-800">{formattedOrderDate}</p>
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
                          {customer.fullName || customer.name || 'Customer'}
                        </p>
                      </div>
                    </div>
                    
                    {(customer.email || orderDetails.email) && (
                      <div className="flex items-start">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                          <FaEnvelope />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">
                            {customer.email || orderDetails.email}
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
                          {customer.phone || orderDetails.phone || 'Not provided'}
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
                
                {/* Live tracking button for orders that are out for delivery */}
                {status === 'out_for_delivery' && (
                  <Link 
                    to={`/tracking/${displayOrderId}`} 
                    className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg text-center font-medium transition-all transform hover:-translate-y-1 flex items-center justify-center"
                  >
                    <FaTruck className="mr-2" /> Track Your Delivery
                  </Link>
                )}
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
