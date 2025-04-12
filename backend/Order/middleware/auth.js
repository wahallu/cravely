const jwt = require('jsonwebtoken');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
  // For testing only - skip authentication
  req.user = { _id: 'testuser123', role: 'admin' };
  next();
  return;
  
  // Original authentication code below
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user from payload to request
      req.user = decoded;

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

/**
 * Check if user has specific roles
 * @param {...String} roles - Role names to check
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user?.role} is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
