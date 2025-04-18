import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import StatusNotification from './OrderNotify';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [lastStatusMap, setLastStatusMap] = useState({});
  
  // Get all orders from redux state
  const { data: orders = [] } = useSelector((state) => state.orders?.entities?.orders || {});

  // Listen for order status changes
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    orders.forEach(order => {
      const orderId = order.orderId;
      const currentStatus = order.status;
      
      // If we have a previous status and it's different, show notification
      if (lastStatusMap[orderId] && lastStatusMap[orderId] !== currentStatus) {
        setNotification({
          orderId,
          status: currentStatus,
          restaurant: order.restaurant?.name,
          estimatedTime: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
        });
      }
      
      // Update the last status map
      setLastStatusMap(prev => ({
        ...prev,
        [orderId]: currentStatus
      }));
    });
  }, [orders]);

  // Auto-hide notification after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const closeNotification = () => {
    setNotification(null);
  };

  // Method to manually trigger a notification
  const showNotification = (data) => {
    setNotification(data);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <AnimatePresence>
        {notification && (
          <StatusNotification notification={notification} onClose={closeNotification} />
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};