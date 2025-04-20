import React from "react";
import { useGetUserOrdersQuery } from "../Redux/slices/orderSlice";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";

export default function DeliveryDashboard() {
  // Fetch all orders from the Order backend
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

  // Show loading state
  if (isLoading) return <p className="text-center mt-6">Loading deliveries...</p>;
  
  // Show error state
  if (isError) return <p className="text-center text-red-500 mt-6">{error?.message || "Failed to load orders"}</p>;

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
        {deliveryOrders.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">No active deliveries at the moment</p>
          </div>
        ) : (
          deliveryOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white p-4 rounded-lg shadow-md transition transform hover:scale-105 hover:shadow-lg border border-yellow-400"
            >
              <h2 className="text-lg font-bold text-yellow-600">🛍️ Order #{order.orderId}</h2>
              <p className="text-gray-700 flex items-center">
                <FaMapMarkerAlt className="text-red-500 mr-2" />
                {order.customer?.address || 'Address not available'}
              </p>
              <p className="text-gray-700 flex items-center">
                <MdPayment className="text-blue-500 mr-2" />
                Payment: {order.payment?.method || 'Not specified'}
              </p>
              <ul className="mt-2 space-y-1">
                {order.items?.map((item, idx) => (
                  <li key={idx} className="text-gray-800">
                    🍽️ {item.name} - ${item.price.toFixed(2)}
                  </li>
                )) || <li className="text-gray-500">No items in this order</li>}
              </ul>
              <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-gray-800">Total: ${order.total?.toFixed(2) || '0.00'}</span>
                <span className="px-3 py-1 text-white text-sm rounded-full bg-orange-500">
                  🚚 Out For Delivery
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
