import React, { useState } from 'react';
import { MdArrowUpward, MdArrowDownward, MdNotifications, MdSearch } from 'react-icons/md';
import { FaMoneyBillWave, FaStar, FaUtensils } from 'react-icons/fa';
import { motion } from 'motion/react';

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);
  
  // Mock data for the dashboard
  const restaurantData = {
    name: "Burger Arena",
    rating: 4.8,
    totalOrders: 1248,
    totalRevenue: 28650.50,
    pendingOrders: 8,
    processingOrders: 5,
    completedOrders: 42,
    canceledOrders: 2,
    todayRevenue: 1245.80,
    weeklyRevenue: 8450.30,
    monthlyRevenue: 28650.50,
    compareToLastMonth: 12.5, // percentage increase
  };

  // Recent orders data
  const recentOrders = [
    { id: 'ORD-9385', customer: 'John Smith', items: 3, total: 42.50, status: 'Pending', time: '10 mins ago', address: '123 Main St, Springfield' },
    { id: 'ORD-9384', customer: 'Emma Johnson', items: 2, total: 28.75, status: 'Processing', time: '25 mins ago', address: '456 Oak Ave, Springfield' },
    { id: 'ORD-9383', customer: 'Michael Brown', items: 4, total: 56.20, status: 'Completed', time: '45 mins ago', address: '789 Elm St, Springfield' },
    { id: 'ORD-9382', customer: 'Sophia Davis', items: 1, total: 18.99, status: 'Completed', time: '1 hour ago', address: '101 Pine Rd, Springfield' },
    { id: 'ORD-9381', customer: 'James Wilson', items: 5, total: 62.30, status: 'Canceled', time: '2 hours ago', address: '202 Maple Dr, Springfield' },
  ];

  // Popular menu items
  const popularItems = [
    { name: 'Classic Cheeseburger', orders: 156, revenue: 1248.00, image: '/hero1.png' },
    { name: 'Crispy Chicken Sandwich', orders: 142, revenue: 1136.00, image: '/hero1.png' },
    { name: 'BBQ Bacon Deluxe', orders: 128, revenue: 1152.00, image: '/hero1.png' },
    { name: 'Veggie Supreme', orders: 87, revenue: 696.00, image: '/hero1.png' },
  ];

  // Customer reviews
  const customerReviews = [
    { customer: 'John D.', rating: 5, comment: 'The food was amazing! Fast delivery and excellent packaging.', time: '2 days ago' },
    { customer: 'Sarah M.', rating: 4, comment: 'Great burger, though it took a little longer than expected to arrive.', time: '3 days ago' },
    { customer: 'Robert L.', rating: 5, comment: 'Best burger in town, hands down! Will order again.', time: '1 week ago' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'Processing':
        return 'bg-blue-100 text-blue-600';
      case 'Completed':
        return 'bg-green-100 text-green-600';
      case 'Canceled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Restaurant Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <button className="relative">
                <MdNotifications className="text-2xl text-gray-600 hover:text-orange-500 transition-colors" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center">
                  <span className="font-medium text-orange-800">BA</span>
                </div>
                <div className="hidden md:block">
                  <h3 className="font-medium text-gray-800">Admin</h3>
                  <p className="text-xs text-gray-500">Restaurant Owner</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Today\'s Revenue', value: `$${restaurantData.todayRevenue.toFixed(2)}`, icon: <FaMoneyBillWave className="text-white" />, bgColor: 'bg-gradient-to-r from-green-400 to-green-500', increase: true, percent: 8.2 },
                  { title: 'Total Orders', value: restaurantData.totalOrders, icon: <FaUtensils className="text-white" />, bgColor: 'bg-gradient-to-r from-blue-400 to-blue-500', increase: true, percent: 5.4 },
                  { title: 'Monthly Revenue', value: `$${restaurantData.monthlyRevenue.toFixed(2)}`, icon: <FaMoneyBillWave className="text-white" />, bgColor: 'bg-gradient-to-r from-orange-400 to-orange-500', increase: true, percent: restaurantData.compareToLastMonth },
                  { title: 'Average Rating', value: restaurantData.rating, icon: <FaStar className="text-white" />, bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-500', increase: true, percent: 0.3 },
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
                  { title: 'Pending Orders', value: restaurantData.pendingOrders, color: 'text-yellow-500 bg-yellow-100' },
                  { title: 'Processing Orders', value: restaurantData.processingOrders, color: 'text-blue-500 bg-blue-100' },
                  { title: 'Completed Orders', value: restaurantData.completedOrders, color: 'text-green-500 bg-green-100' },
                  { title: 'Canceled Orders', value: restaurantData.canceledOrders, color: 'text-red-500 bg-red-100' },
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
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
                  <div className="p-6">
                    {popularItems.map((item, index) => (
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
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 text-center">
                    <button className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm">
                      View All Menu Items
                    </button>
                  </div>
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
                  {customerReviews.map((review, index) => (
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
                  ))}
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