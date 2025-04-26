const express = require("express");
const {
  registerRestaurant,
  loginRestaurant,
  getRestaurantProfile,
  updateRestaurantProfile,
  getAllRestaurants,
  getRestaurantById,
} = require("../controllers/restaurantController");
const {
  getRestaurantOrders,
  updateOrderStatus,
} = require("../controllers/restaurantOrderController");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

// Public routes
router.post("/register", registerRestaurant);
router.post("/login", loginRestaurant);
router.get("/all", getAllRestaurants); // Public for demo, would be restricted in real app
router.get("/:id", getRestaurantById); // Public route to get restaurant by ID

// Protected routes
router.get("/profile", authenticate, getRestaurantProfile);
router.put("/profile", authenticate, updateRestaurantProfile);

// Routes that require active status
router.get("/dashboard", authenticate, (req, res) => {
  res.json({ success: true, message: "Dashboard data" });
});

// Order-related routes
router.get("/orders", authenticate, getRestaurantOrders);
router.put("/orders/:id/status", authenticate, updateOrderStatus);

module.exports = router;
