import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNavigation from './SidebarNavigation';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className='flex bg-gray-100 min-h-screen'>
      <SidebarNavigation 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                className="lg:hidden mr-4 text-gray-600 focus:outline-none"
                onClick={toggleSidebar}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            {/* Add any header content here */}
          </div>
        </header>
        <main className='flex-1 overflow-y-auto'>
          <Outlet context={{ toggleSidebar }} />
        </main>
      </div>
    </div>
  );
}
