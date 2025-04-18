const Menu = require("../models/menu");

// @desc    Create new menu
// @route   POST /api/menus
// @access  Private (Restaurant only)
exports.createMenu = async (req, res, next) => {
  try {
    req.body.restaurant = req.restaurant._id;

    const menu = await Menu.create(req.body);

    res.status(201).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all menus for a restaurant
// @route   GET /api/menus
// @access  Private (Restaurant only)
exports.getMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({ restaurant: req.restaurant._id }).populate(
      "menuItems"
    );

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu
// @route   GET /api/menus/:id
// @access  Private (Restaurant only)
exports.getMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id).populate("menuItems");

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found",
      });
    }

    if (menu.restaurant.toString() !== req.restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this menu",
      });
    }

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu
// @route   PUT /api/menus/:id
// @access  Private (Restaurant only)
exports.updateMenu = async (req, res, next) => {
  try {
    let menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found",
      });
    }

    if (menu.restaurant.toString() !== req.restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this menu",
      });
    }

    req.body.updatedAt = Date.now();
    menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu
// @route   DELETE /api/menus/:id
// @access  Private (Restaurant only)
exports.deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: "Menu not found",
      });
    }

    if (menu.restaurant.toString() !== req.restaurant._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this menu",
      });
    }

    await menu.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public menus for a restaurant (for customer view)
// @route   GET /api/menus/public/restaurants/:restaurantId/menus
// @access  Public
exports.getPublicRestaurantMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({
      restaurant: req.params.restaurantId,
    }).populate("menuItems");

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all menus (no restaurant filter)
// @route   GET /api/menus/all
// @access  Public
exports.getAllMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({}).populate("menuItems");
    
    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    next(error);
  }
};
