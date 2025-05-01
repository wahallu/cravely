import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaUtensils, FaMotorcycle, FaCheckCircle, FaLocationArrow } from "react-icons/fa";
import { MdPayment, MdRestaurant, MdLocationCity } from "react-icons/md";
import { useGetAvailableOrdersForDeliveryQuery, useUpdateOrderStatusMutation, useGetDriverOrdersQuery } from "../Redux/slices/orderSlice";
import { useGetDriverByIdQuery } from "../Redux/slices/driverSlice";
import { getToken } from "../utils/auth";
import toast from "react-hot-toast";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [isAssigning, setIsAssigning] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [driverCities, setDriverCities] = useState([]);

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

  // Get driver profile to get their deliveryCities
  const {
    data: driverData,
    isLoading: isLoadingDriver,
  } = useGetDriverByIdQuery(userInfo?.id, {
    skip: !userInfo?.id,
  });

  // Mutation to update order status
  const [updateOrderStatus, { isLoading: isUpdatingOrder }] = useUpdateOrderStatusMutation();

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

  // Store driver cities in state when profile loads
  useEffect(() => {
    if (driverData && driverData.deliveryCities) {
      // Convert all cities to lowercase for case-insensitive comparison
      const normalizedCities = driverData.deliveryCities.map(city => city.toLowerCase());
      setDriverCities(normalizedCities);
    }
  }, [driverData]);

  // Filter available orders based on driver's delivery cities
  useEffect(() => {
    if (driverCities.length > 0 && availableOrders.length > 0) {
      // Filter orders where customer city is in driver's deliveryCities
      const ordersInDeliveryZone = availableOrders.filter(order => {
        const customerCity = extractCityFromAddress(order.customer);
        // Use normalized (lowercase) comparison
        return customerCity && driverCities.includes(customerCity.toLowerCase());
      });
      
      setFilteredOrders(ordersInDeliveryZone);
    } else {
      setFilteredOrders([]);
    }
  }, [driverCities, availableOrders]);

  // Helper function to extract city from address
  const extractCityFromAddress = (customer) => {
    if (!customer) return null;
    
    // If there's an explicit city field, use it
    if (customer.city) return customer.city.trim();
    
    // Otherwise try to extract city from the address string
    if (customer.address) {
      // Split address by commas and try to find the city part
      const addressParts = customer.address.split(',');
      
      if (addressParts.length >= 2) {
        // The city is likely the second part in "street, city, state zip" format
        return addressParts[1].trim();
      }
    }
    
    return null;
  };

  // Function to check if a customer's address is in driver's delivery cities
  const isInDeliveryCities = (customer) => {
    const customerCity = extractCityFromAddress(customer);
    if (!customerCity || driverCities.length === 0) return false;
    return driverCities.includes(customerCity.toLowerCase());
  };

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
  if (isLoadingOrders || isLoadingMyDeliveries || isLoadingDriver) {
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

  // Filter active deliveries that I'm currently delivering (out_for_delivery status)
  const myActiveDeliveries = myDeliveries.filter(delivery => 
    delivery.status === 'out_for_delivery' && 
    delivery.driverId === userInfo.id
  );

  // Get auto-assigned orders (orders with status "confirmed" that are already assigned to this driver)
  const autoAssignedOrders = myDeliveries.filter(delivery => 
    delivery.status === 'confirmed' && 
    delivery.driverId === userInfo.id
  );

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      {/* Driver's delivery cities */}
      {driverData?.deliveryCities && driverData.deliveryCities.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
            <MdLocationCity className="text-orange-500 mr-2" />
            Your Delivery Cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {driverData.deliveryCities.map(city => (
              <span 
                key={city}
                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center"
              >
                <FaLocationArrow className="mr-1" />
                {city}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* My Active Deliveries (out_for_delivery) - Most important section, so moved to the top */}
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
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      🛍️ Delivery #{delivery.deliveryId || delivery.orderId}
                    </h2>
                    <p className="text-orange-500 font-medium flex items-center mt-1">
                      <MdRestaurant className="mr-1" />
                      {delivery.restaurant?.name || 'Restaurant'}
                    </p>
                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Out For Delivery
                    </div>
                  </div>
                  
                  {isInDeliveryCities(delivery.customer) && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                      <MdLocationCity className="mr-1" />
                      In Your Delivery Zone
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-gray-700 flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {delivery.customer?.address || 'Address not available'}
                  </p>
                  <p className="text-gray-700 flex items-center mt-1 text-sm">
                    <MdLocationCity className="text-orange-500 mr-2" />
                    City: {extractCityFromAddress(delivery.customer) || 'Unknown'}
                  </p>
                  <p className="text-gray-700 flex items-center mt-2">
                    <MdPayment className="text-blue-500 mr-2" />
                    Payment: {delivery.payment?.method || 'Not specified'}
                  </p>
                </div>

                {delivery.items && delivery.items.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 font-medium">Items:</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {delivery.items.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="text-gray-800 flex items-center">
                          <span className="w-5 inline-block">×{item.quantity}</span>
                          <span>{item.name}</span>
                        </li>
                      ))}
                      {delivery.items.length > 3 && (
                        <li className="text-gray-500 text-sm">
                          + {delivery.items.length - 3} more items
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    to={`/orders/${delivery.orderId}`}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View Order Details
                  </Link>
                  
                  <div className="flex items-center">
                    <span className="font-bold text-gray-800 mr-4">
                      Total: ${delivery.total?.toFixed(2) || '0.00'}
                    </span>
                    
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Auto-assigned Orders Section */}
      {autoAssignedOrders.length > 0 && (
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <MdRestaurant className="text-blue-600 mr-2" /> 
            Auto-Assigned Orders ({autoAssignedOrders.length})
          </h1>

          <div className="grid gap-6">
            {autoAssignedOrders.map((order) => (
              <div
                key={order.orderId || order._id}
                className="bg-white p-5 rounded-lg shadow-md transition hover:shadow-lg border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Order #{order.orderId}
                    </h2>
                    <p className="text-blue-600 font-medium flex items-center mt-1">
                      <MdRestaurant className="mr-1" />
                      {order.restaurant?.name || 'Restaurant'}
                    </p>
                    <div className="mt-1 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded inline-flex items-center">
                      <span>Auto-assigned to you</span>
                    </div>
                  </div>
                  
                  {isInDeliveryCities(order.customer) && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                      <MdLocationCity className="mr-1" />
                      In Your Delivery Zone
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-gray-700 flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {order.customer?.address || 'Address not available'}
                  </p>
                  <p className="text-gray-700 flex items-center mt-1 text-sm">
                    <MdLocationCity className="text-orange-500 mr-2" />
                    City: {extractCityFromAddress(order.customer) || 'Unknown'}
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
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center"
                  >
                    {isAssigning ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                        Processing...
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
            ))}
          </div>
        </div>
      )}

      {/* Available Orders for Pickup - Filtered by Driver's Delivery Cities */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaUtensils className="text-orange-500 mr-2" /> 
          Orders Ready for Pickup in Your Cities ({filteredOrders.length})
        </h1>

        <div className="grid gap-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">No orders available in your delivery cities at the moment</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
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
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      Ready for Pickup
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                      <MdLocationCity className="mr-1" />
                      In Your Delivery Zone
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700 flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {order.customer?.address || 'Address not available'}
                  </p>
                  {/* Show the extracted city */}
                  <p className="text-gray-700 flex items-center mt-1 text-sm">
                    <MdLocationCity className="text-orange-500 mr-2" />
                    <strong>City: {extractCityFromAddress(order.customer) || 'Unknown'}</strong>
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