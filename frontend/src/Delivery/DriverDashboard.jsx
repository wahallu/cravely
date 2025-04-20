import React from "react";
import { Link } from "react-router-dom";
import { FaMotorcycle, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import { useGetUserOrdersQuery } from "../Redux/slices/orderSlice";

export default function DriverDashboard() {
  // Fetch all orders and filter for out_for_delivery
  const {
    data: ordersData,
    isLoading,
    isError,
    error
  } = useGetUserOrdersQuery();

  // Filter orders with out_for_delivery status
  const deliveryOrders = ordersData?.filter(order => 
    order.status === 'out_for_delivery'
  ) || [];

  // Calculate total earnings from delivery orders
  const totalEarnings = deliveryOrders.reduce((sum, order) => 
    sum + (order.deliveryFee || 0), 0
  );

  if (isLoading) return <p className="text-center mt-6">Loading orders...</p>;
  if (isError) return <p className="text-center text-red-500 mt-6">{error?.message || "Failed to load orders"}</p>;

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

      {/* Earnings Summary */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-yellow-400">
        <h2 className="text-2xl font-bold text-yellow-600 flex items-center">
          <FaMoneyBillWave className="text-green-500 mr-2" /> Earnings Overview
        </h2>
        <p className="text-gray-700 mt-2">Total Delivery Earnings: ${totalEarnings.toFixed(2)}</p>
        <p className="text-gray-700">Active Deliveries: {deliveryOrders.length}</p>
      </div>

      {/* Active Deliveries */}
      <div className="mt-6 grid gap-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaMotorcycle className="text-orange-500 mr-2" /> Active Deliveries
        </h2>
        
        {deliveryOrders.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">No active deliveries at the moment</p>
          </div>
        ) : (
          deliveryOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-yellow-400"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.orderId}</h3>
                  <p className="text-gray-600 flex items-center mt-2">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {order.customer?.address}
                  </p>
                </div>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                  ${order.total?.toFixed(2)}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/orders/${order.orderId}`}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
