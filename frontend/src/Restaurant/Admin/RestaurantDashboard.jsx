import React, { useState, useEffect } from 'react';
import { MdArrowUpward, MdArrowDownward, MdNotifications, MdSearch } from 'react-icons/md';
import { FaMoneyBillWave, FaStar, FaUtensils } from 'react-icons/fa';
import { motion } from 'motion/react';
import { useNotification } from '../../Order/NotifyContext';
import { useGetRestaurantProfileQuery } from '../../Redux/slices/restaurantSlice';
import { useGetRestaurantOrdersQuery, useUpdateOrderStatusMutation } from '../../Redux/slices/restaurantOrderApi';
import { useGetMealsQuery } from '../../Redux/slices/mealSlice';
import { getRestaurantInfo } from '../../utils/restaurantAuth';
import toast from 'react-hot-toast';

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);
  const { showNotification } = useNotification();

  // Get the restaurant ID from auth
  const restaurantInfo = getRestaurantInfo();
  const restaurantId = restaurantInfo?.id;
  
  // Fetch restaurant profile data
  const { data: restaurantProfileData, isLoading: isLoadingProfile } = useGetRestaurantProfileQuery(restaurantId);
  
  // Fetch restaurant orders
  const { data: ordersData, isLoading: isLoadingOrders } = useGetRestaurantOrdersQuery({ restaurantId });
  
  // Fetch restaurant meals
  const { data: mealsData, isLoading: isLoadingMeals } = useGetMealsQuery();
  
  // Order status update mutation
  const [updateOrderStatus, { isLoading: isUpdatingOrder }] = useUpdateOrderStatusMutation();
  
  // Processed restaurant statistics
  const [restaurantStats, setRestaurantStats] = useState({
    name: "",
    rating: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    compareToLastMonth: 0,
  });
  
  // Process the restaurant profile and order data to calculate statistics
  useEffect(() => {
    if (restaurantProfileData && ordersData) {
      const restaurant = restaurantProfileData;
      const orders = ordersData.orders || [];
      
      // Calculate order counts by status
      const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'confirmed').length;
      const processingOrders = orders.filter(order => order.status === 'preparing' || order.status === 'out_for_delivery').length;
      const completedOrders = orders.filter(order => order.status === 'delivered').length;
      const canceledOrders = orders.filter(order => order.status === 'canceled').length;
      
      // Calculate revenue metrics
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      
      // Calculate today's revenue
      const today = new Date().toDateString();
      const todayRevenue = orders
        .filter(order => new Date(order.createdAt).toDateString() === today)
        .reduce((sum, order) => sum + order.total, 0);
      
      // Calculate weekly revenue
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyRevenue = orders
        .filter(order => new Date(order.createdAt) >= oneWeekAgo)
        .reduce((sum, order) => sum + order.total, 0);
      
      // Calculate monthly revenue and comparison
      const thisMonth = new Date().getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      
      const currentMonthRevenue = orders
        .filter(order => new Date(order.createdAt).getMonth() === thisMonth)
        .reduce((sum, order) => sum + order.total, 0);
      
      const lastMonthRevenue = orders
        .filter(order => new Date(order.createdAt).getMonth() === lastMonth)
        .reduce((sum, order) => sum + order.total, 0);
      
      // Calculate percentage change
      const percentIncrease = lastMonthRevenue === 0 
        ? 100 
        : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      
      setRestaurantStats({
        name: restaurant.name || restaurantInfo?.name || "Restaurant",
        rating: restaurant.rating || 0,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
        processingOrders: processingOrders,
        completedOrders: completedOrders,
        canceledOrders: canceledOrders,
        todayRevenue: todayRevenue,
        weeklyRevenue: weeklyRevenue,
        monthlyRevenue: currentMonthRevenue,
        compareToLastMonth: percentIncrease,
      });
    }
  }, [restaurantProfileData, ordersData]);
  
  // Process menu items to find popular ones
  const [popularItems, setPopularItems] = useState([]);
  
  useEffect(() => {
    if (ordersData && mealsData) {
      const orders = ordersData.orders || [];
      const meals = mealsData || [];
      
      // Count occurrences of each item in orders
      const itemCounts = {};
      const itemRevenue = {};
      
      orders.forEach(order => {
        order.items.forEach(item => {
          const itemId = item.id || item._id;
          itemCounts[itemId] = (itemCounts[itemId] || 0) + item.quantity;
          itemRevenue[itemId] = (itemRevenue[itemId] || 0) + (item.price * item.quantity);
        });
      });
      
      // Map counts to meal objects and sort by popularity
      const popularMeals = meals
        .map(meal => ({
          id: meal._id || meal.id,
          name: meal.name,
          orders: itemCounts[meal._id || meal.id] || 0,
          revenue: itemRevenue[meal._id || meal.id] || 0,
          image: meal.image || '/hero1.png'
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 4);
      
      setPopularItems(popularMeals);
    }
  }, [ordersData, mealsData]);
  
  // Get recent customer reviews
  const [customerReviews, setCustomerReviews] = useState([]);
  
  useEffect(() => {
    if (ordersData) {
      const orders = ordersData.orders || [];
      
      // Filter orders with reviews
      const reviewsFromOrders = orders
        .filter(order => order.review && order.review.rating)
        .map(order => ({
          customer: order.customer?.fullName || 'Anonymous',
          rating: order.review.rating,
          comment: order.review.comment || 'Great food!',
          time: new Date(order.updatedAt).toLocaleDateString()
        }))
        .slice(0, 3);
      
      setCustomerReviews(reviewsFromOrders);
    }
  }, [ordersData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-600';
      case 'preparing':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-600';
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'canceled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus, estimatedTime) => {
    try {
      await updateOrderStatus({
        orderId, 
        status: newStatus
      }).unwrap();
      
      showNotification({
        orderId,
        status: newStatus,
        restaurant: restaurantStats.name,
        estimatedTime: estimatedTime
      });
      
      toast.success(`Order ${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Format recent orders data
  const recentOrders = ordersData?.orders 
    ? ordersData.orders
      .slice(0, 5)
      .map(order => ({
        id: order.orderId || order._id,
        customer: order.customer?.fullName || 'Guest',
        items: order.items?.length || 0,
        total: order.total || 0,
        status: order.status,
        time: getTimeAgo(order.createdAt),
        address: order.customer?.address || 'N/A'
      }))
    : [];
    
  // Helper function to format time ago
  function getTimeAgo(timestamp) {
    if (!timestamp) return 'N/A';
    
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  }

  // Loading state
  if (isLoadingProfile || isLoadingOrders) {
    return (
      <div className="flex h-screen bg-gray-100 justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Today\'s Revenue', value: `$${restaurantStats.todayRevenue.toFixed(2)}`, icon: <FaMoneyBillWave className="text-white" />, bgColor: 'bg-gradient-to-r from-green-400 to-green-500', increase: restaurantStats.todayRevenue > 0, percent: 8.2 },
                  { title: 'Total Orders', value: restaurantStats.totalOrders, icon: <FaUtensils className="text-white" />, bgColor: 'bg-gradient-to-r from-blue-400 to-blue-500', increase: restaurantStats.totalOrders > 0, percent: 5.4 },
                  { title: 'Monthly Revenue', value: `$${restaurantStats.monthlyRevenue.toFixed(2)}`, icon: <FaMoneyBillWave className="text-white" />, bgColor: 'bg-gradient-to-r from-orange-400 to-orange-500', increase: restaurantStats.compareToLastMonth > 0, percent: Math.abs(restaurantStats.compareToLastMonth).toFixed(1) },
                  { title: 'Average Rating', value: restaurantStats.rating, icon: <FaStar className="text-white" />, bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-500', increase: true, percent: 0.3 },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">{stat.title}</p>
                          <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className="flex items-center mt-4">
                        {stat.increase ? (
                          <MdArrowUpward className="text-green-500 mr-1" />
                        ) : (
                          <MdArrowDownward className="text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${stat.increase ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.percent}% {stat.increase ? 'Increase' : 'Decrease'}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">vs. last period</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: 'Pending Orders', value: restaurantStats.pendingOrders, color: 'text-yellow-500 bg-yellow-100' },
                  { title: 'Processing Orders', value: restaurantStats.processingOrders, color: 'text-blue-500 bg-blue-100' },
                  { title: 'Completed Orders', value: restaurantStats.completedOrders, color: 'text-green-500 bg-green-100' },
                  { title: 'Canceled Orders', value: restaurantStats.canceledOrders, color: 'text-red-500 bg-red-100' },
                ].map((status, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-gray-700">{status.title}</h3>
                      <span className={`text-xl font-bold rounded-full h-10 w-10 flex items-center justify-center ${status.color}`}>
                        {status.value}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <motion.div 
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                  </div>
                  {isLoadingOrders ? (
                    <div className="p-6 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {recentOrders.map((order, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.time}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex space-x-2">
                                    {order.status !== 'confirmed' && order.status === 'pending' && (
                                      <button
                                        onClick={() => handleOrderStatusUpdate(
                                          order.id, 
                                          'confirmed',
                                          '30-45 min'
                                        )}
                                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                        disabled={isUpdatingOrder}
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    {order.status !== 'preparing' && order.status === 'confirmed' && (
                                      <button
                                        onClick={() => handleOrderStatusUpdate(
                                          order.id, 
                                          'preparing', 
                                          '20-30 min'
                                        )}
                                        className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs"
                                        disabled={isUpdatingOrder}
                                      >
                                        Preparing
                                      </button>
                                    )}
                                    {order.status !== 'out_for_delivery' && order.status === 'preparing' && (
                                      <button
                                        onClick={() => handleOrderStatusUpdate(
                                          order.id, 
                                          'out_for_delivery',
                                          '10-15 min'
                                        )}
                                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                                        disabled={isUpdatingOrder}
                                      >
                                        Out for Delivery
                                      </button>
                                    )}
                                    {order.status !== 'delivered' && order.status === 'out_for_delivery' && (
                                      <button
                                        onClick={() => handleOrderStatusUpdate(
                                          order.id, 
                                          'delivered',
                                          null
                                        )}
                                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                                        disabled={isUpdatingOrder}
                                      >
                                        Delivered
                                      </button>
                                    )}
                                    {order.status !== 'canceled' && order.status !== 'delivered' && (
                                      <button
                                        onClick={() => handleOrderStatusUpdate(
                                          order.id, 
                                          'canceled',
                                          null
                                        )}
                                        className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
                                        disabled={isUpdatingOrder}
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-4 border-t border-gray-100 text-center">
                        <button className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm">
                          View All Orders
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>

                {/* Popular Menu Items */}
                <motion.div 
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Most Popular Items</h3>
                  </div>
                  {isLoadingMeals ? (
                    <div className="p-6 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : (
                    <>
                      <div className="p-6">
                        {popularItems.length > 0 ? popularItems.map((item, index) => (
                          <div key={index} className="flex items-center mb-6 last:mb-0">
                            <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                            <div className="ml-4 flex-1">
                              <h4 className="font-medium text-gray-800">{item.name}</h4>
                              <div className="flex items-center mt-1 space-x-4">
                                <span className="text-sm text-gray-500">{item.orders} orders</span>
                                <span className="text-sm font-medium text-green-600">${item.revenue.toFixed(2)} revenue</span>
                              </div>
                            </div>
                            <div className="ml-auto">
                              <button className="text-gray-400 hover:text-gray-600">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )) : (
                          <p className="text-center text-gray-500 py-6">No menu items found</p>
                        )}
                      </div>
                      <div className="p-4 border-t border-gray-100 text-center">
                        <button className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm">
                          View All Menu Items
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Customer Reviews Section */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">Recent Customer Reviews</h3>
                </div>
                <div className="p-6 space-y-6">
                  {customerReviews.length > 0 ? customerReviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-800">{review.customer}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i}
                              className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-300'} text-sm`}
                            />
                          ))}
                          <span className="ml-2 text-xs text-gray-500">{review.time}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-600">{review.comment}</p>
                    </div>
                  )) : (
                    <p className="text-center text-gray-500">No reviews found</p>
                  )}
                </div>
                <div className="p-4 border-t border-gray-100 text-center">
                  <button className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm">
                    View All Reviews
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</h2>
              <p className="text-gray-500">This section is under development. Please check back later.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}