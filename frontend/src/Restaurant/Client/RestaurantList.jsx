import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdLocationOn,
  MdDeliveryDining,
  MdStar,
  MdSearch,
  MdFilterList,
} from "react-icons/md";
import { useGetAllRestaurantsQuery } from "../../Redux/slices/restaurantSlice";

export default function RestaurantList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    cuisine: "",
    rating: 0,
    priceRange: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch restaurants using Redux query hook
  const { data, error, isLoading } = useGetAllRestaurantsQuery();

  // Get restaurants array from response or empty array if still loading
  const restaurants = data?.data || [];

  // Filter restaurants based on search query and filters
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Filter by search query
    const matchesSearch =
      restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by cuisine
    const matchesCuisine =
      filters.cuisine === "" || restaurant.cuisine === filters.cuisine;

    // Filter by rating
    const matchesRating = restaurant.rating >= filters.rating;

    // Filter by price range
    const matchesPrice =
      filters.priceRange === "" || restaurant.priceRange === filters.priceRange;

    return matchesSearch && matchesCuisine && matchesRating && matchesPrice;
  });

  // Get unique cuisines for filter dropdown
  const cuisines = [
    ...new Set(
      restaurants.map((restaurant) => restaurant.cuisine).filter(Boolean)
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search and filters */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Restaurants Near You
            </h1>

            <div className="w-full sm:w-auto flex items-center space-x-2">
              <div className="relative flex-grow">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-orange-100 text-orange-500 p-2 rounded-lg hover:bg-orange-200 transition-colors"
              >
                <MdFilterList className="text-xl" />
              </button>
            </div>
          </div>

          {/* Filter options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuisine Type
                    </label>
                    <select
                      value={filters.cuisine}
                      onChange={(e) =>
                        setFilters({ ...filters, cuisine: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">All Cuisines</option>
                      {cuisines.map((cuisine, index) => (
                        <option key={index} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          rating: parseFloat(e.target.value),
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="0">Any Rating</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) =>
                        setFilters({ ...filters, priceRange: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Any Price</option>
                      <option value="$">$ (Budget)</option>
                      <option value="$$">$$ (Average)</option>
                      <option value="$$$">$$$ (Expensive)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-red-500 text-xl mb-2">
              Error loading restaurants
            </div>
            <p className="text-gray-500">Please try again later</p>
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <>
            {/* Featured restaurants section */}
            {filteredRestaurants.some((restaurant) => restaurant.featured) && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Featured Restaurants
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRestaurants
                    .filter((restaurant) => restaurant.featured)
                    .map((restaurant) => (
                      <RestaurantCard
                        key={restaurant._id}
                        restaurant={restaurant}
                        featured={true}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* All restaurants section */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              All Restaurants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <img
              src="/hero1.png"
              alt="No results"
              className="w-24 h-24 object-contain opacity-50 mb-4"
            />
            <h3 className="text-xl font-medium text-gray-700">
              No restaurants found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Restaurant Card Component
const RestaurantCard = ({ restaurant, featured = false }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
        featured ? "border-2 border-orange-400" : ""
      }`}
    >
      {/* Restaurant Image */}
      <div className="relative h-40">
        <img
          src={restaurant.image || "/hero1.png"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />

        {featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </span>
          </div>
        )}

        {/* Restaurant Logo */}
        <div className="absolute -bottom-5 left-4">
          <img
            src={restaurant.logo || "https://via.placeholder.com/60x60?text=R"}
            alt={`${restaurant.name} logo`}
            className="w-14 h-14 rounded-full border-2 border-white shadow-md"
          />
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="p-4 pt-6">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-800">{restaurant.name}</h3>
          <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded">
            <MdStar className="text-yellow-500 mr-1" />
            <span>{restaurant.rating || "N/A"}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({restaurant.reviews || 0})
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center text-gray-500 text-sm">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {restaurant.cuisine}
          </span>
          <span className="mx-2">•</span>
          <span>{restaurant.priceRange || "$"}</span>
        </div>

        <div className="mt-3 flex items-center text-sm text-gray-500">
          <MdLocationOn className="text-gray-400 mr-1" />
          <span>
            {restaurant.distance
              ? `${restaurant.distance} miles away`
              : restaurant.address}
          </span>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <MdDeliveryDining className="text-gray-400 mr-1" />
            <span>{restaurant.deliveryTime || "30-45 min"}</span>
          </div>
          <span className="text-sm">
            {restaurant.deliveryFee || "Free"} delivery
          </span>
        </div>

        <Link to={`/restaurant/${restaurant._id}`}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            View Menu
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};
