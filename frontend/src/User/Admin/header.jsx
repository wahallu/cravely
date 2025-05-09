import React, { useState } from 'react'
import { MdSearch, MdNotifications, MdMenu, MdPersonOutline, MdKeyboardArrowDown } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Header({ toggleSidebar }) {
  const [notifications, setNotifications] = useState(3);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfileDropdown(false);
    navigate('/login');
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50 w-56 transition-all duration-300 focus:w-64"
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MdNotifications className="text-2xl text-gray-600" />
            {notifications > 0 && (
              <motion.span 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {notifications}
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
                <span className="font-medium text-white">UA</span>
              </div>
              <div className="hidden md:block">
                <h3 className="font-medium text-gray-800 text-sm">Admin User</h3>
                <p className="text-xs text-gray-500">Administrator</p>
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
                <Link to="/user" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                  My Profile
                </Link>
                <Link to="/user/settings" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500">
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50">
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