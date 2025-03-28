"use client";
import React from 'react';
import { MdRestaurant, MdDashboard, MdMenu, MdPeople, MdDeliveryDining, MdSettings, MdOutlineLogout } from 'react-icons/md';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

export default function SidebarNavigation({ 
  isOpen, 
  onClose, 
  isSidebarCollapsed, 
  setSidebarCollapsed,
  restaurantName = "Burger Arena" 
}) {
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', icon: <MdDashboard />, label: 'Dashboard', href: '/restaurant/dashboard' },
    { id: 'menu', icon: <MdMenu />, label: 'Menu Management', href: '/restaurant/menu' },
    { id: 'orders', icon: <MdDeliveryDining />, label: 'Orders', href: '/restaurant/orders' },
    { id: 'customers', icon: <MdPeople />, label: 'Customers', href: '/restaurant/customers' },
    { id: 'settings', icon: <MdSettings />, label: 'Settings', href: '/restaurant/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <motion.div
        initial={{ width: 250 }}
        animate={{ width: isSidebarCollapsed ? 80 : 250 }}
        transition={{ duration: 0.3 }}
        className={`bg-white shadow-xl z-10 fixed lg:relative top-0 left-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header / Logo */}
          <div className="px-4 py-6 flex items-center justify-between border-b">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg">
                <MdRestaurant className="text-orange-500 text-2xl" />
              </div>
              {!isSidebarCollapsed && (
                <span className="ml-3 font-bold text-gray-800 text-xl">
                  {restaurantName}
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-500 hover:text-gray-800"
            >
              {isSidebarCollapsed ? ">" : "<"}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 pt-5 pb-4 overflow-y-auto">
            <ul>
              {navItems.map((item) => (
                <li key={item.id} className="mb-1">
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      location.pathname === item.href
                        ? 'bg-orange-50 text-orange-500 border-r-4 border-orange-500'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                    } transition-colors duration-200`}
                  >
                    <div className="text-xl">{item.icon}</div>
                    {!isSidebarCollapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t mb-5">
            <button className="flex items-center w-full px-4 py-3 text-left text-gray-600 hover:bg-orange-50 hover:text-orange-500 rounded-lg transition-colors duration-200">
              <MdOutlineLogout className="text-xl" />
              {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}