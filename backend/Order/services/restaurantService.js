const axios = require('axios');

// Configure the base URL for the Restaurant service
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5003/api/restaurants';

/**
 * Client for interacting with the Restaurant service
 */
class RestaurantService {
  /**
   * Get restaurant by ID
   * @param {string} restaurantId - The restaurant ID
   * @returns {Promise<Object>} Restaurant data
   */
  static async getRestaurantById(restaurantId) {
    try {
      const response = await axios.get(`${RESTAURANT_SERVICE_URL}/${restaurantId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error.message);
      return null; // Return null instead of throwing to prevent cascading failures
    }
  }
}

module.exports = RestaurantService;