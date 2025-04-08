const Meal = require("../models/meal");

// @desc    Create new meal
// @route   POST /api/meals
// @access  Private (Restaurant only)
exports.createMeal = async (req, res, next) => {
  try {
    // Add the restaurant ID from authenticated user
    req.body.restaurant = req.restaurant._id;

    const meal = await Meal.create(req.body);

    res.status(201).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all meals for a restaurant
// @route   GET /api/meals
// @access  Private (Restaurant only)
exports.getMeals = async (req, res, next) => {
  try {
    const meals = await Meal.find({ restaurant: req.restaurant._id });

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Private (Restaurant only)
exports.getMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: "Meal not found",
      });
    }

    // Check if the meal belongs to the authenticated restaurant
    if (meal.restaurant.toString() !== req.restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this meal",
      });
    }

    res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private (Restaurant only)
exports.updateMeal = async (req, res, next) => {
  try {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: "Meal not found",
      });
    }

    // Check if the meal belongs to the authenticated restaurant
    if (meal.restaurant.toString() !== req.restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this meal",
      });
    }

    // Update the meal
    req.body.updatedAt = Date.now();
    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private (Restaurant only)
exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: "Meal not found",
      });
    }

    // Check if the meal belongs to the authenticated restaurant
    if (meal.restaurant.toString() !== req.restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this meal",
      });
    }
    // Delete the meal
    await meal.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public meals for a restaurant (for customer view)
// @route   GET /api/restaurants/:restaurantId/meals
// @access  Public
exports.getPublicRestaurantMeals = async (req, res, next) => {
  try {
    const meals = await Meal.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    });

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals,
    });
  } catch (error) {
    next(error);
  }
};
