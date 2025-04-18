import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriverStats } from "../Redux/slices/driverSlice";
import { useParams, Link } from "react-router-dom";

export default function DriverProfile() {
          const { id } = useParams();
          const dispatch = useDispatch();
          const { selectedDriver, status, error } = useSelector((state) => state.driver);

          useEffect(() => {
            if (id) {
              dispatch(fetchDriverStats(id));
            }
          }, [dispatch, id]);

          if (status === "loading") return <p className="p-6">Loading profile...</p>;
          if (status === "failed") return <p className="p-6 text-red-600">{error}</p>;
          if (!selectedDriver) {
            return (
              <div className="p-6 text-red-600 font-semibold">
                Driver not found.{" "}
                <Link to="/delivery/all-drivers" className="text-blue-500 underline">
                  Back to Drivers
                </Link>
              </div>
            );
          }

          const driver = selectedDriver;


  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-300">
        <h1 className="text-3xl font-bold text-yellow-700 mb-4">Driver Profile</h1>
        <p className="text-xl font-semibold text-gray-700">Name: {driver.name}</p>
        <p className="text-md text-gray-600">ID: {driver.id}</p>
        <p className="text-md text-gray-600">📞 Phone: {driver.phone}</p>
        <p className="text-md text-gray-600">🪪 License No: {driver.licenseNumber}</p>
        <p className="text-md text-gray-600">🚗 Vehicle Type: {driver.vehicleType}</p>
        <p className="text-md text-gray-600">
          Status: <span className="font-semibold">{driver.status}</span>
        </p>
        <p className="text-md text-gray-600">Earnings: ${driver.earnings.toFixed(2)}</p>
        <p className="text-md text-gray-600">Completed Orders: {driver.completedOrders}</p>
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
