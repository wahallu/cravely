const axios = require("axios");
require("dotenv").config();

// Configure the base URL for the Order service
const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:5004/api/orders";

/**
 * Service for Restaurant service to communicate with Order service
 */
class OrderService {
  /**
   * Get all orders for a restaurant
   * @param {string} restaurantId - The restaurant ID
   * @param {string} status - Optional status filter
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Orders data
   */
  static async getRestaurantOrders(restaurantId, status, token) {
    try {
      const url = `${ORDER_SERVICE_URL}/restaurant/${restaurantId}`;
      const params = status ? { status } : {};

      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching restaurant orders:", error.message);
      throw error;
    }
  }

  /**
   * Update order status
   * @param {string} orderId - The order ID
   * @param {string} status - New status (confirmed, preparing, out_for_delivery, delivered, canceled)
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Updated order data
   */
  static async updateOrderStatus(orderId, status, token) {
    try {
      const response = await axios.put(
        `${ORDER_SERVICE_URL}/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error.message);
      throw error;
    }
  }

  /**
   * Get a specific order by ID
   * @param {string} orderId - The order ID
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Order data
   */
  static async getOrderById(orderId, token) {
    try {
      const response = await axios.get(`${ORDER_SERVICE_URL}/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error.message);
      throw error;
    }
  }

  /**
   * Get available orders for delivery
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Available orders data
   */
  static async getAvailableOrders(token) {
    try {
      const response = await axios.get(
        `${ORDER_SERVICE_URL}/available-for-delivery`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching available orders:", error.message);
      throw error;
    }
  }
}

module.exports = OrderService;
