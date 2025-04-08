// Restaurant Authentication utility functions

// Save restaurant token and data to localStorage
export const saveRestaurantAuth = (token, restaurant) => {
  localStorage.setItem("restaurantToken", token);
  localStorage.setItem("restaurantInfo", JSON.stringify(restaurant));
};

// Get restaurant token from localStorage
export const getRestaurantToken = () => {
  return localStorage.getItem("restaurantToken");
};

// Get restaurant info from localStorage
export const getRestaurantInfo = () => {
  const restaurantInfo = localStorage.getItem("restaurantInfo");
  return restaurantInfo ? JSON.parse(restaurantInfo) : null;
};

// Remove restaurant authentication data from localStorage
export const removeRestaurantAuth = () => {
  localStorage.removeItem("restaurantToken");
  localStorage.removeItem("restaurantInfo");
};

// Check if restaurant is logged in
export const isRestaurantLoggedIn = () => {
  return !!getRestaurantToken();
};
