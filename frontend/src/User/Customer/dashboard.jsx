import React, { useState, useEffect } from 'react'
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
import { useGetUserOrdersQuery } from '../../Redux/slices/orderSlice'
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice'

export default function Dashboard() {
  // State for storing formatted data
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  
  // Fetch orders using RTK Query
  const { 
    data: ordersData, 
    isLoading: isOrdersLoading 
  } = useGetUserOrdersQuery();

  // Fetch restaurants using RTK Query
  const { 
    data: restaurantsData, 
    isLoading: isRestaurantsLoading 
  } = useGetAllRestaurantsQuery();

  // Process restaurant data when it loads
  useEffect(() => {
    if (restaurantsData?.data) {
      const restaurants = restaurantsData.data || [];
      
      // Sort by rating to get highest rated for "favorites"
      const sortedByRating = [...restaurants]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3)
        .map(restaurant => ({
          id: restaurant._id || restaurant.id,
          name: restaurant.name || 'Unknown Restaurant',
          rating: restaurant.rating || 4.0,
          cuisine: restaurant.cuisineType || 'Various Cuisine',
          deliveryTime: `${20 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)} min`,
          image: restaurant.image || '/hero1.png'
        }));
      
      // Create nearby restaurants (different sort/filter in real app)
      const nearby = [...restaurants]
        .sort(() => 0.5 - Math.random()) // Random sort for demo
        .slice(0, 3)
        .map(restaurant => ({
          id: restaurant._id || restaurant.id,
          name: restaurant.name || 'Unknown Restaurant',
          rating: restaurant.rating || 4.0,
          cuisine: restaurant.cuisineType || 'Various Cuisine',
          deliveryTime: `${20 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)} min`,
          distance: `${(Math.random() * 2).toFixed(1)} mi`,
          image: restaurant.image || '/hero1.png'
        }));
      
      // Create special offers based on restaurants
      const offers = restaurants.slice(0, 2).map((restaurant, index) => ({
        id: index + 1,
        title: index === 0 ? '50% OFF' : 'FREE DELIVERY',
        description: index === 0 ? 'On your first order' : `At ${restaurant.name}`,
        code: index === 0 ? 'WELCOME50' : `${restaurant.name.replace(/\s/g, '').toUpperCase().slice(0, 6)}`,
        expiry: `Valid until ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'})}`,
        color: index === 0 
          ? 'bg-gradient-to-r from-orange-400 to-orange-600' 
          : 'bg-gradient-to-r from-blue-400 to-blue-600'
      }));
      
      setFavoriteRestaurants(sortedByRating);
      setNearbyRestaurants(nearby);
      setSpecialOffers(offers);
    }
  }, [restaurantsData]);
  
  // Process orders data when it loads
  useEffect(() => {
    if (ordersData) {
      const orders = ordersData || [];
      const recent = orders
        .slice(0, 2) // Get most recent 2 orders
        .map(order => ({
          id: order.orderId || order._id,
          restaurant: order.restaurantName || 'Restaurant',
          items: order.items 
            ? order.items.map(item => item.name).join(', ').substring(0, 30) + (order.items.length > 2 ? '...' : '') 
            : 'Various items',
          total: order.total || 0,
          status: order.status || 'Delivered',
          date: new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {day: '2-digit', month: 'short'}),
          image: order.restaurantImage || '/hero1.png'
        }));
        
      setRecentOrders(recent);
    }
  }, [ordersData]);

  // Quick actions (static data)
  const quickActions = [
    { id: 'restaurants', icon: <MdRestaurant className="text-white" />, label: 'Restaurants', href: '/restaurants', color: 'from-blue-400 to-blue-600' },
    { id: 'orders', icon: <MdDeliveryDining className="text-white" />, label: 'My Orders', href: '/orders', color: 'from-green-400 to-green-600' },
    { id: 'favorites', icon: <MdFavorite className="text-white" />, label: 'Favorites', href: 'favorites', color: 'from-red-400 to-red-600' },
    { id: 'offers', icon: <MdLocalOffer className="text-white" />, label: 'Offers', href: '/offers', color: 'from-purple-400 to-purple-600' },
  ];

  // Get user name from localStorage
  const [userName, setUserName] = useState('User');
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.firstName) {
        setUserName(user.firstName);
      }
    }
  }, []);

  // Loading state
  if (isOrdersLoading || isRestaurantsLoading) {
    return (
      <div className="space-y-8">
        {/* Show loading skeleton UI */}
        <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Quick actions - always visible */}
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
        
        {/* Loading skeletons for the rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
        
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}!</h1>
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
