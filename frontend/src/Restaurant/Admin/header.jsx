import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MdMenu,
  MdSearch,
  MdNotifications,
  MdShoppingCart,
  MdKeyboardArrowDown,
  MdPerson,
  MdFavorite,
  MdHelp,
  MdLogout,
} from "react-icons/md";
import { removeRestaurantAuth } from "../../utils/restaurantAuth";

export default function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(2);
  const [cartItems, setCartItems] = useState(3);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Handle logout confirmation
  const confirmLogout = () => {
    setShowLogoutConfirmation(true);
    setProfileDropdown(false);
  };

  // Handle logout
  const handleLogout = () => {
    // Remove restaurant authentication data from localStorage
    removeRestaurantAuth();

    // Close the confirmation dialog
    setShowLogoutConfirmation(false);

    // Show success toast
    toast.success("Logged out successfully");

    // Redirect to login page
    navigate("/restaurant/login");
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
              Restaurant Dashboard
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
          {/* <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MdShoppingCart className="text-2xl text-gray-600" />
            {cartItems > 0 && (
              <motion.span 
                className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {cartItems}
              </motion.span>
            )}
          </Link> */}

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
                <span className="font-medium text-white">JD</span>
              </div>
              <div className="hidden md:block">
                <h3 className="font-medium text-gray-800 text-sm">John Doe</h3>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
              <MdKeyboardArrowDown
                className={`transition-transform duration-200 text-gray-500 ${
                  profileDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileDropdown && (
              <motion.div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                >
                  <MdPerson className="mr-2" />
                  My Profile
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                >
                  <MdFavorite className="mr-2" />
                  Favorites
                </Link>
                <Link
                  to="/help"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                >
                  <MdHelp className="mr-2" />
                  Help & Support
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={confirmLogout}
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

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg max-w-md w-full shadow-xl p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Confirm Logout
              </h3>
              <p className="text-gray-500 mb-5">
                Are you sure you want to logout from your restaurant dashboard?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
