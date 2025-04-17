import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MdMenu, 
  MdSearch, 
  MdNotifications, 
  MdShoppingCart, 
  MdKeyboardArrowDown,
  MdPerson,
  MdFavorite,
  MdHelp,
  MdLogout
} from 'react-icons/md'
import { useSelector } from 'react-redux'
import { selectCartItems, selectCartTotalItems } from '../../Redux/slices/cartSlice'
import { useNotification } from '../../Order/NotifyContext'

export default function Header({ toggleSidebar }) {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Connect to cart state in Redux
  const cartItems = useSelector(selectCartItems);
  const cartItemsCount = useSelector(selectCartTotalItems);
  
  // Get active notifications
  const { activeNotifications = [] } = useNotification() || {};
  const notificationCount = activeNotifications.length;

  // Get user data on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfileDropdown(false);
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    } else if (user.firstName) {
      return user.firstName.charAt(0);
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  return (
    <motion.header 
      className="bg-white shadow-md z-20 sticky top-0 right-0 left-0"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            className="lg:hidden mr-4 text-gray-600 hover:text-orange-500 focus:outline-none"
            onClick={toggleSidebar}
          >
            <MdMenu className="h-6 w-6" />
          </button>
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text">
              Cravely
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for food, restaurants..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50 w-56 transition-all duration-300 focus:w-72"
            />
          </div>
          
          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MdShoppingCart className="text-2xl text-gray-600" />
            {cartItemsCount > 0 && (
              <motion.span 
                className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {cartItemsCount}
              </motion.span>
            )}
          </Link>
          
          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MdNotifications className="text-2xl text-gray-600" />
            {notificationCount > 0 && (
              <motion.span 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {notificationCount}
              </motion.span>
            )}
          </button>
          
          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setProfileDropdown(!profileDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                <span className="font-medium text-white">{getUserInitials()}</span>
              </div>
              <div className="hidden md:block">
                <h3 className="font-medium text-gray-800 text-sm">{getUserDisplayName()}</h3>
              </div>
              <MdKeyboardArrowDown className={`transition-transform duration-200 text-gray-500 ${profileDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Profile Dropdown */}
            {profileDropdown && (
              <motion.div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link to="/user" className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                  <MdPerson className="mr-2" />
                  My Profile
                </Link>
                <Link to="favorites" className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500">
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
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
