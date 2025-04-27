import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MdPerson, 
  MdRestaurant, 
  MdShoppingBasket, 
  MdDeliveryDining,
  MdArrowUpward, 
  MdArrowDownward, 
  MdMoreVert,
  MdStar
} from 'react-icons/md'
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice'
import { useGetAllUsersQuery } from '../../Redux/slices/userSlice'
import { useGetAvailableOrdersForDeliveryQuery } from '../../Redux/slices/orderSlice'
import { useGetAllDriversQuery } from '../../Redux/slices/driverSlice'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  // States for dashboard data
  const [stats, setStats] = useState([
    { 
      title: 'Total Users', 
      value: '0', 
      icon: <MdPerson className="text-white" />, 
      bgColor: 'bg-gradient-to-r from-blue-400 to-blue-600', 
      increase: true, 
      percent: 0 
    },
    { 
      title: 'Restaurants', 
      value: '0', 
      icon: <MdRestaurant className="text-white" />, 
      bgColor: 'bg-gradient-to-r from-orange-400 to-orange-600', 
      increase: true, 
      percent: 0 
    },
    { 
      title: 'Total Pending Orders', 
      value: '0', 
      icon: <MdShoppingBasket className="text-white" />, 
      bgColor: 'bg-gradient-to-r from-green-400 to-green-600', 
      increase: true, 
      percent: 0
    },
    { 
      title: 'Active Drivers', 
      value: '0', 
      icon: <MdDeliveryDining className="text-white" />, 
      bgColor: 'bg-gradient-to-r from-purple-400 to-purple-600', 
      increase: false, 
      percent: 0
    },
  ]);
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  
  // Fetch data using RTK Query
  const { 
    data: restaurantsData, 
    isLoading: isRestaurantsLoading,
    isError: isRestaurantsError
  } = useGetAllRestaurantsQuery();
  
  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError
  } = useGetAllUsersQuery();
  
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError
  } = useGetAvailableOrdersForDeliveryQuery();
  
  const {
    data: driversData,
    isLoading: isDriversLoading,
    isError: isDriversError
  } = useGetAllDriversQuery();

  // Update stats for restaurants
  useEffect(() => {
    if (restaurantsData) {
      const restaurants = restaurantsData.data || [];
      
      setStats(prevStats => {
        const newStats = [...prevStats];
        // Update restaurant count 
        newStats[1] = {
          ...newStats[1],
          value: restaurants.length.toString(),
          // Calculate percentage change - assuming 5% growth as placeholder
          // In a real app, you'd compare to previous period data
          percent: 5
        };
        return newStats;
      });
      
      // Sort restaurants by number of orders to get top performers
      const sortedRestaurants = [...restaurants]
        .sort((a, b) => (b.orders || 0) - (a.orders || 0))
        .slice(0, 3)
        .map(restaurant => ({
          id: restaurant._id,
          name: restaurant.name,
          orders: restaurant.orders || 0,
          rating: restaurant.rating || 0,
          revenue: `$${((restaurant.orders || 0) * 10).toFixed(2)}`,
          image: restaurant.logo || '/hero1.png'
        }));
      
      setTopRestaurants(sortedRestaurants);
    }
  }, [restaurantsData]);

  // Update stats for users
  useEffect(() => {
    if (usersData) {
      const users = Array.isArray(usersData) ? usersData : (usersData.users || []);
      
      // Take most recent users for the table display
      const recentUsersList = [...users]
        .sort((a, b) => new Date(b.createdAt || b.joinDate || 0) - new Date(a.createdAt || a.joinDate || 0))
        .slice(0, 4)
        .map(user => ({
          id: user._id || user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          email: user.email || 'N/A',
          joinDate: user.createdAt || user.joinDate || new Date().toISOString(),
          status: user.status || 'Active',
          orders: user.orders || 0
        }));
      
      setRecentUsers(recentUsersList);
      
      // Update user count in stats
      setStats(prevStats => {
        const newStats = [...prevStats];
        newStats[0] = {
          ...newStats[0],
          value: users.length.toString(),
          // Calculate percentage change - assuming 12% growth as placeholder
          // In a real app, you'd compare to previous period data
          percent: 12
        };
        return newStats;
      });
    }
  }, [usersData]);

  // Update stats for orders
  useEffect(() => {
    if (ordersData) {
      const orders = Array.isArray(ordersData) 
        ? ordersData 
        : (ordersData.orders || ordersData.data || []);
      
      // Update orders count in stats
      setStats(prevStats => {
        const newStats = [...prevStats];
        newStats[2] = {
          ...newStats[2],
          value: orders.length.toString(),
          // Calculate percentage change - assuming 8% growth as placeholder
          // In a real app, you'd compare to previous period data
          percent: 8
        };
        return newStats;
      });
    }
  }, [ordersData]);

  // Update stats for drivers
  useEffect(() => {
    if (driversData) {
      const drivers = Array.isArray(driversData) 
        ? driversData 
        : (driversData.drivers || driversData.data || []);
      
      // Count active drivers
      const activeDrivers = drivers.filter(driver => 
        driver.status === 'active' || driver.isActive === true
      );
      
      // Update drivers count in stats
      setStats(prevStats => {
        const newStats = [...prevStats];
        newStats[3] = {
          ...newStats[3],
          value: activeDrivers.length.toString(),
          // Calculate percentage change - assuming -3% change as placeholder
          // In a real app, you'd compare to previous period data
          increase: false,
          percent: 3
        };
        return newStats;
      });
    }
  }, [driversData]);

  // Check if any data is still loading
  const isLoading = isRestaurantsLoading || isUsersLoading || isOrdersLoading || isDriversLoading;

  // Check if any data fetch resulted in an error
  const isError = isRestaurantsError || isUsersError || isOrdersError || isDriversError;

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load dashboard data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-800 font-medium text-sm">{user.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <Link to="/admin/users" className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm">
              View All Users
            </Link>
          </div>
        </motion.div>

        {/* Top Restaurants */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Restaurant content remains the same */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Top Performing Restaurants</h3>
          </div>
          <div className="p-6">
            {topRestaurants.length > 0 ? (
              topRestaurants.map((restaurant, index) => (
                <div key={index} className="flex items-center justify-between mb-6 last:mb-0">
                  <div className="flex items-center">
                    <img src={restaurant.image} alt={restaurant.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-800">{restaurant.name}</h4>
                      <div className="flex items-center mt-1">
                        <MdStar className="text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{restaurant.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800 font-medium">{restaurant.revenue}</p>
                    <p className="text-sm text-gray-500">{restaurant.orders} orders</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MdMoreVert />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No restaurant data available
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <Link to="/admin/restaurants" className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm">
              View All Restaurants
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}