import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetUserOrdersQuery, useCancelOrderMutation } from '../../src/Redux/slices/orderSlice';
import Header from '../../src/Home/components/header';
import Footer from '../../src/Home/components/footer';
import { 
  FaClipboardList, 
  FaMotorcycle, 
  FaRegClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSearch,
  FaCreditCard,
  FaMoneyBillWave,
  FaBan
} from 'react-icons/fa';
import { MdKeyboardArrowRight, MdDeliveryDining, MdLocalDining } from 'react-icons/md';
import { toast } from 'react-hot-toast';

export default function MyOrders() {
  // Fetch user orders
  const { data: ordersData, isLoading, error, refetch } = useGetUserOrdersQuery();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Set up filters for orders
  useEffect(() => {
    if (ordersData) {
      let filtered = [...ordersData];
      
      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(order => 
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply status filter
      if (activeFilter !== 'all') {
        filtered = filtered.filter(order => {
          if (activeFilter === 'live') {
            return ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status);
          } else if (activeFilter === 'completed') {
            return order.status === 'delivered';
          } else if (activeFilter === 'cancelled') {
            return order.status === 'canceled';
          }
          return true;
        });
      }
      
      setFilteredOrders(filtered);
    }
  }, [ordersData, searchTerm, activeFilter]);

  // Function to handle order cancellation
  const handleCancelOrder = async () => {
    try {
      if (!orderToCancel) return;
      
      await cancelOrder(orderToCancel.orderId).unwrap();
      setShowCancelModal(false);
      setOrderToCancel(null);
      toast.success('Order cancelled successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel order');
    }
  };

  // Function to open cancel confirmation modal
  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-indigo-100 text-indigo-700';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'canceled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaRegClock />;
      case 'confirmed': return <FaClipboardList />;
      case 'preparing': return <MdLocalDining />;
      case 'out_for_delivery': return <MdDeliveryDining />;
      case 'delivered': return <FaCheckCircle />;
      case 'canceled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaRegClock />;
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
  const getPaymentStatus = (order) => {
    const isCashOnDelivery = order.payment?.method === 'cash';
    const isCreditCard = order.payment?.method === 'card' || order.payment?.method === 'creditCard';
    
    if (isCashOnDelivery) {
      return {
        status: 'Cash on Delivery',
        icon: <FaMoneyBillWave className="text-orange-500" />,
        class: 'text-orange-600 bg-orange-50'
      };
    }
    
    if (isCreditCard) {
      return {
        status: 'Paid with Card',
        icon: <FaCheckCircle className="text-green-500" />,
        class: 'text-green-600 bg-green-50'
      };
    }
    
    // Fallback for other payment methods or unknown
    return {
      status: 'Payment Due',
      icon: <FaCreditCard className="text-orange-500" />,
      class: 'text-orange-600 bg-orange-50'
    };
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Page heading with animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage all your food orders</p>
          </motion.div>

          {/* Search and filters section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm mb-8 p-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search by order ID or restaurant"
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter buttons */}
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === 'all' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('all')}
                >
                  All Orders
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === 'live' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('live')}
                >
                  Live Orders
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors hidden md:block ${
                    activeFilter === 'completed' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('completed')}
                >
                  Completed
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors hidden md:block ${
                    activeFilter === 'cancelled' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveFilter('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </motion.div>

          {/* Live/Active Orders Section */}
          {activeFilter !== 'completed' && activeFilter !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaMotorcycle className="mr-2 text-orange-500" />
                Live Orders
              </h2>
              
              <div className="grid grid-cols-1 gap-6 mb-12">
                {isLoading ? (
                  // Loading skeletons
                  Array(2).fill().map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    Failed to load orders. Please try again.
                  </div>
                ) : (
                  filteredOrders.filter(order => 
                    ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
                  ).length > 0 ? (
                    filteredOrders.filter(order => 
                      ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
                    ).map(order => (
                      <motion.div
                        key={order.orderId}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Order header */}
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">
                                {order.restaurant?.name || 'Restaurant Name'}
                              </h3>
                              <p className="text-gray-500 text-sm mt-1">
                                Order #{order.orderId} • {formatDate(order.createdAt || new Date())}
                              </p>
                            </div>
                            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          {/* Payment Status */}
                          <div className="mt-3 flex items-center">
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatus(order).class}`}>
                              {getPaymentStatus(order).icon}
                              <span className="ml-1">{getPaymentStatus(order).status}</span>
                            </div>
                            <div className="ml-2 text-gray-700 font-medium">
                              ${order.total?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Order progress */}
                        <div className="bg-gray-50 px-5 py-3">
                          <div className="flex justify-between mb-1 text-xs text-gray-500">
                            {getOrderSteps(order.status).map((step, index) => (
                              <div key={index} className="text-center flex flex-col items-center">
                                <div className={`w-4 h-4 rounded-full mb-1 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className={step.completed ? 'text-green-600' : ''}>
                                  {step.name}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${getStatusProgress(order.status)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Order items */}
                        <div className="p-5">
                          <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
                          <div className="space-y-3">
                            {order.items?.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex items-center">
                                <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                      <MdLocalDining size={24} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <div className="flex justify-between">
                                    <h5 className="font-medium text-gray-800">{item.name}</h5>
                                    <span className="text-gray-700">${item.price?.toFixed(2) || '0.00'}</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                                    <span>Qty: {item.quantity}</span>
                                    <span>${(item.price * item.quantity)?.toFixed(2) || '0.00'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {(order.items?.length || 0) > 3 && (
                              <div className="text-center mt-2">
                                <button className="text-orange-500 text-sm font-medium hover:text-orange-600">
                                  + {(order.items?.length || 0) - 3} more items
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                          <div className="flex gap-2">
                            {['out_for_delivery', 'preparing'].includes(order.status) && (
                              <Link 
                                to={`/tracking/${order.orderId}`}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Track Order
                              </Link>
                            )}
                            
                            {/* Cancel button for pending and confirmed orders */}
                            {['pending', 'confirmed'].includes(order.status) && (
                              <button 
                                onClick={() => openCancelModal(order)}
                                className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                                disabled={isCancelling}
                              >
                                <FaBan className="mr-1" />
                                Cancel Order
                              </button>
                            )}
                          </div>
                          
                          <Link 
                            to={`/orders/${order.orderId}`}
                            className="flex items-center text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium"
                          >
                            View Details <MdKeyboardArrowRight size={18} />
                          </Link>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg text-center">
                      <p className="text-lg font-medium">No live orders at the moment</p>
                      <p className="mt-2">Why not explore some restaurants and place a new order?</p>
                      <Link to="/restaurants" className="mt-4 inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        Browse Restaurants
                      </Link>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}

          {/* Cancelled Orders Section - Only show when activeFilter is 'cancelled' */}
          {activeFilter === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaTimesCircle className="mr-2 text-red-500" />
                Cancelled Orders
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                  // Loading skeletons
                  Array(2).fill().map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    Failed to load cancelled orders. Please try again.
                  </div>
                ) : (
                  filteredOrders.filter(order => order.status === 'canceled').length > 0 ? (
                    filteredOrders.filter(order => order.status === 'canceled').map((order, index) => (
                      <motion.div
                        key={order.orderId}
                        className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-red-500"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center">
                                <FaTimesCircle className="text-red-500 mr-2" />
                                <h3 className="font-bold text-gray-800">
                                  {order.restaurant?.name || 'Restaurant Name'}
                                </h3>
                              </div>
                              <p className="text-gray-500 text-sm mt-1">
                                Order #{order.orderId} • {formatDate(order.createdAt || new Date())}
                              </p>
                            </div>
                            <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                              Cancelled
                            </div>
                          </div>
                          
                          <div className="mt-4 py-3 px-4 bg-red-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="text-red-600 font-medium">Order Cancelled</div>
                              <div className="text-gray-700 font-bold">${order.total?.toFixed(2) || '0.00'}</div>
                            </div>
                            
                            {order.cancelReason && (
                              <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Reason:</span> {order.cancelReason}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {order.items?.slice(0, 4).map((item, i) => (
                              <div key={i} className="flex items-center bg-gray-50 rounded-full px-3 py-1 text-sm">
                                <span className="font-medium mr-1">{item.quantity}×</span> {item.name}
                              </div>
                            ))}
                            {(order.items?.length || 0) > 4 && (
                              <div className="bg-gray-50 rounded-full px-3 py-1 text-sm">
                                +{(order.items?.length || 0) - 4} more
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button 
                              className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
                              onClick={() => {
                                // Copy order items to a new order
                                // Implementation depends on your app's order flow
                              }}
                            >
                              Order Again
                            </button>
                            <Link 
                              to={`/orders/${order.orderId}`}
                              className="text-gray-500 hover:text-gray-700 flex items-center"
                            >
                              View Details <MdKeyboardArrowRight size={18} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 bg-gray-50 p-8 rounded-xl text-center">
                      <FaClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No cancelled orders</h3>
                      <p className="mt-2 text-gray-500">You don't have any cancelled orders yet.</p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}

          {/* Past Orders Section */}
          {activeFilter !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaClipboardList className="mr-2 text-orange-500" />
                Order History
              </h2>
              
              {isLoading ? (
                // Loading skeleton
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="animate-pulse">
                    {Array(3).fill().map((_, i) => (
                      <div key={i} className="p-6 border-b border-gray-100">
                        <div className="flex justify-between">
                          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                  Failed to load order history. Please try again.
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {filteredOrders.filter(order => 
                    ['delivered', 'canceled'].includes(order.status)
                  ).length > 0 ? (
                    filteredOrders.filter(order => 
                      ['delivered', 'canceled'].includes(order.status)
                    ).map((order, index) => (
                      <motion.div
                        key={order.orderId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-5 hover:bg-gray-50 transition-colors ${
                          index !== filteredOrders.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="md:flex md:justify-between md:items-start">
                          <div className="flex items-start">
                            <div className="hidden md:block mr-4">
                              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                                {getStatusIcon(order.status)}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-800">
                                  {order.restaurant?.name || 'Restaurant Name'}
                                </h3>
                                <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1 capitalize">
                                    {order.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-3 mt-1 text-sm">
                                <span className="text-gray-500">Order #{order.orderId}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">{formatDate(order.createdAt || new Date())}</span>
                              </div>
                              
                              {/* Payment info */}
                              <div className="mt-2 flex items-center">
                                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatus(order).class}`}>
                                  {getPaymentStatus(order).icon}
                                  <span className="ml-1">{getPaymentStatus(order).status}</span>
                                </div>
                              </div>
                              
                              {/* Item images in a row */}
                              <div className="mt-3 flex space-x-2">
                                {order.items?.slice(0, 3).map((item, i) => (
                                  <div key={i} className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <MdLocalDining size={18} />
                                      </div>
                                    )}
                                    {item.quantity > 1 && (
                                      <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-tl-md">
                                        {item.quantity}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {(order.items?.length || 0) > 3 && (
                                  <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium">
                                    +{(order.items?.length || 0) - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 flex items-center justify-between md:flex-col md:items-end">
                            <div className="font-bold text-gray-800 text-lg">${order.total?.toFixed(2) || '0.00'}</div>
                            
                            <div className="flex items-center mt-2">
                              <Link 
                                to={`/orders/${order.orderId}`}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
                              >
                                Details <MdKeyboardArrowRight size={18} />
                              </Link>
                            </div>
                          </div>
                        </div>
                        
                        {order.status === 'delivered' && (
                          <div className="mt-4 flex">
                            <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                              Order Again
                            </button>
                            <div className="mx-2 text-gray-300">|</div>
                            <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                              Leave Review
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No past orders found</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* No orders state */}
          {!isLoading && !error && filteredOrders.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center mt-8"
            >
              <div className="h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClipboardList className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet, or no orders match your search criteria.
              </p>
              <Link 
                to="/meals&menus" 
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Meals
              </Link>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <FaTimesCircle className="text-red-500 mr-2" />
              Cancel Order
            </h3>
            <p className="mt-4 text-gray-600">
              Are you sure you want to cancel your order from {orderToCancel?.restaurant?.name}?
              This action cannot be undone.
            </p>
            
            {orderToCancel?.items && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
                <div className="space-y-2">
                  {orderToCancel.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.quantity}× {item.name}</span>
                      <span className="text-gray-600">${(item.price * item.quantity)?.toFixed(2) || '0.00'}</span>
                    </div>
                  ))}
                  {(orderToCancel.items.length > 3) && (
                    <div className="text-sm text-gray-500">
                      + {orderToCancel.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center"
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <Footer />
    </>
  );
}