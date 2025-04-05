const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware to authenticate users
exports.authenticate = (req, res, next) => {
    try {
        // Use only one method to extract the token
        const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

        if (!token) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }
            req.user = decoded; // Attach user info to request object
            next(); // Proceed to the next middleware or route handler
        });
    } catch (error) {
        return res.status(401).json({
            message:
                error.name === "TokenExpiredError"
                    ? "Token expired. Please log in again."
                    : "Invalid token or expired session.",
        });
    }
};

// Middleware to authorize any user (admin, driver, or regular user)
exports.authorize = (req, res, next) => {
    if (!['admin', 'driver', 'user'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Invalid role.' });
    }
    next();
};