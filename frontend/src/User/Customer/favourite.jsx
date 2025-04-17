import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  MdStar, 
  MdOutlineRestaurant,
  MdOutlineFastfood,
  MdArrowBack,
  MdFavorite,
  MdFavoriteBorder
} from 'react-icons/md'
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice'
import { useGetAllMealsQuery } from '../../Redux/slices/mealSlice'

export default function Favourite() {
  const [activeTab, setActiveTab] = useState('restaurants')
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([])
  const [favoriteMeals, setFavoriteMeals] = useState([])
  
  const { data: restaurantsData, isLoading: isRestaurantsLoading } = useGetAllRestaurantsQuery()
  const { data: mealsData, isLoading: isMealsLoading } = useGetAllMealsQuery()

  // Simulate fetching favorite data
  useEffect(() => {
    if (restaurantsData?.data) {
      // In a real app, you would filter actual favorites
      // Here we're just taking some restaurants and marking them as favorites
      const restaurants = restaurantsData.data || []
      const favorites = restaurants.slice(0, 5).map(restaurant => ({
        ...restaurant,
        isFavorite: true
      }))
      setFavoriteRestaurants(favorites)
    }
  }, [restaurantsData])

  useEffect(() => {
    if (mealsData) {
      // In a real app, you would filter actual favorites
      // Here we're just taking some meals and marking them as favorites
      const meals = mealsData || []
      const favorites = meals.slice(0, 6).map(meal => ({
        ...meal,
        isFavorite: true
      }))
      setFavoriteMeals(favorites)
    }
  }, [mealsData])

  // Toggle favorite status (would connect to API in real implementation)
  const toggleFavorite = (id, type) => {
    if (type === 'restaurant') {
      setFavoriteRestaurants(prev => 
        prev.map(item => item._id === id || item.id === id 
          ? { ...item, isFavorite: !item.isFavorite } 
          : item
        )
      )
    } else {
      setFavoriteMeals(prev => 
        prev.map(item => item._id === id || item.id === id 
          ? { ...item, isFavorite: !item.isFavorite } 
          : item
        )
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to="/user" className="mr-4">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <MdArrowBack className="text-gray-600" />
          </motion.div>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <MdFavorite className="text-red-500 mr-2" /> 
          Your Favorites
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button 
          className={`pb-3 px-4 font-medium flex items-center ${
            activeTab === 'restaurants' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('restaurants')}
        >
          <MdOutlineRestaurant className="mr-2" /> Restaurants
        </button>
        <button 
          className={`pb-3 px-4 font-medium flex items-center ${
            activeTab === 'meals' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('meals')}
        >
          <MdOutlineFastfood className="mr-2" /> Meals
        </button>
      </div>

      {/* Restaurants Tab Content */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          {isRestaurantsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : favoriteRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <MdFavoriteBorder className="mx-auto text-5xl text-gray-400 mb-3" />
              <h3 className="text-gray-500 text-lg">No favorite restaurants yet</h3>
              <p className="text-gray-400 mt-2">Explore restaurants and mark them as favorites</p>
              <Link to="/restaurants" className="mt-4 inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Explore Restaurants
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRestaurants.map((restaurant) => (
                <motion.div 
                  key={restaurant._id || restaurant.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative h-40">
                    <img 
                      src={restaurant.image || '/hero1.png'} 
                      alt={restaurant.name} 
                      className="h-full w-full object-cover"
                    />
                    <button 
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center"
                      onClick={() => toggleFavorite(restaurant._id || restaurant.id, 'restaurant')}
                    >
                      <MdFavorite className="text-red-500 text-xl" />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link to={`/restaurant/${restaurant._id || restaurant.id}`}>
                      <h3 className="font-medium text-lg text-gray-800">{restaurant.name}</h3>
                    </Link>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        <MdStar className="text-yellow-400 mr-1" />
                        <span className="text-sm">{restaurant.rating || '4.5'}</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{restaurant.cuisineType || 'Various Cuisine'}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{restaurant.deliveryTime || '25-35 min'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meals Tab Content */}
      {activeTab === 'meals' && (
        <div className="space-y-4">
          {isMealsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : favoriteMeals.length === 0 ? (
            <div className="text-center py-12">
              <MdFavoriteBorder className="mx-auto text-5xl text-gray-400 mb-3" />
              <h3 className="text-gray-500 text-lg">No favorite meals yet</h3>
              <p className="text-gray-400 mt-2">Browse through restaurants and favorite some delicious meals</p>
              <Link to="/restaurants" className="mt-4 inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Explore Restaurants
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteMeals.map((meal) => (
                <motion.div 
                  key={meal._id || meal.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative h-40">
                    <img 
                      src={meal.image || '/hero1.png'} 
                      alt={meal.name} 
                      className="h-full w-full object-cover"
                    />
                    {meal.discount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        {meal.discount}% OFF
                      </div>
                    )}
                    <button 
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center"
                      onClick={() => toggleFavorite(meal._id || meal.id, 'meal')}
                    >
                      <MdFavorite className="text-red-500 text-xl" />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link to={`/meal/${meal._id || meal.id}`}>
                      <h3 className="font-medium text-lg text-gray-800">{meal.name}</h3>
                    </Link>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        <MdStar className="text-yellow-400 mr-1" />
                        <span className="text-sm">{meal.rating || '4.5'}</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{meal.category || 'Various'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-medium text-gray-900">${meal.price?.toFixed(2) || '12.99'}</span>
                      <Link 
                        to={`/restaurant/${meal.restaurant}`}
                        className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200"
                      >
                        View Restaurant
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
