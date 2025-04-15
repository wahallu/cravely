import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRegClock, 
  FaClipboardList, 
  FaUtensils, 
  FaMotorcycle, 
  FaCheckCircle, 
  FaTimesCircle 
} from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

const StatusNotification = ({ notification, onClose }) => {
  if (!notification) return null;

  // Get status icon based on order status
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaRegClock className="text-yellow-500" />;
      case 'confirmed': return <FaClipboardList className="text-blue-500" />;
      case 'preparing': return <FaUtensils className="text-indigo-500" />;
      case 'out_for_delivery': return <FaMotorcycle className="text-purple-500" />;
      case 'delivered': return <FaCheckCircle className="text-green-500" />;
      case 'canceled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaRegClock className="text-gray-500" />;
    }
  };

  // Get color theme based on status
  const getStatusTheme = (status) => {
    switch(status) {
      case 'pending': return 'from-yellow-500 to-orange-500';
      case 'confirmed': return 'from-blue-500 to-indigo-500';
      case 'preparing': return 'from-indigo-500 to-purple-500';
      case 'out_for_delivery': return 'from-purple-500 to-pink-500';
      case 'delivered': return 'from-green-500 to-emerald-500';
      case 'canceled': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Format order status to be more user-friendly
  const formatOrderStatus = (status) => {
    switch(status) {
      case 'pending': return 'Pending Confirmation';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing Your Order';
      case 'out_for_delivery': return 'On the Way!';
      case 'delivered': return 'Order Delivered';
      case 'canceled': return 'Order Canceled';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
  };

  return (
    <motion.div 
      className="fixed top-24 right-4 z-50 max-w-sm w-full"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Status bar */}
        <div className={`h-2 bg-gradient-to-r ${getStatusTheme(notification.status)}`}></div>
        
        <div className="p-4">
          {/* Header with close button */}
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-800">
              Order Status Update
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MdClose />
            </button>
          </div>
          
          {/* Order info */}
          <div className="mt-3 flex items-center">
            <div className={`p-3 rounded-full bg-gradient-to-r ${getStatusTheme(notification.status)} mr-3`}>
              {getStatusIcon(notification.status)}
            </div>
            <div>
              <div className="font-medium text-gray-800">
                {formatOrderStatus(notification.status)}
              </div>
              <div className="text-sm text-gray-500">
                Order #{notification.orderId}
              </div>
            </div>
          </div>
          
          {/* Restaurant info */}
          {notification.restaurant && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
              {notification.restaurant}
            </div>
          )}

          {/* Time info */}
          <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
            <span>Just now</span>
            {notification.estimatedTime && (
              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                Est. delivery: {notification.estimatedTime}
              </span>
            )}
          </div>
        </div>
        
        {/* Action button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              window.location.href = `/orders/${notification.orderId}`;
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-medium transition-colors hover:from-orange-600 hover:to-orange-700"
          >
            View Order Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusNotification;