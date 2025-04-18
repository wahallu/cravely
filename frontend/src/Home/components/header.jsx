import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdLocationOn, MdKeyboardArrowDown, MdRestaurant, MdPersonOutline, MdPerson, MdFavorite, MdLogout, MdHistory } from 'react-icons/md'
import { FaShoppingBag, FaMotorcycle, FaPizzaSlice, FaHotjar, FaCheckCircle, FaRegClock, FaClipboardList } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { selectCartTotalItems } from '../../Redux/slices/cartSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { useGetUserOrdersQuery } from '../../Redux/slices/orderSlice'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [locationDropdown, setLocationDropdown] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [hasLiveOrders, setHasLiveOrders] = useState(false)
  const [liveOrdersCount, setLiveOrdersCount] = useState(0)
  const [activeOrdersStatus, setActiveOrdersStatus] = useState([])
  const navigate = useNavigate()

  // Get the cart items count from Redux store
  const cartItemCount = useSelector(selectCartTotalItems)
  
  // Get user orders directly using the same Redux query hook used in MyOrders
  const { data: ordersData, isLoading: isLoadingOrders } = useGetUserOrdersQuery(undefined, {
    skip: !isLoggedIn, // Skip query if user is not logged in
    pollingInterval: 60000, // Poll every minute for updates
  })

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  // Filter and process orders - using the same logic as in MyOrders.jsx
  useEffect(() => {
    if (ordersData && Array.isArray(ordersData)) {
      // Filter active orders with the same statuses as in MyOrders
      const liveOrderStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery']
      const liveOrders = ordersData.filter(order => 
        order && order.status && liveOrderStatuses.includes(order.status)
      )
      
      if (liveOrders.length > 0) {
        setHasLiveOrders(true)
        setLiveOrdersCount(liveOrders.length)
        
        // Format orders for display
        const formattedOrders = liveOrders.map(order => ({
          id: order.orderId || order._id,
          status: formatOrderStatus(order.status),
          estimatedTime: getEstimatedDeliveryTime(order)
        }))
        
        setActiveOrdersStatus(formattedOrders)
      } else {
        setHasLiveOrders(false)
        setLiveOrdersCount(0)
        setActiveOrdersStatus([])
      }
    }
  }, [ordersData])

  // Format order status to be more user-friendly
  const formatOrderStatus = (status) => {
    switch(status) {
      case 'pending': return 'Pending confirmation'
      case 'confirmed': return 'Order confirmed'
      case 'preparing': return 'Being prepared'
      case 'out_for_delivery': return 'On the way'
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
    }
  }

  // Get status icon based on order status - similar to MyOrders
  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'on the way':
        return (
          <motion.div
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              repeatDelay: 1
            }}
          >
            <FaMotorcycle className="text-white" />
          </motion.div>
        );
      case 'being prepared':
        return (
          <motion.div
            animate={{ 
              rotate: [0, 15, 0, 15, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              repeatDelay: 0.5
            }}
          >
            <MdRestaurant className="text-white" />
          </motion.div>
        );
      case 'order confirmed':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
            }}
          >
            <FaCheckCircle className="text-white" />
          </motion.div>
        );
      case 'pending confirmation':
        return (
          <motion.div
            animate={{ 
              opacity: [1, 0.5, 1],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
            }}
          >
            <FaRegClock className="text-white" />
          </motion.div>
        );
      default:
        return <FaPizzaSlice className="text-white" />;
    }
  };

  // Get estimated delivery time
  const getEstimatedDeliveryTime = (order) => {
    if (!order) return 'Soon';
    
    // If order has explicit estimatedDeliveryTime field, use that
    if (order.estimatedDeliveryTime) {
      return formatTimeRemaining(new Date(order.estimatedDeliveryTime));
    }
    
    // Otherwise estimate based on status and creation time
    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    let estimatedMinutes = 0;
    
    switch(order.status) {
      case 'pending': return '45 min';
      case 'confirmed': return '35 min';
      case 'preparing': return '25 min';
      case 'out_for_delivery': return '15 min';
      default: return 'Soon';
    }
  }
  
  // Format time remaining in a user-friendly way
  const formatTimeRemaining = (estimatedTime) => {
    const now = new Date();
    const diffInMs = estimatedTime - now;
    const diffInMinutes = Math.round(diffInMs / 60000);
    
    if (diffInMinutes <= 0) return 'Any moment';
    if (diffInMinutes === 1) return '1 min';
    return `${diffInMinutes} mins`;
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    setProfileDropdown(false)
  }

  return (
    <nav className={`sticky top-0 z-50 ${scrolled ? 'bg-white shadow-md' : 'bg-white'} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Cravely"
                className="h-10 transition-all duration-300 hover:opacity-80"
              />
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Home
            </Link>
            <Link to="/restaurants" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Restaurants
            </Link>
            <Link to="/meals&menus" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Meals & Menus
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              About Us
            </Link>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center gap-4">
            {/* Location Selector */}
            <div className="relative">
              <button 
                className="flex items-center text-gray-700 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => setLocationDropdown(!locationDropdown)}
              >
                <MdLocationOn className="text-orange-500 text-xl mr-1" />
                <span className="font-medium mr-1 max-w-[110px] truncate hidden sm:inline-block">
                  Pittugala Malabe
                </span>
                <MdKeyboardArrowDown className={`transition-transform duration-200 ${locationDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Location Dropdown */}
              {locationDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-2 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">Delivery Location</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-2">
                    <button className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center">
                      <MdLocationOn className="text-orange-500 mr-2" />
                      <span>Pittugala Malabe</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center">
                      <MdLocationOn className="text-gray-400 mr-2" />
                      <span>Colombo 07</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center">
                      <MdLocationOn className="text-gray-400 mr-2" />
                      <span>Kandy City Center</span>
                    </button>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="w-full text-orange-500 text-sm font-medium hover:text-orange-600">
                      + Add New Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Orders Indicator - Only shown when user has active orders */}
            <AnimatePresence>
              {isLoggedIn && (isLoadingOrders ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden md:flex items-center"
                >
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                  </div>
                </motion.div>
              ) : hasLiveOrders && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden md:block"
                >
                  <div className="relative group">
                    {/* Compact button with live pulse effect */}
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm relative cursor-pointer">
                      <motion.div 
                        className="absolute w-full h-full rounded-full bg-orange-400"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 0, 0.7]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut" 
                        }}
                      />
                      {activeOrdersStatus.length > 0 && (() => {
                        // Display different icon based on the latest order's status
                        const latestOrderStatus = activeOrdersStatus[0].status.toLowerCase();
                        switch(true) {
                          case latestOrderStatus.includes('pending'):
                            return <FaRegClock className="text-white text-sm" />;
                          case latestOrderStatus.includes('confirmed'):
                            return <FaClipboardList className="text-white text-sm" />;
                          case latestOrderStatus.includes('prepared') || latestOrderStatus.includes('preparing'):
                            return <MdRestaurant className="text-white text-sm" />;
                          case latestOrderStatus.includes('delivery') || latestOrderStatus.includes('way'):
                            return <FaMotorcycle className="text-white text-sm" />;
                          default:
                            return <FaPizzaSlice className="text-white text-sm" />;
                        }
                      })()}
                    </div>
                    
                    {/* Tooltip/popover with order details on hover */}
                    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute -right-2 top-full mt-2 z-50 transform origin-top-right">
                      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden w-52">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 px-3 py-1.5 text-white flex items-center justify-between">
                          <div className="text-sm font-medium">Active Orders</div>
                          <Link to="/orders?filter=live" className="text-xs underline hover:no-underline">
                            View All
                          </Link>
                        </div>
                        
                        <div className="max-h-40 overflow-y-auto">
                          {activeOrdersStatus.map((order, index) => (
                            <Link 
                              to={`/orders/${order.id}`} 
                              key={order.id} 
                              className="flex items-center justify-between px-3 py-2 hover:bg-orange-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                                  {getStatusIcon(order.status)}
                                </div>
                                <span className="text-xs text-gray-700">{order.status}</span>
                              </div>
                              <span className="text-xs font-bold text-orange-500">{order.estimatedTime}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Order Button with dynamic cart count */}
            <Link to="/cart" className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors relative">
              <FaShoppingBag className="text-lg" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Conditional rendering based on login status */}
            {isLoggedIn ? (
              // User Profile when logged in
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                    <span className="font-medium text-white">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <h3 className="font-medium text-gray-800 text-sm">
                      {user?.firstName || 'User'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {user?.role === 'admin' ? 'Admin' : 'Customer'}
                    </p>
                  </div>
                  <MdKeyboardArrowDown className={`transition-transform duration-200 text-gray-500 ${profileDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Profile Dropdown */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-2">
                    <Link to="/user" className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                      <MdPerson className="mr-2" />
                      My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                      <MdHistory className="mr-2" />
                      My Orders
                    </Link>
                    <Link to="/user/favorites" className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                      <MdFavorite className="mr-2" />
                      Favorites
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                    >
                      <MdLogout className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login Button when not logged in
              <Link to="/login" className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2 rounded-full hover:from-orange-500 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center">
                <MdPersonOutline className="mr-1" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu - Hidden on larger screens */}
      <div className="md:hidden border-t border-gray-100 overflow-x-auto no-scrollbar">
        <div className="flex space-x-4 px-4 py-2 whitespace-nowrap">
          <Link to="/" className="flex flex-col items-center text-xs text-orange-500 font-medium px-3 py-1">
            <MdRestaurant className="text-lg mb-1" />
            <span>Home</span>
          </Link>
          <Link to="/restaurants" className="flex flex-col items-center text-xs text-gray-700 hover:text-orange-500 font-medium px-3 py-1">
            <MdRestaurant className="text-lg mb-1" />
            <span>Restaurants</span>
          </Link>
          <Link to="/about" className="flex flex-col items-center text-xs text-gray-700 hover:text-orange-500 font-medium px-3 py-1">
            <MdRestaurant className="text-lg mb-1" />
            <span>About</span>
          </Link>
        </div>
      </div>

      {/* Mobile Live Orders indicator */}
      <AnimatePresence>
        {isLoggedIn && (isLoadingOrders ? (
          <motion.div 
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            className="md:hidden fixed bottom-16 right-4 z-40"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            </motion.div>
          </motion.div>
        ) : hasLiveOrders && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="md:hidden fixed bottom-16 right-4 z-40"
          >
            <Link to="/orders?filter=live">
              <div className="relative">
                {/* Pulsing circle effect */}
                <motion.div 
                  className="absolute -inset-1 rounded-full bg-orange-400 opacity-50"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.2, 0.5]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut" 
                  }}
                />
                
                {/* Main button */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-400 w-12 h-12 rounded-full shadow-lg flex items-center justify-center relative">
                  {activeOrdersStatus.length > 0 && (() => {
                    // Display different icon based on the latest order's status
                    const latestOrderStatus = activeOrdersStatus[0].status.toLowerCase();
                    switch(true) {
                      case latestOrderStatus.includes('pending'):
                        return <FaRegClock className="text-white text-lg" />;
                      case latestOrderStatus.includes('confirmed'):
                        return <FaClipboardList className="text-white text-lg" />;
                      case latestOrderStatus.includes('prepared') || latestOrderStatus.includes('preparing'):
                        return <MdRestaurant className="text-white text-lg" />;
                      case latestOrderStatus.includes('delivery') || latestOrderStatus.includes('way'):
                        return <FaMotorcycle className="text-white text-lg" />;
                      default:
                        return <FaPizzaSlice className="text-white text-lg" />;
                    }
                  })()}
                  
                  {/* Latest order status indicator */}
                  {activeOrdersStatus.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                      {getStatusIcon(activeOrdersStatus[0].status)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
            
            {/* Tiny floating time bubble for first order */}
            {activeOrdersStatus.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-3 -right-2 bg-white text-orange-500 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
              >
                {activeOrdersStatus[0].estimatedTime}
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </nav>
  )
}
