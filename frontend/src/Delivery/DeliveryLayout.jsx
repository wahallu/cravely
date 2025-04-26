import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { getToken } from "../utils/auth";

const DeliveryLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication using the main auth utility
    const token = getToken();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (token && userInfo.role === 'driver') {
      setIsAuthenticated(true);
      
      // If on login/signup page, redirect to delivery dashboard
      if (['/delivery/login', '/delivery/signup'].includes(location.pathname)) {
        navigate('/delivery'); 
      }
    } else {
      setIsAuthenticated(false);
      // If not logged in and trying to access protected routes
      if (!['/delivery/login', '/delivery/signup'].includes(location.pathname)) {
        navigate('/delivery/login');
      }
    }
  }, [location, navigate]);

  const isActive = (path) =>
    location.pathname === path ? "bg-white text-orange-500 font-semibold" : "text-white";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
    navigate('/delivery/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-orange-400 text-black p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🚚 Delivery Management</h1>
        
        {/* Auth Buttons */}
        <div className="flex gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/delivery/login"
                className="flex items-center px-4 py-2 bg-white text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <FaSignInAlt className="mr-2" />
                Sign In
              </Link>
              <Link
                to="/delivery/signup"
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <FaUserPlus className="mr-2" />
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Navigation - Only show if authenticated */}
      {isAuthenticated && (
        <nav className="bg-orange-300 p-3 flex gap-4">
          <Link
            to="/delivery"
            className={`px-4 py-2 rounded ${isActive("/delivery")}`}
          >
            Deliveries
          </Link>
          <Link
            to="/delivery/drivers"
            className={`px-4 py-2 rounded ${isActive("/delivery/drivers")}`}
          >
            Driver Dashboard
          </Link>
          <Link
            to="/delivery/all-drivers"
            className={`px-4 py-2 rounded ${isActive("/delivery/all-drivers")}`}
          >
            All Drivers
          </Link>
        </nav>
      )}

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;
