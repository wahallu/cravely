import React from "react";
import { Link } from "react-router-dom";
import { useGetAllDriversQuery } from "../Redux/slices/driverSlice";

export default function AllDrivers() {
  const {
    data: drivers = [],
    isLoading,
    isError,
    error
  } = useGetAllDriversQuery();

  if (isLoading) return <p className="p-6">Loading drivers...</p>;
  if (isError) return <p className="p-6 text-red-500">{error?.message || "Failed to load drivers"}</p>;

  return (
    <div className="min-h-screen bg-yellow-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-yellow-700">All Drivers</h1>
      
      {drivers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No drivers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div
              key={driver._id}
              className="bg-white shadow-lg p-4 rounded-lg border border-yellow-400 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-bold text-gray-800">{driver.name || "Unnamed Driver"}</h2>
              <p className="text-gray-600">ID: {driver.driverId}</p>
              <p className={`mt-2 font-semibold ${
                driver.status === "Available" ? "text-green-600" :
                driver.status === "On Delivery" ? "text-blue-600" : "text-red-600"
              }`}>
                Status: {driver.status || "Unknown"}
              </p>
              <Link
                to={`/delivery/drivers/${driver._id}`}
                className="mt-4 inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
