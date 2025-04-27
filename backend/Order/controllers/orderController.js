const Order = require('../models/Order');
const PaymentService = require('../services/paymentService');
const RestaurantService = require('../services/restaurantService');
const NotificationService = require('../services/notificationService');
const DeliveryService = require('../services/deliveryService');
const mongoose = require('mongoose');

/**
 * Create a new order
 * @route POST /api/orders
 * @access Private
 */
const createOrder = async (req, res) => {
  try {
    // Log incoming data for debugging
    console.log('Creating order with request body:', JSON.stringify(req.body, null, 2));
    console.log('Order creation started with payload:', JSON.stringify(req.body));
    const { items, customer, payment = {}, restaurantId, subtotal, tax, deliveryFee, total } = req.body;
    
    if (!items || items.length === 0) {
      console.error('No items provided in order creation');
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate required fields
    if (!customer || !customer.fullName) {
      console.error('Missing customer information');
      return res.status(400).json({
        success: false,
        message: 'Customer information is required'
      });
    }

    if (!payment || !payment.method) {
      console.error('Missing payment method');
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }
    
    // Process payment if needed
    let paymentResult = {
      paymentIntentId: payment.paymentIntentId || null,
      status: payment.status || 'pending',
      amount: payment.amount || total
    };
    if (payment.method === 'creditCard') {
      try {
        // Add more detailed logging
        console.log('Processing card payment:', {
          amount: total,
          paymentMethodId: payment.paymentMethodId
        });
        
        paymentResult = await PaymentService.processCardPayment({
          amount: total,
          paymentMethodId: payment.paymentMethodId,
          description: `Order for ${customer.fullName}`,
          metadata: {
            customer_name: customer.fullName,
            customer_email: customer.email
          }
        });
        
        console.log('Payment result:', paymentResult);
        
        // Only update success status based on actual result
        if (!paymentResult.success) {
          return res.status(400).json({
            success: false,
            message: 'Payment failed',
            error: paymentResult.error
          });
        }
      } catch (paymentError) {
        console.error('Payment service detailed error:', paymentError);
        console.error('Error stack:', paymentError.stack);
        paymentResult.status = 'failed';
        paymentResult.error = paymentError.message;
        
        return res.status(500).json({
          success: false,
          message: 'Payment processing error',
          error: paymentError.message
        });
      }
    } else if (payment.method === 'cash') {
      paymentResult.status = 'pending';
      paymentResult.success = true;
    }

    // Generate a unique order ID
    const orderId = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    
    // Format order items properly
    const formattedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price || 0),
      quantity: parseInt(item.quantity || 1)
    }));

    // Calculate server-side totals for verification
    const calculatedSubtotal = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedTax = parseFloat((calculatedSubtotal * 0.1).toFixed(2)); // 10% tax
    const calculatedDeliveryFee = parseFloat(deliveryFee || 1.99);
    const calculatedTotal = parseFloat((calculatedSubtotal + calculatedTax + calculatedDeliveryFee).toFixed(2));

    // Check for significant discrepancies in calculations
    if (Math.abs(calculatedTotal - parseFloat(total || 0)) > 1) {
      console.error('Total price calculation mismatch', {
        provided: { subtotal, tax, deliveryFee, total },
        calculated: { calculatedSubtotal, calculatedTax, calculatedDeliveryFee, calculatedTotal }
      });
      // We'll continue but log the discrepancy
    }

    // Build order data
    const orderData = {
      orderId,
      userId: req.user ? req.user._id.toString() : 'guest',
      restaurantId,
      items: formattedItems,
      customer,
      payment: {
        method: payment.method,
        cardId: payment.method === 'creditCard' ? payment.cardId : null,
        paymentIntentId: paymentResult.paymentIntentId,
        status: paymentResult.status === 'succeeded' ? 'completed' : paymentResult.status,
        amount: calculatedTotal // Use calculated total for consistency
      },
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      deliveryFee: calculatedDeliveryFee,
      total: calculatedTotal,
      status: 'pending' // Always start with pending status
    };

    console.log('Creating order with data:', JSON.stringify(orderData));
    
    // Create and save the order document
    try {
      const order = new Order(orderData);
      const savedOrder = await order.save();
      
      if (!savedOrder) {
        console.error('Failed to save order to database');
        return res.status(500).json({
          success: false,
          message: 'Error creating order in database'
        });
      }
      
      console.log('Order created successfully:', savedOrder._id);

      // Send WhatsApp notification for payment completion
      await NotificationService.sendPaymentNotification({
        customer: orderData.customer,
        orderId: savedOrder.orderId,
        payment: orderData.payment
      });

      // Return response with order details
      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: savedOrder
      });
    } catch (dbError) {
      console.error('Database error creating order:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Error creating order in database',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

/**
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Fetch restaurant details from Restaurant service
    const restaurant = await RestaurantService.getRestaurantById(order.restaurantId);
    
    // Transform the response to include restaurant details
    const transformedOrder = {
      ...order._doc,
      restaurant // Add restaurant field with data from Restaurant service
    };
    
    res.status(200).json({
      success: true,
      order: transformedOrder
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all orders for a user
 * @route GET /api/orders/user/me
 * @access Private
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get orders without trying to populate restaurant
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    // For each order, fetch restaurant details from Restaurant service
    const ordersWithRestaurants = await Promise.all(orders.map(async (order) => {
      const restaurant = await RestaurantService.getRestaurantById(order.restaurantId);
      
      return {
        ...order._doc,
        restaurant // Add restaurant field with data from Restaurant service
      };
    }));
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: ordersWithRestaurants
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all orders for a restaurant
 * @route GET /api/orders/restaurant/:id
 * @access Private (Restaurant Owner/Admin)
 */
const getRestaurantOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    // Basic filter
    const filter = { restaurantId: id };
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    
    // Get restaurant details once for all orders
    const restaurant = await RestaurantService.getRestaurantById(id);
    
    // Add restaurant info to each order
    const transformedOrders = orders.map(order => ({
      ...order._doc,
      restaurant
    }));
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: transformedOrders
    });
  } catch (error) {
    console.error('Get restaurant orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all orders available for delivery
 * @route GET /api/orders/available-for-delivery
 * @access Private (Drivers only)
 */
const getAvailableOrders = async (req, res) => {
  try {
    // Find orders with status "preparing" that are ready for pickup
    const orders = await Order.find({ 
      status: 'preparing',
      driverId: null
    }).sort({ createdAt: -1 });
    
    // Add restaurant info to each order
    const ordersWithRestaurants = await Promise.all(orders.map(async (order) => {
      const restaurant = await RestaurantService.getRestaurantById(order.restaurantId);
      
      return {
        ...order._doc,
        restaurant
      };
    }));
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: ordersWithRestaurants
    });
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Assign driver to an order
 * @route PUT /api/orders/:id/assign-driver
 * @access Private (Drivers only)
 */
const assignDriver = async (req, res) => {
  try {
    const { driverId, driverName } = req.body;
    
    if (!driverId || !driverName) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID and name are required'
      });
    }
    
    // Find the order by orderId parameter
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order status is valid for assignment
    if (order.status !== 'out_for_delivery') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be assigned because it is ${order.status}`
      });
    }
    
    // Check if order is already assigned to a driver
    if (order.driverId) {
      return res.status(400).json({
        success: false,
        message: 'Order is already assigned to a driver'
      });
    }
    
    // Assign driver to order in Order service
    order.driverId = driverId;
    order.driverName = driverName;
    order.driverAssignedAt = Date.now();
    
    await order.save();
    
    // Update driver status in Delivery service
    try {
      await DeliveryService.updateDriverStatus(driverId, 'On Delivery');
      console.log(`Driver ${driverId} status updated to On Delivery`);
    } catch (driverError) {
      // Log error but don't fail the assignment if driver status update fails
      console.error('Error updating driver status in Delivery service:', driverError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Driver assigned to order successfully',
      order
    });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all orders assigned to a driver
 * @route GET /api/orders/driver/:driverId
 * @access Private (Drivers only)
 */
const getDriverOrders = async (req, res) => {
  try {
    // If it's coming from /driver/my-orders route, use the authenticated user's ID
    const driverId = req.params.driverId || req.user._id.toString();
    
    console.log('Getting orders for driver:', driverId);
    
    // Find orders for this driver
    const orders = await Order.find({ driverId }).sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for driver ${driverId}`);
    
    // Add restaurant info to each order
    const ordersWithRestaurants = await Promise.all(orders.map(async (order) => {
      try {
        const restaurant = await RestaurantService.getRestaurantById(order.restaurantId);
        return {
          ...order._doc,
          restaurant
        };
      } catch (err) {
        console.error('Error getting restaurant info:', err);
        return order._doc;
      }
    }));
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: ordersWithRestaurants
    });
  } catch (error) {
    console.error('Error fetching driver orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update order status
 * @route PUT /api/orders/:id/status
 * @access Private (Restaurant Owner/Admin/Delivery)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, estimatedDelivery } = req.body;
    
    // Find the order
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update the status
    order.status = status;
    
    // When restaurant changes status to out_for_delivery, automatically assign a driver
    if (status === 'out_for_delivery' && !order.driverId) {
      console.log(`Auto-assigning driver for order ${order.orderId} with status ${status}`);
      
      try {
        const assignedDriver = await findBestDriverForOrder(order);
        
        if (assignedDriver) {
          // Update order with assigned driver info
          order.driverId = assignedDriver._id;
          order.driverName = assignedDriver.name;
          order.driverAssignedAt = Date.now();
          
          console.log(`Driver ${assignedDriver.name} auto-assigned to order ${order.orderId}`);
          
          // Update driver status
          await DeliveryService.updateDriverStatus(assignedDriver._id, 'On Delivery');
          
          // Send notification to driver about assignment
          const restaurant = await RestaurantService.getRestaurantById(order.restaurantId);
          
          // Notify the driver about the new assignment
          await NotificationService.sendDriverAssignmentNotification({
            driver: assignedDriver,
            orderId: order.orderId,
            restaurant,
            customer: order.customer
          });
        } else {
          console.log(`No suitable driver found for order ${order.orderId}`);
        }
      } catch (assignError) {
        console.error('Error auto-assigning driver:', assignError);
        // Don't fail the status update if driver assignment fails
      }
    }
    
    // Update other fields
    if (estimatedDelivery) {
      order.estimatedDeliveryTime = estimatedDelivery;
    }
    
    order.updatedAt = Date.now();
    await order.save();
    
    // Get restaurant details for notifications
    const restaurant = await RestaurantService.getRestaurantById(order.restaurantId);
    
    // Send WhatsApp notifications based on the new status
    if (status === 'confirmed') {
      await NotificationService.sendOrderConfirmedNotification({
        customer: order.customer,
        orderId: order.orderId,
        restaurant,
        estimatedDelivery: order.estimatedDeliveryTime
      });
    } else if (status === 'delivered') {
      await NotificationService.sendOrderDeliveredNotification({
        customer: order.customer,
        orderId: order.orderId,
        restaurant
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Cancel an order
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
const cancelOrder = async (req, res) => {
  try {
    // Find the order
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order can be canceled
    if (['delivered', 'canceled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be canceled because it is already ${order.status}`
      });
    }
    
    // If payment was processed with card, issue refund
    if (order.payment.method === 'creditCard' && order.payment.paymentIntentId) {
      // Implement refund logic here with Stripe
      // This is a placeholder for where you would call your payment service
    }
    
    // Update order status
    order.status = 'canceled';
    order.updatedAt = Date.now();
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order has been canceled',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Mark order as delivered by driver
 * @route PUT /api/orders/:id/delivered
 * @access Private (Drivers only)
 */
const completeDelivery = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Ensure only the assigned driver can mark it as delivered
    if (order.driverId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned driver can mark an order as delivered'
      });
    }
    
    // Update order status
    order.status = 'delivered';
    order.updatedAt = Date.now();
    
    await order.save();
    
    // Update driver status back to Available in Delivery service
    try {
      await DeliveryService.updateDriverStatus(order.driverId, 'Available');
      
      // Update driver earnings through the dedicated method
      if (order.total) {
        const deliveryEarnings = calculateDeliveryEarnings(order.total);
        await DeliveryService.updateDriverStats(order.driverId, deliveryEarnings);
      }
    } catch (driverError) {
      console.error('Error updating driver after delivery:', driverError);
    }
    
    // Send delivery notification
    await NotificationService.sendOrderDeliveredNotification({
      customer: order.customer,
      orderId: order.orderId,
      restaurant: await RestaurantService.getRestaurantById(order.restaurantId)
    });
    
    res.status(200).json({
      success: true,
      message: 'Order marked as delivered successfully',
      order
    });
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Helper function to calculate driver earnings from order total
 */
const calculateDeliveryEarnings = (orderTotal) => {
  // Example calculation: base fee + percentage of order
  const baseFee = 2.50;
  const percentage = 0.05; // 5%
  return baseFee + (orderTotal * percentage);
};

/**
 * Find the best driver for an order
 * @param {Object} order - The order object
 * @returns {Promise<Object>} - The selected driver
 */
const findBestDriverForOrder = async (order) => {
  try {
    // Extract city from order shipping address
    const customerCity = extractCityFromAddress(order.customer);
    
    if (!customerCity) {
      console.log('Unable to determine city from order address');
      return null;
    }
    
    console.log(`Looking for drivers available in city: ${customerCity}`);
    
    // Get drivers that deliver to this city
    const drivers = await DeliveryService.getDriversForCity(customerCity);
    
    if (!drivers || drivers.length === 0) {
      console.log(`No available drivers for city: ${customerCity}`);
      return null;
    }
    
    console.log(`Found ${drivers.length} potential drivers for ${customerCity}`);
    
    // Advanced driver matching algorithm:
    // 1. Filter only Available drivers
    const availableDrivers = drivers.filter(driver => driver.status === "Available");
    
    if (availableDrivers.length === 0) {
      console.log('No drivers currently available in this city');
      return null;
    }
    
    // 2. Sort by rating first
    const sortedDrivers = availableDrivers.sort((a, b) => {
      // Sort by rating (higher first)
      if (b.rating !== a.rating) return b.rating - a.rating;
      
      // If ratings are equal, prefer drivers with fewer completed orders (spread the work)
      return a.completedOrders - b.completedOrders; 
    });
    
    // Return the best matched driver
    return sortedDrivers[0];
  } catch (error) {
    console.error('Error finding best driver:', error);
    return null;
  }
};

// Helper function to extract city from address
const extractCityFromAddress = (customer) => {
  // If there's an explicit city field, use it
  if (customer.city) return customer.city;
  
  // Otherwise try to extract city from the address string
  if (customer.address) {
    // Split address by commas and try to find the city part
    const addressParts = customer.address.split(',');
    
    if (addressParts.length >= 2) {
      // The city is likely the second part in "street, city, state zip" format
      // Trim whitespace and return it
      return addressParts[1].trim();
    }
  }
  
  return null;
};

module.exports = {
  // Existing exports
  createOrder,
  getOrderById,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder,
  getAvailableOrders,
  assignDriver,
  getDriverOrders,
  // New export
  completeDelivery,
  findBestDriverForOrder
};
