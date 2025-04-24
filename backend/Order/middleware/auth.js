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
      role: decoded.role || 'user', // Add default role
      name: decoded.name || decoded.fullName || null // Store name for driver assignment
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
    // Always allow admin access to any route
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user?.role} is not authorized to access this resource`
      });
    }
    next();
  };
};

/**
 * Middleware to handle driver self-assignment to orders
 * This ensures drivers can only assign themselves to orders
 */
const verifyDriverSelfAssignment = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // For driver self-assignment: set driver data from authenticated user
  if (req.user.role === 'driver' || req.user.role === 'delivery') {
    // Automatically assign the authenticated driver's ID and name
    req.body.driverId = req.user._id;
    req.body.driverName = req.user.name;
    
    console.log(`Driver self-assignment: ${req.user.name} (${req.user._id})`);
  } 
  // Admin can assign any driver (as specified in request body)
  else if (req.user.role !== 'admin' && req.body.driverId) {
    return res.status(403).json({
      success: false,
      message: 'You can only assign orders to yourself'
    });
  }
  
  next();
};

module.exports = { 
  protect, 
  authorize,
  verifyDriverSelfAssignment
};
