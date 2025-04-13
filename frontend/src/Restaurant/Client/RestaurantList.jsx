import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdLocationOn,
  MdDeliveryDining,
  MdStar,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdRestaurantMenu,
  MdAttachMoney,
} from "react-icons/md";
import { useGetAllRestaurantsQuery } from "../../Redux/slices/restaurantSlice";
import Slider from "rc-slider"; // You'll need to install this: npm install rc-slider
import "rc-slider/assets/index.css";

export default function RestaurantList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    cuisine: "",
    rating: 0,
    priceRange: "",
    deliveryTime: "",
    distance: 0,
    availableOnly: false,
    featured: false,
    priceRangeValues: [0, 50], // Min and max price in dollars
  });

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

    // Filter by featured if enabled
    const matchesFeatured = !filters.featured || restaurant.featured;

    // Filter by available only (you may need to add this property to your data)
    const matchesAvailable = !filters.availableOnly || restaurant.isAvailable;

    return (
      matchesSearch &&
      matchesCuisine &&
      matchesRating &&
      matchesPrice &&
      matchesFeatured &&
      matchesAvailable
    );
  });

  // Get unique cuisines for filter dropdown
  const cuisines = [
    ...new Set(
      restaurants.map((restaurant) => restaurant.cuisine).filter(Boolean)
    ),
  ];

  // Handle price range slider change
  const handlePriceRangeChange = (values) => {
    setFilters({
      ...filters,
      priceRangeValues: values,
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      cuisine: "",
      rating: 0,
      priceRange: "",
      deliveryTime: "",
      distance: 0,
      availableOnly: false,
      featured: false,
      priceRangeValues: [0, 50],
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background pattern */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: `url(${"/herobg.png"})`,
            // backgroundSize: "400px",
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        ></div>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Floating food icons */}
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="absolute opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              animation: `float ${Math.random() * 5 + 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <img
              src={"/hero1.png"}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Restaurants Near You
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
                placeholder="Search restaurants..."
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

            {/* Cuisine type */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
              </label>
              <select
                value={filters.cuisine}
                onChange={(e) =>
                  setFilters({ ...filters, cuisine: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Cuisines</option>
                {cuisines.map((cuisine, index) => (
                  <option key={index} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Price range */}
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

            {/* Price range quick select */}
            <div className="mb-6">
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Price Category
              </p>
              <div className="grid grid-cols-3 gap-2">
                {["$", "$$", "$$$"].map((price) => (
                  <button
                    key={price}
                    onClick={() =>
                      setFilters({ ...filters, priceRange: price })
                    }
                    className={`rounded-lg py-2 text-center transition-colors ${
                      filters.priceRange === price
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    {price}
                  </button>
                ))}
              </div>
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

            <hr className="border border-gray-200 my-5" />

            {/* Additional filters */}
            <div className="mb-5">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={filters.featured}
                  onChange={(e) =>
                    setFilters({ ...filters, featured: e.target.checked })
                  }
                  className="accent-orange-500 mr-2"
                />
                <label htmlFor="featured" className="text-gray-700">
                  Featured restaurants only
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={filters.availableOnly}
                  onChange={(e) =>
                    setFilters({ ...filters, availableOnly: e.target.checked })
                  }
                  className="accent-orange-500 mr-2"
                />
                <label htmlFor="available" className="text-gray-700">
                  Open now only
                </label>
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
                <AnimatePresence>
                  {filteredRestaurants.some(
                    (restaurant) => restaurant.featured
                  ) &&
                    !filters.featured && (
                      <motion.div
                        className="mb-10"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                          Featured Restaurants
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      </motion.div>
                    )}
                </AnimatePresence>

                {/* All restaurants section */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {filters.featured
                    ? "Featured Restaurants"
                    : "All Restaurants"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRestaurants
                    .filter((r) => !r.featured || filters.featured)
                    .map((restaurant, index) => (
                      <motion.div
                        key={restaurant._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <RestaurantCard restaurant={restaurant} />
                      </motion.div>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Restaurant Card Component (unchanged)
const RestaurantCard = ({ restaurant, featured = false }) => {
  // Existing RestaurantCard code
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
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
