const Order = require('../models/Order');
const PaymentService = require('../services/paymentService');

/**
 * Create a new order
 * @route POST /api/orders
 * @access Private
 */
const createOrder = async (req, res) => {
  try {
    const { items, customer, payment, restaurantId, subtotal, tax, deliveryFee, total } = req.body;
    
    // Process payment based on method
    let paymentResult;
    if (payment.method === 'creditCard') {
      try {
        paymentResult = await PaymentService.processCardPayment({
          amount: total,
          paymentMethodId: payment.paymentMethodId,
          description: `Order for ${customer.fullName}`,
          metadata: {
            customer_name: customer.fullName,
            customer_email: customer.email
          }
        });

        // Save card if requested
        if (payment.saveCard && paymentResult.success) {
          try {
            await PaymentService.saveCardDetails({
              customerId: req.user?.stripeCustomerId,
              paymentMethodId: payment.paymentMethodId,
              email: customer.email,
              name: customer.fullName
            });
          } catch (cardSaveError) {
            console.error('Error saving card (non-fatal):', cardSaveError);
            // Continue with order process even if card saving fails
          }
        }
        
        if (!paymentResult.success) {
          return res.status(400).json({
            success: false,
            message: 'Payment failed',
            error: paymentResult.error
          });
        }
      } catch (paymentError) {
        console.error('Payment service error:', paymentError);
        
        // Check if this is a connection error to the payment service
        if (paymentError.code === 'ECONNREFUSED') {
          // Set payment to pending and notify admin for manual processing
          paymentResult = {
            success: true,
            status: 'pending-verification',
            paymentIntentId: `manual-${Date.now()}`,
            message: 'Payment will be verified manually due to service unavailability'
          };
          
          // TODO: Send notification to admin about manual verification needed
          console.log('Payment requires manual verification - Payment service unavailable');
        } else {
          // For other payment errors, return error to client
          return res.status(500).json({
            success: false,
            message: 'Payment processing error',
            error: paymentError.message || 'Unknown payment error'
          });
        }
      }
    } else if (payment.method === 'cash') {
      // For cash payments, we just mark it as pending
      paymentResult = PaymentService.processCashPayment();
    }

    // Create the order
    const order = await Order.create({
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: req.user?._id || 'guest',
      restaurantId,
      items,
      customer,
      payment: {
        method: payment.method,
        cardId: payment.method === 'creditCard' ? payment.cardId : null,
        paymentIntentId: paymentResult.paymentIntentId,
        status: paymentResult.status === 'succeeded' ? 'completed' : paymentResult.status,
        amount: total,
        needsVerification: paymentResult.status === 'pending-verification'
      },
      subtotal,
      tax,
      deliveryFee,
      total,
      status: 'pending',
      notes: paymentResult.message ? [paymentResult.message] : []
    });

    res.status(201).json({
      success: true,
      order,
      warnings: paymentResult.message ? [paymentResult.message] : []
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
