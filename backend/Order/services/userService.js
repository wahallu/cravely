const axios = require('axios');
require('dotenv').config();

// Configure the base URL for the User service
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5004/api/users';

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
          Authorization: `Bearer ${token}`,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user from User service:', error.message);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  /**
   * Update user information
   * @param {string} userId - The user ID
   * @param {Object} updateData - Data to update on the user
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Updated user data
   */
  static async updateUser(userId, updateData, token) {
    try {
      const response = await axios.put(`${USER_SERVICE_URL}/${userId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating user in User service:', error.message);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data for creation
   * @returns {Promise<Object>} Created user data
   */
  static async createUser(userData) {
    try {
      const response = await axios.post(`${USER_SERVICE_URL}/signup`, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user in User service:', error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result with token
   */
  static async loginUser(email, password) {
    try {
      const response = await axios.post(`${USER_SERVICE_URL}/login`, {
        email,
        password
      });
      
      return response.data;
    } catch (error) {
      console.error('Error authenticating user:', error.message);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Get all users (admin only)
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Array>} List of users
   */
  static async getAllUsers(token) {
    try {
      const response = await axios.get(USER_SERVICE_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  /**
   * Delete a user 
   * @param {string} userId - The user ID to delete
   * @param {string} token - JWT token for authentication
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteUser(userId, token) {
    try {
      const response = await axios.delete(`${USER_SERVICE_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error.message);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

module.exports = UserService;