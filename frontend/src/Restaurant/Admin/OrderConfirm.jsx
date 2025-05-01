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
  FaSearch,
  FaArrowLeft,
  FaTimes,
  FaEnvelope,
  FaReceipt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useGetRestaurantProfileQuery } from "../../Redux/slices/restaurantSlice";
import {
  useGetRestaurantOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../../Redux/slices/restaurantOrderApi";
import { getRestaurantInfo } from "../../utils/restaurantAuth";

const OrderConfirm = () => {
  // State variables
  const [activeOrder, setActiveOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]); // Add this state variable
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // Add tab state for switching between pending and confirmed orders

  // Get authenticated restaurant information
  const restaurantInfo = getRestaurantInfo();
  const { data: restaurantData } = useGetRestaurantProfileQuery();

  // Determine the restaurant ID from available sources
  const restaurantId =
    restaurantInfo?.id ||
    restaurantInfo?._id ||
    restaurantData?.data?._id ||
    restaurantData?._id;

  // Fetch restaurant orders with a status filter for "pending" and "confirmed"
  const {
    data: pendingOrdersData = { orders: [] },
    isLoading: isLoadingPending,
    error: pendingError,
    refetch: refetchPending,
  } = useGetRestaurantOrdersQuery(
    { restaurantId, status: "pending" },
    {
      skip: !restaurantId,
      pollingInterval: 30000, // Poll every 30 seconds for new orders
      refetchOnMountOrArgChange: true,
    }
  );

  // Fetch confirmed orders separately
  const {
    data: confirmedOrdersData = { orders: [] },
    isLoading: isLoadingConfirmed,
    error: confirmedError,
    refetch: refetchConfirmed,
  } = useGetRestaurantOrdersQuery(
    { restaurantId, status: "confirmed" },
    {
      skip: !restaurantId,
      pollingInterval: 30000,
      refetchOnMountOrArgChange: true,
    }
  );

  // Fetch preparing orders separately
  const {
    data: preparingOrdersData = { orders: [] },
    isLoading: isLoadingPreparing,
    error: preparingError,
    refetch: refetchPreparing,
  } = useGetRestaurantOrdersQuery(
    { restaurantId, status: "preparing" },
    {
      skip: !restaurantId,
      pollingInterval: 30000,
      refetchOnMountOrArgChange: true,
    }
  );

  // Update status mutation hook
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  // Filter orders based on search term
  useEffect(() => {
    if (pendingOrdersData && pendingOrdersData.orders) {
      let filtered = [...pendingOrdersData.orders];

      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(
          (order) =>
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.fullName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.customer?.phone?.includes(searchTerm)
        );
      }

      setFilteredOrders(filtered);
    }

    if (confirmedOrdersData && confirmedOrdersData.orders) {
      let filtered = [...confirmedOrdersData.orders];
      
      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(
          (order) =>
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.fullName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.customer?.phone?.includes(searchTerm)
        );
      }

      setConfirmedOrders(filtered);
    }

    if (preparingOrdersData && preparingOrdersData.orders) {
      let filtered = [...preparingOrdersData.orders];
      
      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(
          (order) =>
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.fullName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.customer?.phone?.includes(searchTerm)
        );
      }

      setPreparingOrders(filtered);
    }
  }, [pendingOrdersData, confirmedOrdersData, preparingOrdersData, searchTerm]);

  // Handle errors in loading orders
  useEffect(() => {
    if (pendingError || confirmedError || preparingError) {
      toast.error("Failed to load orders. Please try again.");
      console.error("Error fetching restaurant orders:", pendingError || confirmedError || preparingError);
    }
  }, [pendingError, confirmedError, preparingError]);

  const handleUpdateOrderStatus = async (
    orderId,
    newStatus,
    restaurantName,
    estimatedTime
  ) => {
    try {
      setIsUpdating(true);

      // Convert time estimate string to an actual Date object
      let estimatedDeliveryDate = null;
      if (estimatedTime) {
        // Parse the minutes from the string format (e.g., "20-30 min")
        const minutesMatch = estimatedTime.match(/(\d+)/);
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 30; // Default to 30 mins
        
        // Calculate estimated delivery time based on current time + minutes
        estimatedDeliveryDate = new Date();
        estimatedDeliveryDate.setMinutes(estimatedDeliveryDate.getMinutes() + minutes);
      }

      // Use the RTK Query mutation with the correct request format
      const result = await updateOrderStatus({
        orderId,
        status: newStatus,
        // Send the Date object instead of the string
        estimatedDelivery: estimatedDeliveryDate,
        restaurantName: restaurantName,
        // Keep the original string for display purposes
        estimatedTimeDisplay: estimatedTime
      }).unwrap();

      // Close modal if open
      setIsModalOpen(false);

      // Show success message
      const statusMessages = {
        confirmed: "Order confirmed successfully!",
        preparing: "Order marked as preparing!",
        out_for_delivery: "Order is out for delivery!",
        delivered: "Order marked as delivered!",
        canceled: "Order has been canceled.",
      };

      toast.success(statusMessages[newStatus] || "Order status updated!");

      // Refetch orders to get the latest data
      refetchPending();
      refetchConfirmed();
      refetchPreparing();
    } catch (error) {
      console.error("Status update error:", error);
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

  if (isLoadingPending && isLoadingConfirmed && isLoadingPreparing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Order Management
          </h1>

          {/* Search input */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search by order ID or customer"
              className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-3 px-6 font-medium text-sm transition-colors ${
              activeTab === "pending"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Pending Orders ({filteredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("confirmed")}
            className={`py-3 px-6 font-medium text-sm transition-colors ${
              activeTab === "confirmed"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Confirmed Orders ({confirmedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("preparing")}
            className={`py-3 px-6 font-medium text-sm transition-colors ${
              activeTab === "preparing"
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Preparing Orders ({preparingOrders.length})
          </button>
        </div>

        {/* Pending Orders Section */}
        {activeTab === "pending" && (
          <>
            {/* Orders count */}
            <p className="text-gray-600 mb-4">
              {filteredOrders.length} pending{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </p>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
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
                      <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <FaRegClock className="text-yellow-500 mr-1" />
                        <span>Pending Confirmation</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      {/* Order details... (existing code) */}
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
                      {/* Order summary... (existing code) */}
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
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(
                            order.orderId,
                            "confirmed",
                            restaurantInfo?.name,
                            "30-45 min"
                          )
                        }
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
                        disabled={isUpdating}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty state for pending orders */}
              {filteredOrders.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <FaShoppingBag className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">
                    No Pending Orders
                  </h2>
                  <p className="text-gray-500 mt-2">
                    {searchTerm
                      ? `No orders matching "${searchTerm}" found.`
                      : "There are no pending orders at the moment."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Confirmed Orders Section */}
        {activeTab === "confirmed" && (
          <>
            {/* Confirmed orders count */}
            <p className="text-gray-600 mb-4">
              {confirmedOrders.length} confirmed{" "}
              {confirmedOrders.length === 1 ? "order" : "orders"} found
            </p>

            {/* Confirmed Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {confirmedOrders.map((order) => (
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
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <FaCheckCircle className="text-blue-500 mr-1" />
                        <span>Confirmed</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      {/* Order details */}
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
                      {/* Order summary */}
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

                    {/* Order actions - Now with preparing button */}
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(
                            order.orderId,
                            "preparing",
                            restaurantInfo?.name,
                            "20-30 min"
                          )
                        }
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : (
                          <FaUtensils className="mr-2" />
                        )}
                        Start Preparing
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty state for confirmed orders */}
              {confirmedOrders.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <FaShoppingBag className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">
                    No Confirmed Orders
                  </h2>
                  <p className="text-gray-500 mt-2">
                    {searchTerm
                      ? `No orders matching "${searchTerm}" found.`
                      : "There are no confirmed orders waiting to be prepared."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Preparing Orders Section */}
        {activeTab === "preparing" && (
          <>
            {/* Preparing orders count */}
            <p className="text-gray-600 mb-4">
              {preparingOrders.length} preparing{" "}
              {preparingOrders.length === 1 ? "order" : "orders"} found
            </p>

            {/* Preparing Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {preparingOrders.map((order) => (
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
                      <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <FaUtensils className="text-indigo-500 mr-1" />
                        <span>Preparing</span>
                      </div>
                    </div>

                    {/* Order details - Same as other tabs */}
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

                    {/* Order summary - Same as other tabs */}
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

                    {/* Order actions - Now with "Ready for Pickup" button */}
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(
                            order.orderId,
                            "out_for_delivery",
                            restaurantInfo?.name,
                            "10-15 min"
                          )
                        }
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : (
                          <FaMotorcycle className="mr-2" />
                        )}
                        Ready for Pickup
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty state for preparing orders */}
              {preparingOrders.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <FaUtensils className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">
                    No Orders Being Prepared
                  </h2>
                  <p className="text-gray-500 mt-2">
                    {searchTerm
                      ? `No orders matching "${searchTerm}" found.`
                      : "There are no orders currently being prepared."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal - update to handle both pending and confirmed orders */}
      <AnimatePresence>
        {isModalOpen && activeOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Modal Header */}
              <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaReceipt className="text-orange-500 text-xl mr-3" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Order Details
                      </h2>
                      <p className="text-gray-600">
                        ID: {activeOrder.orderId || activeOrder._id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Order Status Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full mr-4 ${
                        activeOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-500' : 'bg-blue-100 text-blue-500'
                      }`}>
                        {activeOrder.status === 'pending' ? <FaRegClock /> : <FaCheckCircle />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {formatStatus(activeOrder.status)}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(activeOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {activeOrder.status === 'pending' && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              activeOrder.orderId,
                              "confirmed",
                              restaurantInfo?.name,
                              "30-45 min"
                            )
                          }
                          disabled={isUpdating}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                        >
                          {isUpdating ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaCheckCircle className="mr-2" />
                          )}
                          Confirm Order
                        </button>
                      )}
                      
                      {activeOrder.status === 'confirmed' && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              activeOrder.orderId,
                              "preparing",
                              restaurantInfo?.name,
                              "20-30 min"
                            )
                          }
                          disabled={isUpdating}
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                        >
                          {isUpdating ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaUtensils className="mr-2" />
                          )}
                          Start Preparing
                        </button>
                      )}

                      {activeOrder.status === 'preparing' && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              activeOrder.orderId, 
                              "out_for_delivery", 
                              restaurantInfo?.name,
                              "10-15 min"
                            )
                          }
                          disabled={isUpdating}
                          className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center"
                        >
                          {isUpdating ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <FaMotorcycle className="mr-2" />
                          )}
                          Ready for Pickup
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(
                            activeOrder.orderId,
                            "canceled",
                            restaurantInfo?.name
                          )
                        }
                        disabled={isUpdating}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                      >
                        {isUpdating ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : (
                          <FaTimesCircle className="mr-2" />
                        )}
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remaining modal content stays the same... */}
                {/* Order Items Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <FaShoppingBag className="mr-2 text-orange-500" />
                    Order Items ({activeOrder.items?.length || 0})
                  </h3>

                  <div className="space-y-4">
                    {activeOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start">
                          <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 mr-3 flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover rounded-lg"
                              />
                            ) : (
                              item.name?.charAt(0) || "I"
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                            {item.note && (
                              <p className="text-sm text-gray-500 mt-1">
                                Note: {item.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-800">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">
                        $$
                        {activeOrder.subtotal?.toFixed(2) ||
                          activeOrder.items
                            ?.reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                            .toFixed(2) ||
                          "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-800">
                        ${activeOrder.tax?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-gray-800">
                        ${activeOrder.deliveryFee?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-bold text-xl text-orange-600">
                        ${activeOrder.total?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <FaUser className="mr-2 text-orange-500" />
                    Customer Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaUser />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-800">
                          {activeOrder.customer?.fullName || "Customer"}
                        </p>
                      </div>
                    </div>

                    {activeOrder.customer?.email && (
                      <div className="flex items-start">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                          <FaEnvelope />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">
                            {activeOrder.customer.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeOrder.customer?.phone && (
                      <div className="flex items-start">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                          <FaPhone />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">
                            {activeOrder.customer.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-orange-500" />
                    Delivery Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Delivery Address
                        </p>
                        <p className="font-medium text-gray-800">
                          {activeOrder.customer?.address
                            ? `${activeOrder.customer.address}${
                                activeOrder.customer.city
                                  ? `, ${activeOrder.customer.city}`
                                  : ""
                              }${
                                activeOrder.customer.state
                                  ? ` ${activeOrder.customer.state}`
                                  : ""
                              }${
                                activeOrder.customer.zipCode
                                  ? ` ${activeOrder.customer.zipCode}`
                                  : ""
                              }`
                            : "No address provided"}
                        </p>
                      </div>
                    </div>

                    {activeOrder.payment && (
                      <div className="flex items-start">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-500 mr-3 mt-1">
                          {getPaymentInfo(activeOrder.payment).icon}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Payment Method
                          </p>
                          <p className="font-medium text-gray-800">
                            {getPaymentInfo(activeOrder.payment).text}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeOrder.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Order Notes:
                        </p>
                        <p className="text-gray-600">{activeOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                  
                  {activeOrder.status === 'pending' && (
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(
                          activeOrder.orderId, 
                          "confirmed", 
                          restaurantInfo?.name,
                          "30-45 min"
                        )
                      }
                      disabled={isUpdating}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center"
                    >
                      {isUpdating ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheckCircle className="mr-2" />
                      )}
                      Confirm Order
                    </button>
                  )}
                  
                  {activeOrder.status === 'confirmed' && (
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(
                          activeOrder.orderId, 
                          "preparing", 
                          restaurantInfo?.name,
                          "20-30 min"
                        )
                      }
                      disabled={isUpdating}
                      className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center"
                    >
                      {isUpdating ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaUtensils className="mr-2" />
                      )}
                      Start Preparing
                    </button>
                  )}

                  {activeOrder.status === 'preparing' && (
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(
                          activeOrder.orderId, 
                          "out_for_delivery", 
                          restaurantInfo?.name,
                          "10-15 min"
                        )
                      }
                      disabled={isUpdating}
                      className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center"
                    >
                      {isUpdating ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaMotorcycle className="mr-2" />
                      )}
                      Ready for Pickup
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleUpdateOrderStatus(
                        activeOrder.orderId,
                        "canceled",
                        restaurantInfo?.name
                      )
                    }
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                  >
                    {isUpdating ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaTimesCircle className="mr-2" />
                    )}
                    Cancel
                  </button>
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
