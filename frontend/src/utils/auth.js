// Authentication utility functions

// Save user token and data to localStorage
export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userInfo", JSON.stringify(user));
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Get user info from localStorage
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Remove authentication data from localStorage
export const removeAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!getToken();
};
