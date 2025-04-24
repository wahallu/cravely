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
import { toast } from "react-toastify";
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
  const [searchTerm, setSearchTerm] = useState("");

  // Get authenticated restaurant information
  const restaurantInfo = getRestaurantInfo();
  const { data: restaurantData } = useGetRestaurantProfileQuery();

  // Determine the restaurant ID from available sources
  const restaurantId =
    restaurantInfo?.id ||
    restaurantInfo?._id ||
    restaurantData?.data?._id ||
    restaurantData?._id;

  // Fetch restaurant orders with a status filter for "pending"
  const {
    data: ordersData = { orders: [] },
    isLoading,
    error,
    refetch,
  } = useGetRestaurantOrdersQuery(
    { restaurantId, status: "pending" },
    {
      skip: !restaurantId,
      pollingInterval: 30000, // Poll every 30 seconds for new orders
      refetchOnMountOrArgChange: true,
    }
  );

  // Update status mutation hook
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  // Filter orders based on search term
  useEffect(() => {
    if (ordersData && ordersData.orders) {
      let filtered = [...ordersData.orders];

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
  }, [ordersData, searchTerm]);

  // Handle errors in loading orders
  useEffect(() => {
    if (error) {
      toast.error("Failed to load pending orders. Please try again.");
      console.error("Error fetching restaurant orders:", error);
    }
  }, [error]);

  const handleUpdateOrderStatus = async (
    orderId,
    newStatus,
    restaurantName,
    estimatedTime
  ) => {
    try {
      setIsUpdating(true);

      // Use the RTK Query mutation with the correct request format
      const result = await updateOrderStatus({
        orderId, // The order ID to update
        status: newStatus, // The new status (e.g., 'confirmed', 'preparing', etc.)
        // Include any additional data needed for notifications
        estimatedDelivery: estimatedTime,
        restaurantName: restaurantName,
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
      refetch();
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

  if (isLoading) {
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
            Pending Orders Management
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
                  <button
                    onClick={() =>
                      handleUpdateOrderStatus(order.orderId, "confirmed")
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
        </div>

        {/* Empty state */}
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
                      <div className="bg-yellow-100 p-3 rounded-full mr-4 text-yellow-500">
                        <FaRegClock />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          Pending Confirmation
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(activeOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(
                            activeOrder.orderId,
                            "confirmed"
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
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(
                            activeOrder.orderId,
                            "canceled"
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
                        $
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
                  <button
                    onClick={() =>
                      handleUpdateOrderStatus(activeOrder.orderId, "confirmed")
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
