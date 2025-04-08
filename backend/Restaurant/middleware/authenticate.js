const jwt = require("jsonwebtoken");
const Restaurant = require("../models/restaurant");

// Protect routes - authenticate user with JWT
exports.authenticate = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add restaurant object to req
    req.restaurant = await Restaurant.findById(decoded.id);

    // Check if restaurant exists
    if (!req.restaurant) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route",
    });
  }
};

// Check if restaurant is active
exports.isActive = (req, res, next) => {
  if (req.restaurant.status !== "active") {
    return res.status(403).json({
      success: false,
      error: "Restaurant account is not active",
    });
  }
  next();
};
