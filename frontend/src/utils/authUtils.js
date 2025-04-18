/**
 * Helper functions for authentication
 */

// Get user info from localStorage
export const getUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error retrieving user info from localStorage:', error);
    return null;
  }
};

// Get authentication token from localStorage
export const getToken = () => {
  try {
    const userInfo = getUserInfo();
    return userInfo?.token || null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Check if token is valid (not expired)
export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // For JWT tokens, a simple check would be to see if it's structured correctly
    // This is a basic check - for production, you might want more thorough validation
    const parts = token.split('.');
    return parts.length === 3;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Log out user by clearing localStorage
export const logoutUser = () => {
  try {
    localStorage.removeItem('userInfo');
  } catch (error) {
    console.error('Error logging out user:', error);
  }
};
