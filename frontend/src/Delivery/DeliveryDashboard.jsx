import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";

const orders = [
  {
    id: "ORD-1234",
    customer: "Selena Heather",
    address: "456 Oak Street, Springfield",
    items: [{ name: "Pepperoni Pizza", price: 15.99 }, { name: "Coke", price: 2.50 }],
    total: 18.49,
    paymentMethod: "Card",
    driverStatus: "In Transit",
  },
  {
    id: "ORD-5678",
    customer: "anne marie",
    address: "789 Maple Ave, Springfield",
    items: [{ name: "Cheeseburger", price: 12.99 }, { name: "Fries", price: 4.50 }],
    total: 17.49,
    paymentMethod: "Cash on Delivery",
    driverStatus: "Delivered",
  },
];

export default function DeliveryDashboard() {
  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-yellow-400 shadow-md p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-black">📦 Delivery Dashboard</h1>
        <Link
          to="/delivery/drivers"
          className="bg-orange-600 text-black px-4 py-2 rounded hover:bg-orange-700 transition"
        >
          View Driver Dashboard
        </Link>
      </div>

      {/* Orders List */}
      <div className="mt-6 grid gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-lg shadow-md transition transform hover:scale-105 hover:shadow-lg border border-yellow-400"
          >
            <h2 className="text-lg font-bold text-yellow-600">🛍️ Order {order.id}</h2>
            <p className="text-gray-700 flex items-center">
              <FaMapMarkerAlt className="text-red-500 mr-2" />
              {order.address}
            </p>
            <p className="text-gray-700 flex items-center">
              <MdPayment className="text-blue-500 mr-2" />
              Payment: {order.paymentMethod}
            </p>
            <ul className="mt-2 space-y-1">
              {order.items.map((item, idx) => (
                <li key={idx} className="text-gray-800">
                  🍽️ {item.name} - ${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold text-gray-800">Total: ${order.total.toFixed(2)}</span>
              <span
                className={`px-3 py-1 text-white text-sm rounded-full ${
                  order.driverStatus === "Delivered" ? "bg-green-500" : "bg-yellow-500"
                }`}
              >
                🚚 {order.driverStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
