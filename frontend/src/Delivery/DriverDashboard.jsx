import React from "react";
import { Link } from "react-router-dom";
import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import { useGetDriverStatsQuery } from "../Redux/slices/driverSlice";

export default function DriverDashboard() {
  const driver = localStorage.getItem('user') || 'currentDriver';
  
  // Use RTK Query hook instead of dispatch/selector pattern
  const {
    data: driverStats,
    isLoading,
    isError,
    error
  } = useGetDriverStatsQuery(driver._id);

  if (isLoading) return <p className="text-center mt-6">Loading stats...</p>;
  if (isError) return <p className="text-center text-red-500 mt-6">{error?.message || "Failed to load driver stats"}</p>;

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-yellow-400 shadow-md p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">🚚 Driver Dashboard</h1>
        <Link
          to="/delivery"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Back to Orders
        </Link>
      </div>

      {/* Earnings Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md transition transform hover:scale-105 hover:shadow-lg border border-yellow-400">
        <h2 className="text-2xl font-bold text-yellow-600 flex items-center">
          <FaMoneyBillWave className="text-green-500 mr-2" /> Driver Earnings
        </h2>
        <p className="text-gray-700 mt-2">Total Earned: ${driverStats?.totalEarnings?.toFixed(2) || '0.00'}</p>
      </div>

      {/* Completed Orders Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md transition transform hover:scale-105 hover:shadow-lg border border-yellow-400">
        <h2 className="text-2xl font-bold text-yellow-600 flex items-center">
          <FaCheckCircle className="text-blue-500 mr-2" /> Completed Orders
        </h2>
        <p className="text-gray-700 mt-2">Total Completed: {driverStats?.completedOrders || 0}</p>
      </div>
    </div>
  );
}
