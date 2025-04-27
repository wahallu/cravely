import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaUtensils, FaMotorcycle, FaCheckCircle } from "react-icons/fa";
import { MdPayment, MdRestaurant } from "react-icons/md";
import { useGetAvailableOrdersForDeliveryQuery, useUpdateOrderStatusMutation, useGetDriverOrdersQuery } from "../Redux/slices/orderSlice";
import { getToken } from "../utils/auth";
import toast from "react-hot-toast";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [isAssigning, setIsAssigning] = useState(false);

  // Get available orders ready for pickup (using the dedicated endpoint)
  const { 
    data: availableOrders = [], 
    isLoading: isLoadingOrders, 
    isError: isOrderError, 
    error: orderError,
    refetch: refetchOrders
  } = useGetAvailableOrdersForDeliveryQuery();

  // Get orders already assigned to this driver (status "out_for_delivery")
  const {
    data: myDeliveries = [],
    isLoading: isLoadingMyDeliveries,
    isError: isMyDeliveriesError,
    error: myDeliveriesError,
    refetch: refetchMyDeliveries
  } = useGetDriverOrdersQuery();

  // Mutation to update order status
  const [updateOrderStatus, { isLoading: isUpdatingOrder }] = useUpdateOrderStatusMutation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check authentication
  useEffect(() => {
    const token = getToken();
    const userInfoData = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || userInfoData.role !== 'driver') {
      navigate('/delivery/login');
    } else {
      setUserInfo(userInfoData);
    }
  }, [navigate]);

  // Handle order pickup
  const handlePickupOrder = async (order) => {
    try {
      setIsAssigning(true);
      
      // Make sure we have a valid order ID
      const orderId = order.orderId || order._id;
      
      if (!orderId) {
        toast.error("Invalid order ID");
        return;
      }
      
      console.log("Attempting to pick up order:", orderId);
      
      // Update the order status to "out_for_delivery"
      const result = await updateOrderStatus({
        orderId: orderId,
        status: "out_for_delivery",
        driverId: userInfo.id || userInfo._id,
        driverName: userInfo.name || userInfo.fullName
      }).unwrap();
      
      toast.success(`Order #${orderId} assigned to you for delivery`);
      
      // Refetch both queries to update the lists
      refetchOrders();
      refetchMyDeliveries();
    } catch (error) {
      console.error("Error picking up order:", error);
      // More detailed error message for debugging
      if (error.data) {
        console.error("API Error details:", error.data);
      }
      
      toast.error(error?.data?.message || "Failed to pick up order");
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle marking order as delivered
  const handleDeliverOrder = async (order) => {
    try {
      // Make sure we have a valid order ID
      const orderId = order.orderId || order._id;
      
      if (!orderId) {
        toast.error("Invalid order ID");
        return;
      }
      
      // Update the order status to "delivered"
      const result = await updateOrderStatus({
        orderId: orderId,
        status: "delivered",
        // Keep the driver information
        driverId: userInfo.id || userInfo._id,
        driverName: userInfo.name || userInfo.fullName
      }).unwrap();
      
      toast.success(`Order #${orderId} marked as delivered!`);
      
      // Refetch driver orders to update the UI
      refetchMyDeliveries();
      
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      if (error.data) {
        console.error("API Error details:", error.data);
      }
      
      toast.error(error?.data?.message || "Failed to mark order as delivered");
    }
  };

  // Loading states
  if (isLoadingOrders || isLoadingMyDeliveries) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (isOrderError || isMyDeliveriesError) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          <p className="font-bold">Error loading orders</p>
          <p>{orderError?.message || myDeliveriesError?.message || "Failed to load orders"}</p>
        </div>
      </div>
    );
  }

  // Filter active deliveries that I'm currently delivering
  const myActiveDeliveries = myDeliveries.filter(delivery => 
    delivery.status === 'out_for_delivery',
  );

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      {/* My Active Deliveries */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaMotorcycle className="text-yellow-600 mr-2" /> 
          My Active Deliveries ({myActiveDeliveries.length})
        </h1>

        <div className="grid gap-6">
          {myActiveDeliveries.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">You don't have any active deliveries</p>
            </div>
          ) : (
            myActiveDeliveries.map((delivery) => (
              <div
                key={delivery.deliveryId || delivery._id || delivery.orderId}
                className="bg-white p-5 rounded-lg shadow-md transition hover:shadow-lg border-l-4 border-yellow-500"
              >
                <h2 className="text-lg font-bold text-yellow-600">
                  🛍️ Delivery #{delivery.deliveryId || delivery.orderId}
                </h2>
                <p className="text-gray-700 flex items-center mt-2">
                  <FaMapMarkerAlt className="text-red-500 mr-2" />
                  {delivery.customer?.address || 'Address not available'}
                </p>
                <p className="text-gray-700 flex items-center mt-2">
                  <MdPayment className="text-blue-500 mr-2" />
                  Payment: {delivery.payment?.method || 'Not specified'}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    to={`/orders/${delivery.orderId}`}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View Order Details
                  </Link>
                  
                  <button
                    onClick={() => handleDeliverOrder(delivery)}
                    disabled={isUpdatingOrder}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center"
                  >
                    {isUpdatingOrder ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                        Delivering...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Mark as Delivered
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Orders for Pickup */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaUtensils className="text-orange-500 mr-2" /> 
          Orders Ready for Pickup ({availableOrders.length || 0})
        </h1>

        <div className="grid gap-6">
          {!availableOrders || availableOrders.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">No orders available for pickup at the moment</p>
            </div>
          ) : (
            availableOrders.map((order) => (
              <div
                key={order.orderId || order._id}
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Order #{order.orderId}
                    </h2>
                    <p className="text-orange-500 font-medium flex items-center mt-1">
                      <MdRestaurant className="mr-1" />
                      {order.restaurant?.name || 'Restaurant'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    Ready for Pickup
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700 flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {order.customer?.address || 'Address not available'}
                  </p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 font-medium">Items:</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="text-gray-800 flex items-center">
                          <span className="w-5 inline-block">×{item.quantity}</span>
                          <span>{item.name}</span>
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="text-gray-500 text-sm">
                          + {order.items.length - 3} more items
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-800">
                    Total: ${order.total?.toFixed(2) || '0.00'}
                  </span>
                  <button
                    onClick={() => handlePickupOrder(order)}
                    disabled={isAssigning || isUpdatingOrder}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center"
                  >
                    {isAssigning ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <FaMotorcycle className="mr-2" />
                        Pick Up Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}