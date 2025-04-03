import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import Header from "../Home/components/header";
import Footer from "../Home/components/footer";
import MapComponent from "./MapComponent";

// Mock data
const MOCK_ORDER = {
  id: "12345",
  items: [
    { name: "Margherita Pizza", quantity: 1, price: 12.99 },
    { name: "Garlic Bread", quantity: 2, price: 4.99 },
  ],
  restaurant: {
    name: "Pizza Palace",
    address: "456 Oak St, Midtown",
    location: { lat: 40.712776, lng: -74.005974 }, // New York coordinates
  },
  customer: {
    name: "Emma Johnson",
    address: "789 Maple Ave, Uptown",
    location: { lat: 40.73061, lng: -73.935242 }, // Nearby location
  },
  total: 22.97,
  placedAt: new Date(Date.now() - 20 * 60000).toISOString(), // 20 mins ago
};
const MOCK_DRIVER = {
  name: "John Smith",
  photo: "/hero1.png",
  phone: "+1 (555) 123-4567",
  vehicle: "Motorcycle",
  licensePlate: "MTC-123",
  rating: 4.8,
};
const MOCK_DRIVER_PATH = [
  { lat: 40.712776, lng: -74.005974 }, // Start at restaurant
  { lat: 40.714776, lng: -74.003974 },
  { lat: 40.718776, lng: -74.000974 },
  { lat: 40.722776, lng: -73.996974 },
  { lat: 40.726776, lng: -73.990974 },
  { lat: 40.73061, lng: -73.985242 },
  { lat: 40.73061, lng: -73.935242 }, // End at customer
];
const MOCK_STATUS_UPDATES = [
  {
    status: "preparing",
    message: "Restaurant is preparing your order",
    time: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
  },
  {
    status: "on_the_way",
    message: "Driver has picked up your order and is on the way",
    time: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
  },
];

export default function LiveTracking() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [driver, setDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [eta, setEta] = useState(15); // Default 15 minutes
  const [orderStatus, setOrderStatus] = useState("on_the_way"); // preparing, on_the_way, arrived
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    // Simulate loading with dummy data
    const loadDummyData = () => {
      setTimeout(() => {
        // Load mock data
        setOrder(MOCK_ORDER);
        setDriver(MOCK_DRIVER);
        setDestination(MOCK_ORDER.customer.location);
        setDriverLocation(MOCK_DRIVER_PATH[1]); // Start at second point in the path
        setStatusUpdates(MOCK_STATUS_UPDATES);
        setLoading(false);
      }, 1500); // Simulate 1.5s loading
    };
    loadDummyData();

    // Simulate driver location updates
    let step = 1; // Start at second point in the path
    const interval = setInterval(() => {
      if (step < MOCK_DRIVER_PATH.length) {
        const location = MOCK_DRIVER_PATH[step];
        const minutesLeft = Math.max(1, 15 - step * 3); // ETA decreases as driver moves
        setDriverLocation(location);
        setEta(minutesLeft);
        // Update order status at specific points
        if (step === MOCK_DRIVER_PATH.length - 1) {
          setOrderStatus("arrived");
          setStatusUpdates((prev) => [
            {
              status: "arrived",
              message: "Driver has arrived at your location",
              time: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
        step++;
      } else {
        clearInterval(interval);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  const getVehicleIcon = () => {
    if (!driver) return <FaCarSide />;
    switch (driver.vehicle) {
      case "Car":
        return <FaCarSide className="text-blue-500" />;
      case "Motorcycle":
        return <FaMotorcycle className="text-orange-500" />;
      case "Bicycle":
        return <FaBicycle className="text-green-500" />;
      default:
        return <FaCarSide className="text-gray-500" />;
    }
  };

  if (loading) {
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

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-orange-100 to-yellow-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column: Map */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Map header */}
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Tracking Order #{orderId}
                  </h1>
                  <p className="text-sm text-gray-500 mt-2">
                    Real-time location of your delivery
                  </p>
                </div>
                {/* Map container */}
                <div className="h-[70vh] relative">
                  {driverLocation && destination && (
                    <MapComponent
                      driverLocation={driverLocation}
                      destination={destination}
                      restaurantLocation={order.restaurant.location}
                    />
                  )}
                  {/* Zoom controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                    <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* ETA bar */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>Estimated arrival in {eta} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <FaRoute className="mr-2" />
                    <span>
                      Driver is{" "}
                      {orderStatus === "preparing"
                        ? "at restaurant"
                        : "on the way"}
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
                            {new Date(update.time).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Right column: Driver info and order details */}
            <div className="md:w-1/3">
              {/* Driver info card */}
              {driver && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6"
                >
                  <div className="p-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                    <h2 className="text-lg font-bold">Your Delivery Driver</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center">
                      <img
                        src={driver.photo}
                        alt={driver.name}
                        className="h-20 w-20 rounded-full object-cover mr-4 border-4 border-orange-500"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800 text-xl">
                          {driver.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          {getVehicleIcon()}
                          <span className="ml-1">{driver.vehicle}</span>
                          <span className="mx-1">•</span>
                          <span>{driver.licensePlate}</span>
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
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <a
                        href={`tel:${driver.phone}`}
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
                      >
                        <FaPhoneAlt className="mr-2" />
                        Call Driver
                      </a>
                      <a
                        href={`tel:${MOCK_ORDER.restaurant.phone}`}
                        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <FaPhoneAlt className="mr-2" />
                        Contact Restaurant
                      </a>
                    </div>
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
                          {order.restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.restaurant.address}
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
                          {order.customer.address}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Order items */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      Your Order
                    </h3>
                    {order.items.map((item, index) => (
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
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed {new Date(order.placedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {/* Cancel Order Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Are you sure you want to cancel this order?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                No, Keep Order
              </button>
              <button
                onClick={() => {
                  alert("Order Cancelled!");
                  setCancelModalOpen(false);
                }}
                className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
