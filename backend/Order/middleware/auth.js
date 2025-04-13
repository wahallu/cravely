const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Protects routes by verifying JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Token verification successful');
    console.log('Decoded payload:', JSON.stringify(decoded, null, 2));
    
    // Set the user ID and role directly from the decoded token
    // Ensure we're using the actual user ID and role from the token
    req.user = {
      _id: decoded.id || decoded._id || decoded.userId,
      role: decoded.role || 'user' // Add default role
    };
    
    console.log('Authenticated user ID:', req.user._id);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
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
