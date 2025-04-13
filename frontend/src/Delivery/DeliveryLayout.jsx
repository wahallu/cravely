import React from "react";
import { Outlet } from "react-router-dom"; 

const DeliveryLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Delivery Layout Header */}
      <header className="bg-orange-400 text-black p-4">
        <h1 className="text-2xl font-bold">🚚 Delivery Management</h1>
      </header>

      {/* Main Content Area */}
      <main className="p-6">
        <Outlet /> 
      </main>
    </div>
  );
};

export default DeliveryLayout;
