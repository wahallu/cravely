import React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdDashboard,
  MdRestaurant,
  MdShoppingCart,
  MdDeliveryDining,
  MdCreditCard,
  MdFavorite,
  MdLocalOffer,
  MdSettings,
  MdOutlineLogout,
  MdRestaurantMenu,
} from "react-icons/md";

export default function Sidebar({
  isOpen,
  onClose,
  isSidebarCollapsed,
  setSidebarCollapsed,
}) {
  const location = useLocation();
  const [restaurantName, setRestaurantName] = useState("");

  // Define the getRestaurantInfo function
  const getRestaurantInfo = () => {
    try {
      const restaurantData = localStorage.getItem("restaurantInfo");
      return restaurantData ? JSON.parse(restaurantData) : null;
    } catch (error) {
      console.error("Error getting restaurant info:", error);
      return null;
    }
  };

  useEffect(() => {
    const restaurantInfo = getRestaurantInfo();
    if (restaurantInfo && restaurantInfo.name) {
      setRestaurantName(restaurantInfo.name);
    }
  }, []);

  const navItems = [
    {
      id: "dashboard",
      icon: <MdDashboard className="text-2xl" />,
      label: "Dashboard",
      href: "/restaurant/dashboard",
    },
    {
      id: "menu",
      icon: <MdRestaurantMenu className="text-2xl" />,
      label: "Menu Management",
      href: "/restaurant/menu",
    },
    {
      id: "order",
      icon: <MdShoppingCart className="text-2xl" />,
      label: "Order Management",
      href: "/restaurant/order",
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <motion.div
        initial={{ width: 250 }}
        animate={{ width: isSidebarCollapsed ? 88 : 250 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-white/90 backdrop-blur-md shadow-2xl z-10 fixed top-0 left-0 h-screen overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2.5 rounded-xl shadow-lg">
                <MdRestaurant className="text-2xl text-white" />
              </div>
              {!isSidebarCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text">
                  {restaurantName}
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSidebarCollapsed ? ">" : "<"}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group ${
                      location.pathname === item.href
                        ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/30"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                    }`}
                  >
                    <div
                      className={`${
                        location.pathname === item.href
                          ? ""
                          : "group-hover:scale-110 transition-transform duration-200"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-100 p-4 sticky bottom-0 bg-white/90 backdrop-blur-md">
            <button className="flex items-center gap-3 w-full p-3.5 text-left rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors group">
              <div className="group-hover:scale-110 transition-transform duration-200">
                <MdOutlineLogout className="text-2xl" />
              </div>
              {!isSidebarCollapsed && (
                <span className="font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
