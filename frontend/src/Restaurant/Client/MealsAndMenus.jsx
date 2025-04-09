import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdFastfood,
  MdRestaurantMenu,
  MdFilterList,
  MdSearch,
  MdClose,
  MdRefresh,
  MdStar,
  MdAttachMoney,
} from "react-icons/md";
import { useGetAllMealsQuery } from "../../Redux/slices/mealSlice";
import { useGetAllMenusQuery } from "../../Redux/slices/menuSlice";
import Slider from "rc-slider"; // You'll need to import this
import "rc-slider/assets/index.css"; // And its styles

const MealsAndMenus = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("meals");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priceMin: 0,
    priceMax: 50,
    sortBy: "name",
    priceRangeValues: [0, 50], // Add this for the slider
    rating: 0,
  });

  // Fetch meals for this restaurant
  const { data: mealsData, isLoading: isMealsLoading } = useGetAllMealsQuery();

  // Fetch menus for this restaurant
  const { data: menusData, isLoading: isMenusLoading } = useGetAllMenusQuery();

  // Get unique categories for filter dropdown
  const categories =
    !isMealsLoading && mealsData?.length > 0
      ? [...new Set(mealsData.map((meal) => meal.category).filter(Boolean))]
      : [];

  // Handle price range slider change
  const handlePriceRangeChange = (values) => {
    setFilters({
      ...filters,
      priceRangeValues: values,
      priceMin: values[0],
      priceMax: values[1],
    });
  };

  // Filter meals based on search and filters
  const filteredMeals = !isMealsLoading
    ? mealsData?.filter((meal) => {
        // Search query filter
        const matchesSearch =
          meal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meal.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory =
          !filters.category || meal.category === filters.category;

        // Price filter
        const price = parseFloat(meal.price || 0);
        const matchesPrice =
          price >= filters.priceMin && price <= filters.priceMax;

        // Rating filter (if you have ratings for meals)
        const matchesRating = meal.rating
          ? meal.rating >= filters.rating
          : true;

        return (
          matchesSearch && matchesCategory && matchesPrice && matchesRating
        );
      })
    : [];

  // Filter menus based on search
  const filteredMenus = !isMenusLoading
    ? menusData?.filter((menu) => {
        return (
          menu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          menu.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  // Sort meals based on the selected sortBy option
  const sortedMeals = [...(filteredMeals || [])].sort((a, b) => {
    if (filters.sortBy === "price-low") {
      return parseFloat(a.price || 0) - parseFloat(b.price || 0);
    } else if (filters.sortBy === "price-high") {
      return parseFloat(b.price || 0) - parseFloat(a.price || 0);
    } else {
      // Sort by name as default
      return (a.name || "").localeCompare(b.name || "");
    }
  });

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      category: "",
      priceMin: 0,
      priceMax: 50,
      sortBy: "name",
      priceRangeValues: [0, 50],
      rating: 0,
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Decorative Background Elements (similar to RestaurantList) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background pattern */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: `url(${"/herobg.png"})`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        ></div>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Title */}
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Meals & Menus
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar with filters */}
          <motion.div
            className="md:w-1/4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Search bar */}
            <div className="border border-gray-300 py-2 px-4 rounded-xl flex justify-between items-center mb-5">
              <input
                type="text"
                placeholder="Search meals and menus..."
                className="bg-transparent text-gray-700 w-full outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MdSearch className="text-gray-400 text-xl" />
            </div>

            {/* Reset button */}
            <div className="flex justify-between mb-5">
              <div className="font-semibold text-xl text-gray-800">Filters</div>
              <button
                onClick={resetFilters}
                className="font-semibold text-orange-500 hover:text-orange-600 flex items-center"
              >
                <MdRefresh className="mr-1" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price range slider */}
            <div className="mb-6">
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Price range
              </p>
              <div className="relative mb-8">
                <div className="flex justify-between mb-3">
                  <div className="bg-orange-100 text-orange-500 rounded px-2 py-1">
                    <span className="text-sm">
                      ${filters.priceRangeValues[0]}
                    </span>
                  </div>
                  <div className="bg-orange-100 text-orange-500 rounded px-2 py-1">
                    <span className="text-sm">
                      ${filters.priceRangeValues[1]}
                    </span>
                  </div>
                </div>
                <Slider
                  range
                  min={0}
                  max={50}
                  value={filters.priceRangeValues}
                  onChange={handlePriceRangeChange}
                  trackStyle={[{ backgroundColor: "#f97316" }]}
                  handleStyle={[
                    {
                      backgroundColor: "#f97316",
                      borderColor: "#ea580c",
                      opacity: 1,
                    },
                    {
                      backgroundColor: "#f97316",
                      borderColor: "#ea580c",
                      opacity: 1,
                    },
                  ]}
                  railStyle={{ backgroundColor: "#f3f4f6" }}
                />
              </div>
            </div>

            {/* Sort By Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div className="mb-6">
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[3, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters({ ...filters, rating: rating })}
                    className={`rounded-lg py-2 text-center transition-colors ${
                      filters.rating === rating
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    {rating}+ <MdStar className="inline text-yellow-400" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main content area */}
          <motion.div
            className="md:w-3/4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Tabs for Meals and Menus */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("meals")}
                className={`py-3 px-6 font-medium flex items-center gap-2 ${
                  activeTab === "meals"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdFastfood /> Individual Items
              </button>
              <button
                onClick={() => setActiveTab("menus")}
                className={`py-3 px-6 font-medium flex items-center gap-2 ${
                  activeTab === "menus"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdRestaurantMenu /> Set Menus
              </button>
            </div>

            {/* Loading States */}
            {(activeTab === "meals" && isMealsLoading) ||
            (activeTab === "menus" && isMenusLoading) ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                {/* Meals Tab Content */}
                {activeTab === "meals" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {sortedMeals && sortedMeals.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedMeals.map((meal) => (
                          <motion.div
                            key={meal._id || meal.id}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300"
                          >
                            <img
                              src={meal.image || "/hero1.png"}
                              alt={meal.name}
                              className="w-full h-44 object-cover"
                            />
                            <div className="p-5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-xl text-gray-800">
                                    {meal.name}
                                  </h3>
                                  <span className="block text-green-600 font-medium">
                                    ${parseFloat(meal.price || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                {meal.description || "No description available"}
                              </p>
                              {meal.category && (
                                <div className="mt-3">
                                  <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                                    {meal.category}
                                  </span>
                                </div>
                              )}
                              {meal.ingredients && (
                                <p className="text-gray-500 text-xs mt-2">
                                  <span className="font-medium">
                                    Ingredients:
                                  </span>{" "}
                                  {meal.ingredients}
                                </p>
                              )}
                              {meal.allergens && (
                                <p className="text-gray-500 text-xs mt-1">
                                  <span className="font-medium">
                                    Allergens:
                                  </span>{" "}
                                  {meal.allergens}
                                </p>
                              )}
                              <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors">
                                Add to Cart
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64">
                        <MdFastfood className="text-gray-300 text-5xl mx-auto mb-3" />
                        <p className="text-gray-500">
                          {searchQuery ||
                          filters.category ||
                          filters.priceMin > 0 ||
                          filters.priceMax < 50 ||
                          filters.rating > 0
                            ? "No meals match your search criteria"
                            : "No meals available"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Menus Tab Content */}
                {activeTab === "menus" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {filteredMenus && filteredMenus.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredMenus.map((menu) => {
                          // Find the meal objects for the menu items
                          const menuItemsWithDetails =
                            menu.menuItems &&
                            menu.menuItems.map((itemId) => {
                              // Check if menuItems contains IDs or full objects
                              if (
                                typeof itemId === "object" &&
                                itemId !== null
                              ) {
                                return itemId;
                              }
                              // Find the corresponding meal by ID
                              return (
                                mealsData?.find(
                                  (meal) =>
                                    meal._id === itemId || meal.id === itemId
                                ) || {
                                  name: "Unknown Item",
                                  price: 0,
                                }
                              );
                            });

                          // Calculate the total price of all items in the menu
                          const totalPrice = menuItemsWithDetails.reduce(
                            (sum, item) => sum + parseFloat(item.price || 0),
                            0
                          );

                          return (
                            <motion.div
                              key={menu._id || menu.id}
                              whileHover={{ y: -5 }}
                              className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300"
                            >
                              <img
                                src={menu.image || "/hero1.png"}
                                alt={menu.name}
                                className="w-full h-48 object-cover"
                              />
                              <div className="p-5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-bold text-xl text-gray-800">
                                      {menu.name}
                                    </h3>
                                    <span className="block text-green-600 font-medium">
                                      ${totalPrice.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm mt-2">
                                  {menu.description ||
                                    "No description available"}
                                </p>

                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-700 mb-2">
                                    Items in this menu:
                                  </h4>
                                  <ul className="space-y-1">
                                    {menuItemsWithDetails &&
                                    menuItemsWithDetails.length > 0 ? (
                                      menuItemsWithDetails.map(
                                        (item, index) => (
                                          <li
                                            key={item._id || item.id || index}
                                            className="text-sm flex justify-between"
                                          >
                                            <span>{item.name}</span>
                                            <span className="text-green-600">
                                              $
                                              {parseFloat(
                                                item.price || 0
                                              ).toFixed(2)}
                                            </span>
                                          </li>
                                        )
                                      )
                                    ) : (
                                      <li className="text-sm text-gray-500">
                                        No items in this menu
                                      </li>
                                    )}
                                  </ul>
                                </div>

                                <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors">
                                  Order This Menu
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64">
                        <MdRestaurantMenu className="text-gray-300 text-5xl mx-auto mb-3" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No menus match your search criteria"
                            : "No set menus available"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MealsAndMenus;
