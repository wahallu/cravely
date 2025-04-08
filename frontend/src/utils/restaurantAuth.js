// Restaurant Authentication utility functions

// Save restaurant token to localStorage
export const saveRestaurantToken = (token) => {
  localStorage.setItem("restaurantToken", token);
};

// Get restaurant token from localStorage
export const getRestaurantToken = () => {
  return localStorage.getItem("restaurantToken");
};

// Remove restaurant token from localStorage
export const removeRestaurantToken = () => {
  localStorage.removeItem("restaurantToken");
};

// Check if restaurant is logged in
export const isRestaurantLoggedIn = () => {
  return !!getRestaurantToken();
};
