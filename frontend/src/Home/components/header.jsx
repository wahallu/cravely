import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MdLocationOn, MdKeyboardArrowDown, MdRestaurant, MdPersonOutline, MdPerson, MdFavorite, MdLogout, MdHistory } from 'react-icons/md'
import { FaShoppingBag } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { selectCartTotalItems } from '../../Redux/slices/cartSlice'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [locationDropdown, setLocationDropdown] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  
  // Get the cart items count from Redux store
  const cartItemCount = useSelector(selectCartTotalItems)

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            <Link to="/offers" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Offers
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
                    <Link to="/favorites" className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500">
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
          <Link to="/offers" className="flex flex-col items-center text-xs text-gray-700 hover:text-orange-500 font-medium px-3 py-1">
            <MdRestaurant className="text-lg mb-1" />
            <span>Offers</span>
          </Link>
          <Link to="/about" className="flex flex-col items-center text-xs text-gray-700 hover:text-orange-500 font-medium px-3 py-1">
            <MdRestaurant className="text-lg mb-1" />
            <span>About</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
