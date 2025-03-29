import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  MdDeliveryDining, 
  MdRestaurant, 
  MdStar, 
  MdLocalOffer, 
  MdFavorite,
  MdArrowForward,
  MdHistory,
  MdLocationOn
} from 'react-icons/md'

export default function Dashboard() {
  // Mock data for quick actions
  const quickActions = [
    { id: 'restaurants', icon: <MdRestaurant className="text-white" />, label: 'Restaurants', href: '/restaurants', color: 'from-blue-400 to-blue-600' },
    { id: 'orders', icon: <MdDeliveryDining className="text-white" />, label: 'My Orders', href: '/orders', color: 'from-green-400 to-green-600' },
    { id: 'favorites', icon: <MdFavorite className="text-white" />, label: 'Favorites', href: '/favorites', color: 'from-red-400 to-red-600' },
    { id: 'offers', icon: <MdLocalOffer className="text-white" />, label: 'Offers', href: '/offers', color: 'from-purple-400 to-purple-600' },
  ];

  // Mock data for recent orders
  const recentOrders = [
    { 
      id: 'ORD-3821', 
      restaurant: 'Burger Arena', 
      items: 'Classic Cheeseburger, Fries, Soda', 
      total: 24.99, 
      status: 'Delivered', 
      date: '20 Jun 2023',
      image: '/hero1.png'
    },
    { 
      id: 'ORD-3820', 
      restaurant: 'Pizza Palace', 
      items: 'Pepperoni Pizza, Garlic Bread', 
      total: 32.50, 
      status: 'Delivered', 
      date: '18 Jun 2023',
      image: '/hero1.png'
    },
  ];

  // Mock data for favorite restaurants
  const favoriteRestaurants = [
    { id: 1, name: 'Burger Arena', rating: 4.8, cuisine: 'American, Fast Food', deliveryTime: '25-35 min', image: '/hero1.png' },
    { id: 2, name: 'Pizza Palace', rating: 4.6, cuisine: 'Italian, Pizza', deliveryTime: '30-40 min', image: '/hero1.png' },
    { id: 3, name: 'Sushi Sensation', rating: 4.7, cuisine: 'Japanese, Sushi', deliveryTime: '35-45 min', image: '/hero1.png' },
  ];

  // Mock data for nearby restaurants
  const nearbyRestaurants = [
    { id: 4, name: 'Taco Fiesta', rating: 4.5, cuisine: 'Mexican, Tacos', deliveryTime: '20-30 min', distance: '0.8 mi', image: '/hero1.png' },
    { id: 5, name: 'Curry House', rating: 4.4, cuisine: 'Indian, Curry', deliveryTime: '30-40 min', distance: '1.2 mi', image: '/hero1.png' },
    { id: 6, name: 'Noodle Express', rating: 4.2, cuisine: 'Chinese, Noodles', deliveryTime: '25-35 min', distance: '1.5 mi', image: '/hero1.png' },
  ];

  // Mock data for special offers
  const specialOffers = [
    { id: 1, title: '50% OFF', description: 'On your first order', code: 'WELCOME50', expiry: 'Valid until 30 Jun 2023', color: 'bg-gradient-to-r from-orange-400 to-orange-600' },
    { id: 2, title: 'FREE DELIVERY', description: 'On orders above $25', code: 'FREEDEL', expiry: 'Valid until 25 Jun 2023', color: 'bg-gradient-to-r from-blue-400 to-blue-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, John!</h1>
            <p className="text-gray-600 mt-1">Ready to satisfy your cravings today?</p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center text-sm text-gray-500">
              <MdLocationOn className="text-gray-400 mr-1" />
              <span>Delivering to: 123 Main St, Springfield</span>
              <button className="ml-2 text-orange-500 hover:text-orange-600">Change</button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link 
            key={action.id}
            to={action.href}
            className="block"
          >
            <motion.div 
              className="bg-white rounded-xl overflow-hidden shadow-sm h-full"
              whileHover={{ 
                y: -5,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
              }}
              transition={{ duration: 0.2 }}
            >
              <div className={`px-4 py-8 flex flex-col items-center bg-gradient-to-r ${action.color}`}>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  {action.icon}
                </div>
                <h3 className="text-white font-medium text-center">{action.label}</h3>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Special Offers */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Special Offers</h2>
          <Link to="/offers" className="text-orange-500 hover:text-orange-600 flex items-center text-sm font-medium">
            View All <MdArrowForward className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialOffers.map((offer) => (
            <motion.div 
              key={offer.id}
              className={`${offer.color} rounded-xl p-6 text-white shadow-sm`}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
              }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-2xl font-bold">{offer.title}</h3>
              <p className="mt-1 opacity-90">{offer.description}</p>
              <div className="mt-4 bg-white/20 rounded-lg p-2 inline-block">
                <span className="font-mono font-bold">{offer.code}</span>
              </div>
              <p className="mt-2 text-sm opacity-80">{offer.expiry}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link to="/orders" className="text-orange-500 hover:text-orange-600 flex items-center text-sm font-medium">
            View All <MdArrowForward className="ml-1" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <motion.div 
              key={order.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
              whileHover={{ 
                y: -2,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)'
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 flex items-center">
                <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={order.image} alt={order.restaurant} className="h-full w-full object-cover" />
                </div>
                <div className="ml-4 flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{order.restaurant}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{order.items}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-0.5">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                    <button className="text-sm text-orange-500 hover:text-orange-600 flex items-center">
                      <MdHistory className="mr-1" /> Reorder
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Two Column Layout for Favorites and Nearby */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Favorite Restaurants */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Favorites</h2>
            <Link to="/favorites" className="text-orange-500 hover:text-orange-600 flex items-center text-sm font-medium">
              View All <MdArrowForward className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {favoriteRestaurants.map((restaurant) => (
              <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id}>
                <motion.div 
                  className="bg-white rounded-xl overflow-hidden shadow-sm flex"
                  whileHover={{ 
                    y: -2,
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-24 h-24">
                    <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3 flex-grow">
                    <h3 className="font-medium text-gray-800">{restaurant.name}</h3>
                    <div className="flex items-center mt-1">
                      <MdStar className="text-yellow-400 mr-1" />
                      <span className="text-sm">{restaurant.rating}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{restaurant.cuisine}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{restaurant.deliveryTime}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Nearby Restaurants */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Nearby Restaurants</h2>
            <Link to="/restaurants" className="text-orange-500 hover:text-orange-600 flex items-center text-sm font-medium">
              View All <MdArrowForward className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {nearbyRestaurants.map((restaurant) => (
              <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id}>
                <motion.div 
                  className="bg-white rounded-xl overflow-hidden shadow-sm flex"
                  whileHover={{ 
                    y: -2,
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-24 h-24">
                    <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3 flex-grow">
                    <h3 className="font-medium text-gray-800">{restaurant.name}</h3>
                    <div className="flex items-center mt-1">
                      <MdStar className="text-yellow-400 mr-1" />
                      <span className="text-sm">{restaurant.rating}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{restaurant.cuisine}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">{restaurant.deliveryTime}</span>
                      <span className="text-sm text-gray-500">{restaurant.distance}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
