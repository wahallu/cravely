import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdArrowBack,
  MdLocationOn,
  MdDeliveryDining,
  MdStar,
  MdFastfood,
  MdRestaurantMenu,
} from "react-icons/md";
import { useGetRestaurantProfileQuery } from "../../Redux/slices/restaurantSlice";
import { useGetPublicRestaurantMealsQuery } from "../../Redux/slices/mealSlice";
import { useGetRestaurantPublicMenusQuery } from "../../Redux/slices/menuSlice";

export default function RestaurantDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("meals");

  // Fetch restaurant details
  const {
    data: restaurantData,
    isLoading: isRestaurantLoading,
    error: restaurantError,
  } = useGetRestaurantProfileQuery(id);

  // Fetch meals for this restaurant
  const {
    data: mealsData,
    isLoading: isMealsLoading,
    error: mealsError,
  } = useGetPublicRestaurantMealsQuery(id);

  // Fetch menus for this restaurant
  const {
    data: menusData,
    isLoading: isMenusLoading,
    error: menusError,
  } = useGetRestaurantPublicMenusQuery(id);

  // Extract data from API responses
  const restaurant = restaurantData?.data;
  const meals = mealsData?.data || [];
  const menus = menusData?.data || [];

  // Check if everything is loading
  const isLoading = isRestaurantLoading || isMealsLoading || isMenusLoading;

  // Check for errors
  const hasError = restaurantError || mealsError || menusError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-2xl mb-4">
          Failed to load restaurant data
        </div>
        <p className="text-gray-600 mb-4">
          {restaurantError?.data?.error ||
            mealsError?.data?.error ||
            menusError?.data?.error ||
            "An error occurred while fetching data"}
        </p>
        <Link
          to="/restaurants"
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg"
        >
          Back to All Restaurants
        </Link>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-gray-800 text-2xl mb-4">Restaurant not found</div>
        <Link
          to="/restaurants"
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg"
        >
          Back to All Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80">
        <img
          src={restaurant.image || "/hero1.png"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Link
            to="/restaurants"
            className="inline-flex items-center text-white mb-4 hover:underline"
          >
            <MdArrowBack className="mr-1" /> Back to Restaurants
          </Link>

          <div className="flex items-center">
            <img
              src={
                restaurant.logo || "https://via.placeholder.com/60x60?text=R"
              }
              alt={`${restaurant.name} logo`}
              className="w-16 h-16 rounded-full border-2 border-white shadow-md"
            />
            <div className="ml-4">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center mt-1">
                <MdStar className="text-yellow-400 mr-1" />
                <span>{restaurant.rating || "4.0"}</span>
                <span className="mx-1">•</span>
                <span>{restaurant.reviewCount || 0} reviews</span>
                <span className="mx-1">•</span>
                <span>{restaurant.cuisineType}</span>
              </div>
              <div className="flex items-center mt-1">
                <MdLocationOn className="mr-1" />
                <span>{restaurant.address}</span>
                <span className="mx-2">•</span>
                <MdDeliveryDining className="mr-1" />
                <span>{restaurant.deliveryTime || "30-45 min"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Details and Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              About {restaurant.name}
            </h2>
            <p className="text-gray-600">
              {restaurant.description ||
                `Welcome to ${restaurant.name}! We serve delicious meals prepared with the finest ingredients.`}
            </p>
          </div>
        </div>

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

        {/* Meals Tab Content */}
        {activeTab === "meals" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {meals.length > 0 ? (
              meals.map((meal) => (
                <motion.div
                  key={meal._id}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
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
                          ${parseFloat(meal.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      {meal.description}
                    </p>
                    <div className="mt-3">
                      <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                        {meal.category}
                      </span>
                    </div>
                    <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <MdFastfood className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">
                  No meals available from this restaurant
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {menus.length > 0 ? (
              menus.map((menu) => (
                <motion.div
                  key={menu._id}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
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
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      {menu.description}
                    </p>

                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Items in this menu:
                      </h4>
                      <ul className="space-y-1">
                        {menu.menuItems && menu.menuItems.length > 0 ? (
                          menu.menuItems.map((item) => (
                            <li
                              key={item._id}
                              className="text-sm flex justify-between"
                            >
                              <span>{item.name}</span>
                              <span className="text-green-600">
                                ${parseFloat(item.price).toFixed(2)}
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
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <MdRestaurantMenu className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">
                  No set menus available from this restaurant
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
