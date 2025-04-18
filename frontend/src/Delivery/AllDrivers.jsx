import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllDrivers } from "../Redux/slices/driverSlice";


export default function AllDrivers() {
  const dispatch = useDispatch();
  const { drivers, status, error } = useSelector((state) => state.driver);

  useEffect(() => {
    dispatch(fetchAllDrivers());
  }, [dispatch]);

  if (status === "loading") return <p className="p-6">Loading drivers...</p>;
  if (status === "failed") return <p className="p-6 text-red-500">{error}</p>;
  return (
    <div className="min-h-screen bg-yellow-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-yellow-700">All Drivers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dummyDrivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white shadow-lg p-4 rounded-lg border border-yellow-400 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-bold text-gray-800">{driver.name}</h2>
            <p className="text-gray-600">ID: {driver.id}</p>
            <p
              className={`mt-2 font-semibold ${
                driver.status === "Available"
                  ? "text-green-600"
                  : driver.status === "On Delivery"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              Status: {driver.status}
            </p>
            <Link
             to={`/delivery/drivers/${driver.id}`}
             className="mt-4 inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
            View Profile
           </Link>

          </div>
        ))}
      </div>
    </div>
  );
}
