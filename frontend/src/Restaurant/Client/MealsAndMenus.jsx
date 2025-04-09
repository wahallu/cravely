import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdFastfood,
  MdRestaurantMenu,
  MdFilterList,
  MdSearch,
  MdClose,
} from 'react-icons/md';
import { useGetPublicRestaurantMealsQuery } from '../../Redux/slices/mealSlice';
import { useGetRestaurantPublicMenusQuery } from '../../Redux/slices/menuSlice';

const MealsAndMenus = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('meals');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceMin: 0,
    priceMax: 50,
    sortBy: 'name'
  });

  // Fetch meals for this restaurant
  const { data: mealsData, isLoading: isMealsLoading } = useGetPublicRestaurantMealsQuery(id);

  // Fetch menus for this restaurant
  const { data: menusData, isLoading: isMenusLoading } = useGetRestaurantPublicMenusQuery(id);

  // Extract data from API responses
  const meals = mealsData?.data || [];
  const menus = menusData?.data || [];

  // Get unique categories for filter dropdown
  const categories = [
    ...new Set(meals.map((meal) => meal.category).filter(Boolean)),
  ];

  // Filter meals based on search and filters
  const filteredMeals = meals.filter((meal) => {
    // Search query filter
    const matchesSearch = meal.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         meal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !filters.category || meal.category === filters.category;
    
    // Price filter
    const price = parseFloat(meal.price || 0);
    const matchesPrice = price >= filters.priceMin && price <= filters.priceMax;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Filter menus based on search
  const filteredMenus = menus.filter((menu) => {
    return menu.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           menu.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort meals based on the selected sortBy option
  const sortedMeals = [...filteredMeals].sort((a, b) => {
    if (filters.sortBy === 'price-low') {
      return parseFloat(a.price || 0) - parseFloat(b.price || 0);
    } else if (filters.sortBy === 'price-high') {
      return parseFloat(b.price || 0) - parseFloat(a.price || 0);
    } else {
      // Sort by name as default
      return a.name.localeCompare(b.name);
    }
  });

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      category: '',
      priceMin: 0,
      priceMax: 50,
      sortBy: 'name'
    });
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <MdFilterList />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {(showFilters || searchQuery || filters.category || filters.sortBy !== 'name' || 
            filters.priceMin > 0 || filters.priceMax < 50) && (
            <button
              onClick={resetFilters}
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <MdClose /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={filters.priceMax}
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: Math.max(0, Number(e.target.value)) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min={filters.priceMin}
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {(activeTab === 'meals' && isMealsLoading) || (activeTab === 'menus' && isMenusLoading) ? (
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
              {sortedMeals.length > 0 ? (
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
                            <span className="font-medium">Ingredients:</span> {meal.ingredients}
                          </p>
                        )}
                        {meal.allergens && (
                          <p className="text-gray-500 text-xs mt-1">
                            <span className="font-medium">Allergens:</span> {meal.allergens}
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
                <div className="text-center py-12">
                  <MdFastfood className="text-gray-300 text-5xl mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchQuery || filters.category || filters.priceMin > 0 || filters.priceMax < 50
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
              {filteredMenus.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMenus.map((menu) => {
                    // Find the meal objects for the menu items
                    const menuItemsWithDetails =
                      menu.menuItems &&
                      menu.menuItems.map((itemId) => {
                        // Check if menuItems contains IDs or full objects
                        if (typeof itemId === "object" && itemId !== null) {
                          return itemId;
                        }
                        // Find the corresponding meal by ID
                        return (
                          meals.find(
                            (meal) => meal._id === itemId || meal.id === itemId
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
                            {menu.description || "No description available"}
                          </p>

                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">
                              Items in this menu:
                            </h4>
                            <ul className="space-y-1">
                              {menuItemsWithDetails && menuItemsWithDetails.length > 0 ? (
                                menuItemsWithDetails.map((item, index) => (
                                  <li
                                    key={item._id || item.id || index}
                                    className="text-sm flex justify-between"
                                  >
                                    <span>{item.name}</span>
                                    <span className="text-green-600">
                                      ${parseFloat(item.price || 0).toFixed(2)}
                                    </span>
                                  </li>
                                ))
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
                <div className="text-center py-12">
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
    </div>
  );
};

export default MealsAndMenus;
