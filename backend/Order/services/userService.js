const axios = require('axios');

// Configure the base URL for the User service
const USER_SERVICE_URL = 'http://localhost:5004/api/users';

/**
 * Client for interacting with the User service
 */
class UserService {
  /**
   * Get user by ID
   * @param {string} userId - The user ID
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} User data
   */
  static async getUserById(userId, token) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.message);
      throw error;
    }
  }

  /**
   * Update user data
   * @param {string} userId - The user ID
   * @param {Object} userData - User data to update
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Updated user data
   */
  static async updateUser(userId, userData, token) {
    try {
      const response = await axios.put(`${USER_SERVICE_URL}/${userId}`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error.message);
      throw error;
    }
  }
}

module.exports = UserService;