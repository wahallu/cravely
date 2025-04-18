import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

const DeliveryLayout = () => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "bg-white text-orange-500 font-semibold" : "text-white";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-orange-400 text-black p-4">
        <h1 className="text-2xl font-bold">🚚 Delivery Management</h1>
      </header>

      {/* Navigation */}
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

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;
