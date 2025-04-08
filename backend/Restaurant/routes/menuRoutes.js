const express = require("express");
const {
  createMenu,
  getMenus,
  getMenu,
  updateMenu,
  deleteMenu,
  getPublicRestaurantMenus,
} = require("../controllers/menuController");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

// Public route for accessing restaurant menus
router.get("/public/restaurants/:restaurantId/menus", getPublicRestaurantMenus);

// Protect all other routes - require restaurant authentication
router.use(authenticate);

router.route("/").get(getMenus).post(createMenu);
router.route("/:id").get(getMenu).put(updateMenu).delete(deleteMenu);

module.exports = router;
