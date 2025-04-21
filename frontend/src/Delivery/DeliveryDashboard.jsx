import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { useGetAllDeliveriesQuery } from "../Redux/slices/deliverySlice";
import { getToken } from "../utils/auth";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const { data: deliveries, isLoading, isError, error } = useGetAllDeliveriesQuery();

  // Check authentication
  useEffect(() => {
    const token = getToken();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || userInfo.role !== 'driver') {
      navigate('/delivery/login');
    }
  }, [navigate]);

  if (isLoading) return <p className="text-center mt-6">Loading deliveries...</p>;
  if (isError) return <p className="text-center text-red-500 mt-6">{error?.message || "Failed to load deliveries"}</p>;

  const activeDeliveries = deliveries?.filter(delivery => 
    delivery.status === 'out_for_delivery'
  ) || [];

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Active Deliveries</h1>
      </div>

      <div className="grid gap-6">
        {activeDeliveries.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">No active deliveries at the moment</p>
          </div>
        ) : (
          activeDeliveries.map((delivery) => (
            <div
              key={delivery.deliveryId}
              className="bg-white p-4 rounded-lg shadow-md transition transform hover:scale-105 hover:shadow-lg border border-yellow-400"
            >
              <h2 className="text-lg font-bold text-yellow-600">🛍️ Delivery #{delivery.deliveryId}</h2>
              <p className="text-gray-700 flex items-center">
                <FaMapMarkerAlt className="text-red-500 mr-2" />
                {delivery.customer?.address || 'Address not available'}
              </p>
              <p className="text-gray-700 flex items-center">
                <MdPayment className="text-blue-500 mr-2" />
                Payment: {delivery.payment?.method || 'Not specified'}
              </p>
              <ul className="mt-2 space-y-1">
                {delivery.items?.map((item, idx) => (
                  <li key={idx} className="text-gray-800">
                    🍽️ {item.name} - ${item.price.toFixed(2)}
                  </li>
                )) || <li className="text-gray-500">No items in this delivery</li>}
              </ul>
              <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-gray-800">Total: ${delivery.total?.toFixed(2) || '0.00'}</span>
                <span className="px-3 py-1 text-white text-sm rounded-full bg-orange-500">
                  🚚 Out For Delivery
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/deliveries/${delivery.deliveryId}`}
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
