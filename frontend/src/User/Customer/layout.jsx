import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './header'
import Sidebar from './sidebar'

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);

  // Update sidebar width when collapsed state changes
  useEffect(() => {
    setSidebarWidth(isSidebarCollapsed ? 88 : 250);
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className='flex bg-gray-100 min-h-screen'>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div 
        className='flex-1 flex flex-col'
        style={{ 
          marginLeft: window.innerWidth >= 1024 ? `${sidebarWidth}px` : '0',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Header toggleSidebar={toggleSidebar} />
        <main className='flex-1 p-6 overflow-y-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
