import React from "react";
import { useParams, Link } from "react-router-dom";

const dummyDrivers = {
  D001: {
    name: "Ayesh Silva",
    id: "D001",
    status: "Available",
    earnings: 430.25,
    completedOrders: 28,
    phone: "077-1234567",
    licenseNumber: "B1234567",
    vehicleType: "Van",
  },
  D002: {
    name: "Nimal Perera",
    id: "D002",
    status: "On Delivery",
    earnings: 210.75,
    completedOrders: 14,
    phone: "071-9876543",
    licenseNumber: "C9876543",
    vehicleType: "Bike",
  },
  D003: {
    name: "Kasun Fernando",
    id: "D003",
    status: "Unavailable",
    earnings: 0,
    completedOrders: 0,
    phone: "075-1122334",
    licenseNumber: "D4567890",
    vehicleType: "Car",
  },
};

export default function DriverProfile() {
  const { id } = useParams();
  const driver = dummyDrivers[id];

  if (!driver) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Driver not found. <Link to="/drivers" className="text-blue-500 underline">Back to Drivers</Link>
      </div>
    );
  }

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
