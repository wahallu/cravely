const express = require("express");
const {
  createMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal,
  getPublicRestaurantMeals,
} = require("../controllers/mealController");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.get("/public/restaurants/:restaurantId/meals", getPublicRestaurantMeals);
// Protect most routes - require restaurant authentication
router.use(authenticate);
// router.use(isActive);

// Routes for restaurant to manage their own meals
router.route("/").get(getMeals).post(createMeal);
router.route("/:id").get(getMeal).put(updateMeal).delete(deleteMeal);

// Public route for accessing restaurant meals (defined outside main router)
module.exports = router;
