const Order = require('../models/Order');
const PaymentService = require('../services/paymentService');
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
      status: 'pending'
    };

    console.log('Creating order with data:', JSON.stringify(orderData));
    
    // Create and save the order document
    try {
      const order = new Order(orderData);
      const savedOrder = await order.save();
      
      if (!savedOrder) {
        console.error('Order was not saved properly');
        return res.status(500).json({
          success: false,
          message: 'Failed to save order to database'
        });
      }
      
      console.log('Order created successfully:', savedOrder._id);
      
      // Return success response with saved order
      return res.status(201).json({
        success: true,
        order: savedOrder,
        warnings: paymentResult.message ? [paymentResult.message] : []
      });
    } catch (dbError) {
      console.error('Database error saving order:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error when saving order',
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

    // Security check - only allow user to access their own orders or admin
    if (req.user.role !== 'admin' && order.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      order
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
 * @route GET /api/orders
 * @access Private
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
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
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
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
 * Update order status
 * @route PUT /api/orders/:id/status
 * @access Private (Restaurant Owner/Admin/Delivery)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
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
    order.updatedAt = Date.now();
    
    await order.save();
    
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

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder
};
