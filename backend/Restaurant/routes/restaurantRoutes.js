const express = require("express");
const {
  registerRestaurant,
  loginRestaurant,
  getRestaurantProfile,
  updateRestaurantProfile,
  getAllRestaurants,
} = require("../controllers/restaurantController");
const { authenticate, isActive } = require("../middleware/authenticate");

const router = express.Router();

// Public routes
router.post("/register", registerRestaurant);
router.post("/login", loginRestaurant);
router.get("/all", getAllRestaurants); // Public for demo, would be restricted in real app

// Protected routes
router.get("/profile", authenticate, getRestaurantProfile);
router.put("/profile", authenticate, updateRestaurantProfile);

// Routes that require active status
router.get("/dashboard", authenticate, isActive, (req, res) => {
  res.json({ success: true, message: "Dashboard data" });
});

module.exports = router;
