import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGetOrderByIdQuery } from "../../src/Redux/slices/orderSlice";
import { useGetDriverByIdQuery } from "../../src/Redux/slices/driverSlice";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCarSide,
  FaMotorcycle,
  FaBicycle,
  FaClock,
  FaRoute,
  FaUtensils,
  FaHome,
  FaArrowLeft
} from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import Header from "../Home/components/header";
import Footer from "../Home/components/footer";
import MapComponent from "./MapComponent";
import { toast } from "react-hot-toast";

// Driver path simulation - we'll use this to simulate driver movement
// In a real app, this would come from your backend with real-time updates
const DRIVER_PATH_SIMULATION = [
  { lat: 40.712776, lng: -74.005974 }, // Start at restaurant
  { lat: 40.714776, lng: -74.003974 },
  { lat: 40.718776, lng: -74.000974 },
  { lat: 40.722776, lng: -73.996974 },
  { lat: 40.726776, lng: -73.990974 },
  { lat: 40.73061, lng: -73.985242 },
  { lat: 40.73061, lng: -73.935242 }, // End at customer
];

export default function LiveTracking() {
  // Get order ID from URL parameter
  const { id } = useParams();
  const [driverLocation, setDriverLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [eta, setEta] = useState(15);
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Add debugging information
  console.log("URL Parameter id:", id);
  
  // Fetch order data using RTK Query
  const {
    data: orderData,
    isLoading,
    error
  } = useGetOrderByIdQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id
  });

  // Extract order details
  const order = orderData?.order || orderData;
  const orderStatus = order?.status || "preparing";
  const driverId = order?.driverId;

  // Format driver ID correctly for API call
  const formattedDriverId = useMemo(() => {
    if (!driverId) return null;
    
    // If it starts with "DRV", use it directly
    if (typeof driverId === 'string' && driverId.startsWith('DRV')) {
      return driverId;
    }
    // Otherwise it might be a MongoDB ID
    return driverId; 
  }, [driverId]);

  // Fetch driver details if we have a driverId
  const {
    data: driverData,
    isLoading: isLoadingDriver
  } = useGetDriverByIdQuery(formattedDriverId, {
    skip: !formattedDriverId
  });

  // Add debugging for the API responses
  useEffect(() => {
    if (orderData) {
      console.log("Order data received:", orderData);
    }
    if (error) {
      console.error("Order fetch error:", error);
    }
    if (driverId) {
      console.log("Driver ID from order:", driverId);
    }
    if (driverData) {
      console.log("Driver data received:", driverData);
    }
  }, [orderData, error, driverId, driverData]);

  // Enhanced driver info by combining order data with driver details
  const driver = useMemo(() => {
    if (order?.driverName) {
      // Base driver info from order
      const baseDriverInfo = {
        name: order.driverName,
        photo: order.driverPhoto || "/hero1.png",
        phone: order.driverPhone || "Not available",
        vehicle: order.driverVehicle || "Motorcycle",
        licensePlate: order.driverLicensePlate || "N/A",
        rating: order.driverRating || 4.8,
      };
      
      // If we have additional driver details from the driver service
      if (driverData) {
        // Handle different response structures
        const driverDetails = driverData.driver || driverData;
        
        return {
          ...baseDriverInfo,
          // Enhanced properties from driver service
          photo: driverDetails.profileImage || baseDriverInfo.photo,
          phone: driverDetails.phone || baseDriverInfo.phone,
          vehicle: driverDetails.vehicleType || baseDriverInfo.vehicle,
          licensePlate: driverDetails.licenseNumber || baseDriverInfo.licensePlate,
          rating: driverDetails.rating || baseDriverInfo.rating,
          deliveryCities: driverDetails.deliveryCities || [],
          completedOrders: driverDetails.completedOrders
        };
      }
      return baseDriverInfo;
    }
    return null;
  }, [order, driverData]);

  // Set customer destination when order data loads
  useEffect(() => {
    if (order?.customer?.location) {
      setDestination(order.customer.location);
    } else if (order) {
      // Fallback to mock location if real location isn't available
      setDestination({ lat: 40.73061, lng: -73.935242 });
    }
  }, [order]);

  // Create status updates based on order data
  useEffect(() => {
    if (order) {
      const updates = [];

      if (order.status === "preparing" || ["out_for_delivery", "delivered"].includes(order.status)) {
        updates.push({
          status: "preparing",
          message: "Restaurant is preparing your order",
          time: order.createdAt || new Date(Date.now() - 15 * 60000).toISOString(),
        });
      }

      if (["out_for_delivery", "delivered"].includes(order.status)) {
        updates.push({
          status: "on_the_way",
          message: "Driver has picked up your order and is on the way",
          time: order.driverAssignedAt || new Date(Date.now() - 10 * 60000).toISOString(),
        });
      }

      if (order.status === "delivered") {
        updates.push({
          status: "arrived",
          message: "Driver has delivered your order",
          time: order.updatedAt || new Date().toISOString(),
        });
      }

      setStatusUpdates(updates);
    }
  }, [order]);

  // Simulate driver movement - in a real app, this would be websocket/polling for driver location
  useEffect(() => {
    if (!order || order.status !== "out_for_delivery") return;

    // Start at a random point in the path for simulation
    let step = 1;
    const interval = setInterval(() => {
      if (step < DRIVER_PATH_SIMULATION.length) {
        const location = DRIVER_PATH_SIMULATION[step];
        const minutesLeft = Math.max(1, 15 - step * 3);
        setDriverLocation(location);
        setEta(minutesLeft);
        step++;
      } else {
        clearInterval(interval);
      }
    }, 5000); // Update every 5 seconds

    // Set initial driver location
    setDriverLocation(DRIVER_PATH_SIMULATION[0]);

    return () => clearInterval(interval);
  }, [order]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    try {
      // In a real implementation, you would use a mutation like:
      // await cancelOrder(order.orderId).unwrap();
      toast.success("Order cancellation functionality will be implemented here");
      setCancelModalOpen(false);
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Cancel order error:", error);
    }
  };

  // Get appropriate icon for driver's vehicle
  const getVehicleIcon = () => {
    if (!driver) return <FaCarSide />;
    switch (driver.vehicle.toLowerCase()) {
      case "car":
        return <FaCarSide className="text-blue-500" />;
      case "motorcycle":
        return <FaMotorcycle className="text-orange-500" />;
      case "bicycle":
        return <FaBicycle className="text-green-500" />;
      default:
        return <FaCarSide className="text-gray-500" />;
    }
  };

  // Format timestamp for display
  const formatTime = (timeString) => {
    try {
      return new Date(timeString).toLocaleTimeString([], { 
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return "Unknown time";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading your order tracking information...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
          <div className="bg-red-50 p-6 rounded-lg max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Order</h2>
            <p className="text-gray-700 mb-6">{error.data?.message || "Could not load tracking information. Please try again later."}</p>
            <Link to="/orders" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors">
              Back to Orders
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If order not found - improve this check
  if (!isLoading && !error && (!orderData)) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
          <div className="bg-yellow-50 p-6 rounded-lg max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-yellow-600 mb-4">Order Not Found</h2>
            <p className="text-gray-700 mb-6">The order you're looking for (ID: {id}) could not be found.</p>
            <Link to="/orders" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors">
              Back to Orders
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Calculate restaurant location - use real data if available, otherwise mock
  const restaurantLocation = order.restaurant?.location || { lat: 40.712776, lng: -74.005974 };

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-orange-100 to-yellow-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Link to="/orders" className="inline-flex items-center text-gray-600 hover:text-orange-500 mb-6">
            <FaArrowLeft className="mr-2" /> Back to orders
          </Link>
        
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column: Map */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Map header */}
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Tracking Order #{order.orderId}
                  </h1>
                  <p className="text-sm text-gray-500 mt-2">
                    {order.restaurant?.name || "Restaurant"} • {formatTime(order.createdAt)}
                  </p>
                </div>
                
                {/* Map container */}
                <div className="h-[70vh] relative">
                  {(driverLocation || destination) && (
                    <MapComponent
                      driverLocation={driverLocation}
                      destination={destination}
                      restaurantLocation={restaurantLocation}
                    />
                  )}
                </div>
                
                {/* Status bar */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 flex flex-wrap items-center justify-between">
                  {orderStatus === "out_for_delivery" && (
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      <span>Estimated arrival in {eta} minutes</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FaRoute className="mr-2" />
                    <span>
                      Status: {" "}
                      <span className="font-medium capitalize">
                        {orderStatus.replace(/_/g, ' ')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Order status timeline */}
              <div className="mt-6 bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    Order Status Updates
                  </h2>
                </div>
                <div className="p-6">
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {/* Status items */}
                    {statusUpdates.map((update, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex mb-6 last:mb-0 relative"
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center z-10 mr-4 ${
                            update.status === "preparing"
                              ? "bg-yellow-100 text-yellow-600"
                              : update.status === "on_the_way"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {update.status === "preparing" ? (
                            <FaUtensils />
                          ) : update.status === "on_the_way" ? (
                            <MdDeliveryDining />
                          ) : (
                            <FaHome />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {update.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(update.time)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Next expected status if not delivered */}
                    {orderStatus !== "delivered" && (
                      <div className="flex mb-6 last:mb-0 relative opacity-50">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center z-10 mr-4 bg-gray-100 text-gray-400">
                          <FaHome />
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">
                            Order will be delivered
                          </p>
                          <p className="text-xs text-gray-500">
                            Estimated
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column: Driver info and order details */}
            <div className="md:w-1/3">
              {/* Driver info card - only show if driver assigned */}
              {driver && orderStatus === "out_for_delivery" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6"
                >
                  <div className="p-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                    <h2 className="text-lg font-bold">Your Delivery Driver</h2>
                    {isLoadingDriver && (
                      <span className="inline-block ml-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center">
                      <img
                        src={driver.photo}
                        alt={driver.name}
                        className="h-20 w-20 rounded-full object-cover mr-4 border-4 border-orange-500"
                        onError={(e) => { e.target.src = "/hero1.png" }}
                      />
                      <div>
                        <h3 className="font-bold text-gray-800 text-xl">
                          {driver.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          {getVehicleIcon()}
                          <span className="ml-1">{driver.vehicle}</span>
                          {driver.licensePlate !== "N/A" && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{driver.licensePlate}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center mt-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(driver.rating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-600">
                            {driver.rating}
                          </span>
                        </div>
                        
                        {/* Show driver's service areas if available */}
                        {driver.deliveryCities && driver.deliveryCities.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Service areas: {driver.deliveryCities.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Add experience information if available */}
                    {driver.completedOrders > 0 && (
                      <div className="mt-4 bg-gray-50 p-2 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{driver.completedOrders} orders delivered</span>
                        </div>
                      </div>
                    )}
                    
                    {driver.phone !== "Not available" && (
                      <div className="mt-6">
                        <a
                          href={`tel:${driver.phone}`}
                          className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
                        >
                          <FaPhoneAlt className="mr-2" />
                          Call Driver
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Order details card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 bg-gray-800 text-white">
                  <h2 className="text-lg font-bold">Order Details</h2>
                </div>
                <div className="p-6">
                  {/* Restaurant info */}
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-start">
                      <FaUtensils className="text-gray-500 mt-1 mr-3" />
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {order.restaurant?.name || "Restaurant"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.restaurant?.address || "No address available"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery address */}
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-gray-500 mt-1 mr-3" />
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          Delivery Address
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.customer?.address || "No address available"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order items */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      Your Order
                    </h3>
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between mb-2 text-sm"
                      >
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order total */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-orange-600">
                        ${order.total?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed {formatTime(order.createdAt)}
                    </p>
                  </div>
                  
                  {/* Cancel Order Button - only show for orders that can be cancelled */}
                  {["pending", "confirmed"].includes(orderStatus) && (
                    <div className="mt-6">
                      <button
                        onClick={() => setCancelModalOpen(true)}
                        className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-2xl max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Are you sure you want to cancel this order?
            </h2>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. The restaurant may have already started preparing your food.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}