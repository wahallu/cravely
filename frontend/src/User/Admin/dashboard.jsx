import React from 'react'
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

export default function Dashboard() {
  // Sample stats data
  const stats = [
    { 
      title: 'Total Users', 
      value: '24,521', 
      icon: <MdPerson className="text-white" />, 
      bgColor: 'bg-gradient-to-r from-blue-400 to-blue-600', 
      increase: true, 
      percent: 12.5 
    },
    { 
      title: 'Restaurants', 
      value: '548', 
      icon: <MdRestaurant className="text-white" />, 
      bgColor: 'bg-gradient-to-r from-orange-400 to-orange-600', 
      increase: true, 
      percent: 8.2 
    },
    { 
      title: 'Total Orders', 
      value: '86,243', 
      icon: <MdShoppingBasket className="text-white" />, 
      bgColor: 'bg-gradient-to-r from-green-400 to-green-600', 
      increase: true, 
      percent: 15.3 
    },
    { 
      title: 'Active Drivers', 
      value: '376', 
      icon: <MdDeliveryDining className="text-white" />, 
      bgColor: 'bg-gradient-to-r from-purple-400 to-purple-600', 
      increase: false, 
      percent: 2.4 
    },
  ];

  // Recent users data
  const recentUsers = [
    { id: 'USR-3821', name: 'John Smith', email: 'john.smith@example.com', joinDate: '2023-05-15', status: 'Active', orders: 12 },
    { id: 'USR-3822', name: 'Emma Johnson', email: 'emma.j@example.com', joinDate: '2023-05-18', status: 'Active', orders: 4 },
    { id: 'USR-3823', name: 'Michael Brown', email: 'michael.b@example.com', joinDate: '2023-05-20', status: 'Inactive', orders: 0 },
    { id: 'USR-3824', name: 'Sophia Davis', email: 'sophia.d@example.com', joinDate: '2023-05-22', status: 'Active', orders: 8 },
  ];

  // Top restaurants data
  const topRestaurants = [
    { id: 1, name: 'Burger Arena', orders: 1245, rating: 4.8, revenue: '$12,450', image: '/hero1.png' },
    { id: 2, name: 'Pizza Palace', orders: 1048, rating: 4.6, revenue: '$10,480', image: '/hero1.png' },
    { id: 3, name: 'Sushi Sensation', orders: 965, rating: 4.7, revenue: '$9,650', image: '/hero1.png' },
  ];

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
              <div className="flex items-center mt-4">
                {stat.increase ? (
                  <MdArrowUpward className="text-green-500 mr-1" />
                ) : (
                  <MdArrowDownward className="text-red-500 mr-1" />
                )}
                <span className={`text-sm ${stat.increase ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.percent}% {stat.increase ? 'Increase' : 'Decrease'}
                </span>
                <span className="text-xs text-gray-500 ml-2">vs. last month</span>
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
            <button className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm">
              View All Users
            </button>
          </div>
        </motion.div>

        {/* Top Restaurants */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Top Performing Restaurants</h3>
          </div>
          <div className="p-6">
            {topRestaurants.map((restaurant, index) => (
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
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <button className="text-orange-500 hover:text-orange-600 transition-colors font-medium text-sm">
              View All Restaurants
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}