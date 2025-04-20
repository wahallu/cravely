export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const endpoints = {
  auth: `${API_BASE_URL}/auth`,
  users: `${API_BASE_URL}/users`,
  restaurants: `${API_BASE_URL}/restaurants`,
  orders: `${API_BASE_URL}/orders`,
  delivery: `${API_BASE_URL}/deliveries`,
  // Add other endpoints as needed
};