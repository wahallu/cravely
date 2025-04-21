import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetDriverByIdQuery } from "../Redux/slices/driverSlice";

export default function DriverProfile() {
  const { id } = useParams();
  
  const {
    data: driver,
    isLoading,
    isError,
    error
  } = useGetDriverByIdQuery(id);

  // Handle loading state
  if (isLoading) return <p className="p-6">Loading profile...</p>;
  
  // Handle error state
  if (isError) return <p className="p-6 text-red-600">{error?.message || "Failed to load driver data"}</p>;
  
  // Handle not found
  if (!driver) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Driver not found.{" "}
        <Link to="/delivery/all-drivers" className="text-blue-500 underline">
          Back to Drivers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-300">
        <h1 className="text-3xl font-bold text-yellow-700 mb-4">Driver Profile</h1>
        <p className="text-xl font-semibold text-gray-700">Name: {driver.name}</p>
        <p className="text-md text-gray-600">ID: {driver.driverId}</p>
        <p className="text-md text-gray-600">📞 Phone: {driver.phone || 'N/A'}</p>
        <p className="text-md text-gray-600">License No: {driver.licenseNumber || 'N/A'}</p>
        <p className="text-md text-gray-600">🚗 Vehicle Type: {driver.vehicleType || 'N/A'}</p>
        <p className="text-md text-gray-600">
          Status: <span className="font-semibold">{driver.status || 'Unknown'}</span>
        </p>
        <p className="text-md text-gray-600">Earnings: ${driver.totalEarnings?.toFixed(2) || '0.00'}</p>
        <p className="text-md text-gray-600">Completed Orders: {driver.completedOrders || 0}</p>
        <Link 
          to="/delivery/all-drivers"
          className="mt-6 inline-block bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          ← Back to All Drivers
        </Link>
      </div>
    </div>
  );
}