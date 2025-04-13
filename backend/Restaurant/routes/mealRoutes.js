const express = require("express");
const {
  createMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal,
  getPublicRestaurantMeals,
  getAllMeals, // Add this
} = require("../controllers/mealController");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

// Public routes
router.get("/public/restaurants/:restaurantId/meals", getPublicRestaurantMeals);
router.get("/all", getAllMeals); // Add this new route

// Protect most routes - require restaurant authentication
router.use(authenticate);

// Routes for restaurant to manage their own meals
router.route("/").get(getMeals).post(createMeal);
router.route("/:id").get(getMeal).put(updateMeal).delete(deleteMeal);

module.exports = router;
