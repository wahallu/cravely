import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaRegClock,
  FaUtensils,
  FaMotorcycle,
  FaTimesCircle,
  FaShoppingBag,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaMoneyBillWave,
  FaCreditCard,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { useGetRestaurantProfileQuery } from "../../Redux/slices/restaurantSlice";

const OrderConfirm = () => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get authenticated restaurant information
  const { data: restaurantData } = useGetRestaurantProfileQuery();
  const restaurantId = restaurantData?.data?._id;

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    if (!restaurantId) {
      // Important: Set loading to false if we have no restaurant ID
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/restaurants/orders?status=pending`
      );
      // Make sure to handle the case where orders might be undefined
      setOrders(response.data?.data?.orders || []);
    } catch (error) {
      console.error("Failed to fetch pending orders:", error);
      toast.error("Failed to load pending orders. Please try again.");
      // Important: Set orders to empty array on error
      setOrders([]);
    } finally {
      // Always set loading to false, even if there was an error
      setIsLoading(false);
    }
  };

  // Load orders when component mounts or restaurantId changes
  useEffect(() => {
    if (restaurantId) {
      fetchPendingOrders();
    } else if (restaurantData !== undefined) {
      // If restaurantData has loaded but there's no ID, still set loading to false
      setIsLoading(false);
    }
    // Add restaurantData as a dependency to properly handle its loading state
  }, [restaurantId, restaurantData]);

  // Add this after your existing useEffect
  useEffect(() => {
    // Only set up polling if we have a restaurantId
    if (!restaurantId) return;
    
    // Poll for new orders every 30 seconds
    const intervalId = setInterval(fetchPendingOrders, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [restaurantId]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);

      // Call the restaurant service endpoint
      await axios.put(`/api/restaurants/orders/${orderId}/status`, {
        status: newStatus,
      });

      // Close modal if open
      setIsModalOpen(false);

      // Refresh the orders list
      fetchPendingOrders();

      // Show success message
      const statusMessages = {
        confirmed: "Order confirmed successfully!",
        preparing: "Order marked as preparing!",
        out_for_delivery: "Order is out for delivery!",
        delivered: "Order marked as delivered!",
        canceled: "Order has been canceled.",
      };

      toast.success(statusMessages[newStatus] || "Order status updated!");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const openOrderDetails = (order) => {
    setActiveOrder(order);
    setIsModalOpen(true);
  };

  // Get status icon based on order status
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaRegClock className="text-yellow-500" />;
      case "confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "preparing":
        return <FaUtensils className="text-indigo-500" />;
      case "out_for_delivery":
        return <FaMotorcycle className="text-purple-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "canceled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaRegClock className="text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case "pending":
        return "Pending Confirmation";
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "canceled":
        return "Canceled";
      default:
        return status;
    }
  };

  // Get payment method icon and text
  const getPaymentInfo = (payment) => {
    if (!payment) {
      return {
        icon: <FaMoneyBillWave className="text-green-500" />,
        text: "Cash on Delivery",
      };
    }

    switch (payment.method) {
      case "card":
        return {
          icon: <FaCreditCard className="text-blue-500" />,
          text: `Card (••••${payment.last4 || "****"})`,
        };
      case "cash":
      default:
        return {
          icon: <FaMoneyBillWave className="text-green-500" />,
          text: "Cash on Delivery",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-orange-500 text-4xl mr-3" />
        <span className="text-gray-700 font-medium">Loading orders...</span>
      </div>
    );
  }

  if (!restaurantId && restaurantData !== undefined) {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              Restaurant Profile Not Found
            </h2>
            <p className="text-gray-500 mt-2">
              Please make sure you're logged in with a restaurant account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Pending Orders Management
        </h1>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <motion.div
              key={order.orderId || order._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">
                      {order.orderId}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center 
                    ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "preparing"
                        ? "bg-indigo-100 text-indigo-700"
                        : order.status === "out_for_delivery"
                        ? "bg-purple-100 text-purple-700"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{formatStatus(order.status)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FaUser className="mr-2" />
                    <span>{order.customer?.fullName || "Customer"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FaPhone className="mr-2" />
                    <span>{order.customer?.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {order.customer?.address || "No address provided"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">
                      {order.items?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium flex items-center">
                      {getPaymentInfo(order.payment).icon}
                      <span className="ml-1">
                        {getPaymentInfo(order.payment).text}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Total:</span>
                    <span className="text-orange-600 font-bold">
                      ${(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order actions */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => openOrderDetails(order)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </button>

                  {order.status === "pending" && (
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(order.orderId, "confirmed")
                      }
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
                      disabled={isUpdating}
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FaShoppingBag className="text-gray-300 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              No Pending Orders
            </h2>
            <p className="text-gray-500 mt-2">
              There are no pending orders at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isModalOpen && activeOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Order ID</span>
                    <h3 className="font-bold text-xl text-gray-800">
                      {activeOrder.orderId}
                    </h3>
                  </div>
                  <div
                    className={`px-4 py-1 rounded-full text-sm font-medium flex items-center 
                    ${
                      activeOrder.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : activeOrder.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : activeOrder.status === "preparing"
                        ? "bg-indigo-100 text-indigo-700"
                        : activeOrder.status === "out_for_delivery"
                        ? "bg-purple-100 text-purple-700"
                        : activeOrder.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {getStatusIcon(activeOrder.status)}
                    <span className="ml-1">
                      {formatStatus(activeOrder.status)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Customer Information
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="mb-3 sm:mb-0">
                      <div className="flex items-center mb-1">
                        <FaUser className="text-gray-400 mr-2" />
                        <span className="font-medium">
                          {activeOrder.customer?.fullName || "Customer"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaPhone className="text-gray-400 mr-2" />
                        <span>{activeOrder.customer?.phone || "No phone"}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-gray-400 mr-2 mt-1" />
                        <span className="text-sm text-gray-600">
                          {activeOrder.customer?.address ||
                            "No address provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="font-medium text-gray-800 mb-3">Order Items</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Item
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">
                          Qty
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">
                          Price
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrder.items?.map((item) => (
                        <tr
                          key={item.id || item._id}
                          className="border-b border-gray-200"
                        >
                          <td className="py-3 px-4 text-gray-800">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-800">
                            ${(item.price || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-800 font-medium">
                            $
                            {((item.quantity || 0) * (item.price || 0)).toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between mb-6">
                  <div className="w-1/2">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {getPaymentInfo(activeOrder.payment).icon}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {getPaymentInfo(activeOrder.payment).text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activeOrder.payment?.status === "completed"
                        ? "Payment completed"
                        : "Payment will be collected on delivery"}
                    </p>
                  </div>
                  <div className="w-1/2 pl-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-800">
                        ${(activeOrder.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-800">
                        ${(activeOrder.tax || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="text-gray-800">
                        ${(activeOrder.deliveryFee || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-orange-600">
                        ${(activeOrder.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    Close
                  </button>

                  {activeOrder.status === "pending" && (
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(
                          activeOrder.orderId,
                          "confirmed"
                        )
                      }
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
                      disabled={isUpdating}
                    >
                      <FaCheckCircle className="mr-2" />
                      Confirm Order
                    </button>
                  )}

                  {activeOrder.status === "pending" && (
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(activeOrder.orderId, "canceled")
                      }
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center"
                      disabled={isUpdating}
                    >
                      <FaTimesCircle className="mr-2" />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderConfirm;
