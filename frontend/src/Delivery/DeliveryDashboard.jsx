import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeliveries } from "../Redux/slices/deliverySlice";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaCheckCircle, FaMotorcycle } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

export default function DeliveryDashboard() {
    console.log("🔄 DeliveryDashboard - Component rendering");
    const dispatch = useDispatch();
    const { deliveries, loading, error } = useSelector((state) => {
      console.log("🔍 DeliveryDashboard - Redux state:", state.delivery);
      return state.delivery;
    });
    
    const [assigningOrder, setAssigningOrder] = useState(null);

    // Helper function to get auth headers
    const getAuthHeaders = () => {
      const token = localStorage.getItem('token');
      return {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      };
    };

    // Function to accept and assign a driver to an order
    const acceptOrder = async (orderId) => {
      try {
        setAssigningOrder(orderId);
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        
        // Make sure we have the required info
        if (!token || !userInfo.id || !userInfo.name) {
          toast.error("Please login again to accept orders");
          setAssigningOrder(null);
          return;
        }
        
        console.log(`🚚 DeliveryDashboard - Assigning driver to order ${orderId}`);
        
        // Order service endpoint to assign driver
        const API_URL = "http://localhost:5002/api/orders";
        const response = await axios.put(
          `${API_URL}/${orderId}/assign-driver`, 
          {
            driverId: userInfo.id,
            driverName: userInfo.name
          },
          getAuthHeaders()
        );
        
        console.log("✅ DeliveryDashboard - Driver assigned successfully:", response.data);
        
        toast.success("You have been assigned to this delivery!");
        // Refresh the delivery list
        dispatch(fetchDeliveries());
      } catch (error) {
        console.error("❌ DeliveryDashboard - Error assigning driver:", error);
        toast.error(error.response?.data?.message || "Failed to accept order");
      } finally {
        setAssigningOrder(null);
      }
    };

    useEffect(() => {
      console.log("🚀 DeliveryDashboard - Dispatching fetchDeliveries()");
      
      // Get authentication info for debugging
      const token = localStorage.getItem('token');
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      console.log("🔑 DeliveryDashboard - Auth state:", { 
        hasToken: !!token, 
        userRole: userInfo.role,
        userId: userInfo.id 
      });
      
      dispatch(fetchDeliveries())
        .then(response => {
          console.log("✅ DeliveryDashboard - fetchDeliveries response:", response);
        })
        .catch(error => {
          console.error("❌ DeliveryDashboard - fetchDeliveries error:", error);
        });
    }, [dispatch]);

    console.log("📊 DeliveryDashboard - Current state:", { 
      deliveriesCount: deliveries?.length || 0, 
      loading, 
      error 
    });

    if (loading) return <p className="text-center mt-6">Loading deliveries...</p>;
    
    if (error) {
      console.error("❌ DeliveryDashboard - Render error:", error);
      return (
        <div className="min-h-screen bg-yellow-200 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md mt-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-3">Error Loading Deliveries</h2>
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-600 mb-4">Authentication error. Please check that you're logged in as a driver.</p>
            <button 
              onClick={() => dispatch(fetchDeliveries())}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!deliveries || deliveries.length === 0) {
      console.log("⚠️ DeliveryDashboard - No deliveries to display");
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

          {/* No orders message */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6 text-center">
            <h2 className="text-xl font-bold mb-3">No Available Deliveries</h2>
            <p className="text-gray-600 mb-4">There are currently no deliveries assigned or available.</p>
          </div>
        </div>
      );
    }

    console.log("🔄 DeliveryDashboard - Rendering deliveries:", deliveries);

    // Filter to show only available orders (status "out_for_delivery" with no driver assigned)
    const availableOrders = deliveries.filter(order => 
      order.status === "out_for_delivery" && !order.driverId
    );

    // Filter to show orders already assigned to the current driver
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const myOrders = deliveries.filter(order => 
      order.driverId === userInfo.id
    );

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

        {/* Available Orders Section */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center">
            <FaMotorcycle className="mr-2 text-orange-600" />
            Available Orders
          </h2>
          
          {availableOrders.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">No available orders at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableOrders.map((order) => (
                <div
                  key={order.id || order.orderId}
                  className="bg-white p-4 rounded-lg shadow-md transition transform hover:shadow-lg border-l-4 border-orange-500"
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-orange-600">Order #{order.id || order.orderId}</h2>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                      Available
                    </span>
                  </div>
                  
                  <p className="text-gray-700 flex items-center mt-2">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {order.address || order.customer?.address}
                  </p>
                  
                  <p className="text-gray-700 flex items-center mt-1">
                    <MdPayment className="text-blue-500 mr-2" />
                    Payment: {order.paymentMethod || order.payment?.method || "N/A"}
                  </p>
                  
                  <div className="mt-3 max-h-28 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-1">Order Items:</p>
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-gray-800 text-sm">
                          {item.quantity || 1}× {item.name} - ${item.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <span className="font-bold text-gray-800">Total: ${order.total.toFixed(2)}</span>
                    <button
                      onClick={() => acceptOrder(order.id || order.orderId)}
                      disabled={assigningOrder === (order.id || order.orderId)}
                      className={`px-4 py-2 rounded font-medium ${
                        assigningOrder === (order.id || order.orderId) 
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      } transition flex items-center`}
                    >
                      {assigningOrder === (order.id || order.orderId) ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Accepting...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="mr-2" />
                          Accept Delivery
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* My Assigned Orders Section */}
        {myOrders.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <FaCheckCircle className="mr-2 text-green-600" />
              My Assigned Orders
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myOrders.map((order) => (
                <div
                  key={order.id || order.orderId}
                  className="bg-white p-4 rounded-lg shadow-md transition transform hover:shadow-lg border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-green-600">Order #{order.id || order.orderId}</h2>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      Assigned to You
                    </span>
                  </div>
                  
                  <p className="text-gray-700 flex items-center mt-2">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {order.address || order.customer?.address}
                  </p>
                  
                  <div className="mt-3 max-h-28 overflow-y-auto">
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-gray-800 text-sm">
                          {item.quantity || 1}× {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <span className="font-bold text-gray-800">Total: ${order.total.toFixed(2)}</span>
                    <Link
                      to={`/delivery/order/${order.id || order.orderId}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
}