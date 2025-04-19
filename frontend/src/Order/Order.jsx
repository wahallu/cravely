import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '../Redux/slices/orderSlice';
import Header from '../Home/components/header';
import Footer from '../Home/components/footer';
import { toast } from 'react-hot-toast';
import { 
  FaReceipt, 
  FaShoppingBag, 
  FaUser, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaClock, 
  FaTruck, 
  FaTimesCircle, 
  FaCheckCircle, 
  FaRegClock, 
  FaClipboardList, 
  FaUtensils, 
  FaMotorcycle, 
  FaMoneyBillWave, 
  FaCreditCard,
  FaArrowLeft,
  FaInfo,
  FaInfoCircle,
  FaBan,
  FaSadTear,
  FaExchangeAlt,
  FaRegCommentDots
} from 'react-icons/fa';

export default function Order() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Cancel modal state variables
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelComment, setCancelComment] = useState('');
  const [cancelStep, setCancelStep] = useState(1); // 1: confirm, 2: reason, 3: final warning

  // Common reasons for cancellation
  const cancelReasons = [
    { id: 'changed_mind', text: 'Changed my mind', icon: <FaExchangeAlt /> },
    { id: 'long_wait', text: 'Wait time is too long', icon: <FaClock /> },
    { id: 'wrong_address', text: 'Incorrect delivery address', icon: <FaMapMarkerAlt /> },
    { id: 'duplicate', text: 'Duplicate order', icon: <FaClipboardList /> },
    { id: 'other', text: 'Other reason', icon: <FaRegCommentDots /> }
  ];

  // Fetch order details from Redux
  const { 
    data: orderData, 
    isLoading, 
    error, 
    refetch 
  } = useGetOrderByIdQuery(id);

  // Cancel order mutation
  const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();

  // Function to open cancel confirmation modal
  const openCancelModal = () => {
    setShowCancelModal(true);
    setCancelStep(1);
    setCancelReason('');
    setCancelComment('');
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    try {
      // No need to check for orderToCancel - we already have the id from useParams()
      
      // Pass the ID as the first argument and the data as the second argument
      await cancelOrder(id, {
        reason: cancelReason,
        comment: cancelComment
      }).unwrap();
      
      setShowCancelModal(false);
      setCancelReason('');
      setCancelComment('');
      setCancelStep(1);
      toast.success('Order cancelled successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel order');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format order status to be more user-friendly
  const formatOrderStatus = (status) => {
    if (!status) return 'Unknown';
    switch(status) {
      case 'pending': return 'Pending Confirmation';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'canceled': return 'Canceled';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
  };

  // Get status icon based on order status
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaRegClock className="text-yellow-500" />;
      case 'confirmed': return <FaClipboardList className="text-blue-500" />;
      case 'preparing': return <FaUtensils className="text-indigo-500" />;
      case 'out_for_delivery': return <FaMotorcycle className="text-purple-500" />;
      case 'delivered': return <FaCheckCircle className="text-green-500" />;
      case 'canceled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaRegClock className="text-gray-500" />;
    }
  };

  // Helper function to get status progress percentage
  const getStatusProgress = (status) => {
    switch(status) {
      case 'pending': return 10;
      case 'confirmed': return 30;
      case 'preparing': return 60;
      case 'out_for_delivery': return 85;
      case 'delivered': return 100;
      case 'canceled': return 0;
      default: return 0;
    }
  };

  // Helper function to get steps for progress bar
  const getOrderSteps = (status) => {
    const steps = [
      { name: 'Pending', completed: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(status) },
      { name: 'Confirmed', completed: ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(status) },
      { name: 'Preparing', completed: ['preparing', 'out_for_delivery', 'delivered'].includes(status) },
      { name: 'Delivery', completed: ['out_for_delivery', 'delivered'].includes(status) },
      { name: 'Delivered', completed: ['delivered'].includes(status) }
    ];
    return steps;
  };

  // Helper function for payment status
  const getPaymentStatus = (payment) => {
    if (!payment) return {
      status: 'Payment Unknown',
      icon: <FaRegClock className="text-gray-500" />,
      class: 'text-gray-600 bg-gray-100'
    };
    
    const isCashOnDelivery = payment.method === 'cash';
    const isCreditCard = payment.method === 'creditCard' || payment.method === 'card';
    
    if (isCashOnDelivery) {
      return {
        status: 'Cash on Delivery',
        icon: <FaMoneyBillWave className="text-orange-500" />,
        class: 'text-orange-600 bg-orange-50'
      };
    }
    
    if (isCreditCard) {
      if (payment.status === 'completed') {
        return {
          status: 'Paid with Card',
          icon: <FaCheckCircle className="text-green-500" />,
          class: 'text-green-600 bg-green-50'
        };
      } else {
        return {
          status: 'Card Payment Pending',
          icon: <FaCreditCard className="text-blue-500" />,
          class: 'text-blue-600 bg-blue-50'
        };
      }
    }
    
    // Fallback for other payment methods or unknown
    return {
      status: payment.status || 'Payment Pending',
      icon: <FaRegClock className="text-orange-500" />,
      class: 'text-orange-600 bg-orange-50'
    };
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
            <FaTimesCircle className="mx-auto text-red-500 text-5xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Order</h2>
            <p className="text-gray-600 mb-6">{error.data?.message || 'Could not load the order details. Please try again later.'}</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <Link 
                to="/orders" 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const order = orderData || {};

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back button and Order ID */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500">Order ID</span>
              <div className="font-mono font-bold text-lg">{order.orderId}</div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order details and status - Takes 2/3 of space on large screens */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${
                        order.status === 'delivered' ? 'bg-green-100' : 
                        order.status === 'canceled' ? 'bg-red-100' :
                        'bg-orange-100'
                      }`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {formatOrderStatus(order.status)}
                        </h2>
                        <p className="text-gray-600">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${getPaymentStatus(order.payment).class}`}>
                      {getPaymentStatus(order.payment).icon}
                      <span className="ml-1">{getPaymentStatus(order.payment).status}</span>
                    </div>
                  </div>
                  
                  {/* Order progress tracker */}
                  <div className="mt-8">
                    <div className="flex justify-between mb-1 text-xs text-gray-500">
                      {getOrderSteps(order.status).map((step, index) => (
                        <div key={index} className="text-center flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full mb-1 flex items-center justify-center ${
                            step.completed 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {step.completed && <FaCheckCircle className="text-xs" />}
                          </div>
                          <span className={step.completed ? 'text-green-600 font-medium' : ''}>
                            {step.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${getStatusProgress(order.status)}%`,
                          backgroundColor: order.status === 'canceled' ? '#EF4444' : undefined
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Possible actions based on order status */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button 
                        onClick={openCancelModal}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center"
                        disabled={isCanceling}
                      >
                        <FaTimesCircle className="mr-2" />
                        {isCanceling ? 'Canceling...' : 'Cancel Order'}
                      </button>
                    )}
                    
                    {['out_for_delivery', 'preparing'].includes(order.status) && (
                      <Link 
                        to={`/tracking/${order.orderId}`}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center"
                      >
                        <FaTruck className="mr-2" />
                        Track Order
                      </Link>
                    )}
                    
                    {['delivered'].includes(order.status) && (
                      <button 
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center"
                        onClick={() => {
                          // Implementation to reorder these items
                          toast.success('Reordering functionality to be implemented');
                        }}
                      >
                        <FaShoppingBag className="mr-2" />
                        Order Again
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            
              {/* Order Items Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaShoppingBag className="mr-2 text-orange-500" />
                    Order Items ({order.items?.length || 0})
                  </h2>
                  
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + (index * 0.05) }}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="h-16 w-16 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 mr-4">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-full w-full object-cover rounded-lg"
                              />
                            ) : (
                              <FaUtensils className="text-2xl" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                            <div className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Order Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800">${order.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-800">${order.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="text-gray-800">${order.deliveryFee?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-gray-100">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-bold text-xl text-orange-600">${order.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Delivery Information if canceled */}
              {order.status === 'canceled' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6"
                >
                  <div className="flex">
                    <FaTimesCircle className="text-red-500 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-red-800 text-lg">Order Canceled</h3>
                      <p className="text-red-700 mt-1">
                        This order was canceled {order.canceledAt ? `on ${formatDate(order.canceledAt)}` : ''}.
                      </p>
                      {order.cancelReason && (
                        <p className="mt-2 text-red-700">
                          <span className="font-medium">Reason:</span> {order.cancelReason}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Order sidebar with delivery and customer info - Takes 1/3 of space on large screens */}
            <div className="space-y-6">
              {/* Restaurant Information */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FaUtensils className="mr-2 text-orange-500" />
                    Restaurant
                  </h2>
                  
                  <div className="flex items-start">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg mr-4 flex-shrink-0 overflow-hidden">
                      {order.restaurant?.image ? (
                        <img 
                          src={order.restaurant?.image} 
                          alt={order.restaurant?.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <FaUtensils size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{order.restaurant?.name || 'Restaurant'}</h3>
                      {order.restaurant?.address && (
                        <p className="text-sm text-gray-500 mt-1">{order.restaurant.address}</p>
                      )}
                      {order.restaurant?.phone && (
                        <p className="text-sm text-gray-500 mt-1">{order.restaurant.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            
              {/* Customer Information */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
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
                          {order.customer?.fullName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {order.customer?.email && (
                      <div className="flex items-start">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                          <FaEnvelope />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">
                            {order.customer.email}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {order.customer?.phone && (
                      <div className="flex items-start">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                          <FaPhone />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">
                            {order.customer.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Delivery Information */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
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
                          {order.customer?.address ? 
                            `${order.customer.address}, ${order.customer.city || ''} ${order.customer.state || ''} ${order.customer.zipCode || ''}` 
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order Date & Time</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {order.estimatedDelivery && (
                      <div className="flex items-start">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                          <FaClock />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estimated Delivery</p>
                          <p className="font-medium text-gray-800">
                            {formatDate(order.estimatedDelivery)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Restaurant Specific Notes */}
              {order.notes && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FaInfo className="mr-2 text-orange-500" />
                      Order Notes
                    </h2>
                    
                    <p className="text-gray-700">{order.notes}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Enhanced Cancel Order Modal */}
      <AnimatePresence mode="wait">
        {showCancelModal && (
          <div className="fixed inset-0 pointer-events-auto flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                damping: 10,
                exit: { duration: 0.1 } 
              }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-red-50 p-6 border-b border-red-100">
                <div className="flex items-center">
                  <div className="bg-white shadow-sm rounded-full p-2 mr-4">
                    <FaTimesCircle className="text-red-500 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
                    <p className="text-red-600 text-sm mt-1">This action cannot be undone</p>
                  </div>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-5">
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to cancel your order? Once canceled:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <FaTimesCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                      <span>Your order will not be processed by the restaurant</span>
                    </li>
                    <li className="flex items-start">
                      <FaTimesCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                      <span>Any payment authorization will be released</span>
                    </li>
                    <li className="flex items-start">
                      <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                      <span>You'll have to place a new order if you change your mind</span>
                    </li>
                  </ul>
                </div>
                
                {/* Cancellation Reason */}
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Please select a reason for cancellation:
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a reason</option>
                    <option value="changed_mind">Changed my mind</option>
                    <option value="ordered_by_mistake">Ordered by mistake</option>
                    <option value="delivery_too_long">Delivery time too long</option>
                    <option value="payment_issues">Payment issues</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>
                
                {/* Buttons */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end mt-6">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex-1 sm:flex-none"
                  >
                    Keep My Order
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center flex-1 sm:flex-none"
                    disabled={isCanceling}
                  >
                    {isCanceling ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="mr-2" />
                        Cancel Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}