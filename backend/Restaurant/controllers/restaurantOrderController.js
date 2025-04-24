const OrderService = require("../Services/orderService");

// @desc    Get restaurant orders
// @route   GET /api/restaurants/orders
// @access  Private (Restaurant only)
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurantId = req.restaurant._id;
    const { status } = req.query;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token is required",
      });
    }

    const orders = await OrderService.getRestaurantOrders(
      restaurantId,
      status,
      token
    );

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/restaurants/orders/:id/status
// @access  Private (Restaurant only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token is required",
      });
    }

    const updatedOrder = await OrderService.updateOrderStatus(
      id,
      status,
      token
    );

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
