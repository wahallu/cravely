import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdArrowBack, MdLocationOn, MdDeliveryDining, MdStar, MdSearch, MdRestaurantMenu, MdFastfood } from 'react-icons/md';

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('meals');
  
  useEffect(() => {
    // In a real app, you'd fetch this data from an API based on the restaurant ID
    // This is just mock data
    setTimeout(() => {
      // Mock restaurant data
      const restaurantData = {
        id: parseInt(id),
        name: "Burger Arena",
        image: "/hero1.png",
        logo: "https://via.placeholder.com/60x60?text=BA",
        rating: 4.8,
        reviews: 243,
        cuisine: "American",
        priceRange: "$$",
        deliveryTime: "20-30 min",
        deliveryFee: "$2.99",
        minOrder: 10,
        distance: 1.2,
        address: "123 Main St, Downtown",
        description: "Juicy burgers made with premium ingredients. Our chef's selection includes both classic and innovative recipes to satisfy every burger lover.",
        // Mock meals data
        meals: [
          {
            id: '1',
            name: 'Classic Cheeseburger',
            description: 'Juicy beef patty with cheddar cheese, lettuce, and tomato',
            price: 8.99,
            category: 'Burger',
            image: '/hero1.png',
            ingredients: 'Beef, cheese, lettuce, tomato, bun',
            allergens: 'Gluten, dairy'
          },
          {
            id: '2',
            name: 'Veggie Supreme',
            description: 'Plant-based patty with avocado and sprouts',
            price: 9.99,
            category: 'Burger',
            image: '/hero1.png',
            ingredients: 'Plant protein, avocado, sprouts, bun',
            allergens: 'Gluten'
          },
          {
            id: '3',
            name: 'Crispy Chicken Sandwich',
            description: 'Crispy chicken with special sauce',
            price: 7.99,
            category: 'Sandwich',
            image: '/hero1.png',
            ingredients: 'Chicken breast, lettuce, mayo, bun',
            allergens: 'Gluten, dairy, egg'
          }
        ],
        // Mock menus data
        menus: [
          {
            id: '1',
            name: 'Summer Special',
            description: 'Limited time summer offerings',
            image: '/hero1.png',
            items: [
              {
                id: '1',
                name: 'Classic Cheeseburger',
                price: 8.99
              },
              {
                id: '3',
                name: 'Crispy Chicken Sandwich',
                price: 7.99
              }
            ]
          },
          {
            id: '2',
            name: 'Value Menu',
            description: 'Great food at affordable prices',
            image: '/hero1.png',
            items: [
              {
                id: '1',
                name: 'Classic Cheeseburger',
                price: 8.99
              },
              {
                id: '2',
                name: 'Veggie Supreme',
                price: 9.99
              }
            ]
          }
        ]
      };
      setRestaurant(restaurantData);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Link to="/restaurants" className="inline-flex items-center text-white mb-4 hover:underline">
            <MdArrowBack className="mr-1" /> Back to Restaurants
          </Link>
          
          <div className="flex items-center">
            <img 
              src={restaurant.logo} 
              alt={`${restaurant.name} logo`} 
              className="w-16 h-16 rounded-full border-2 border-white shadow-md"
            />
            <div className="ml-4">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center mt-1">
                <MdStar className="text-yellow-400 mr-1" />
                <span>{restaurant.rating}</span>
                <span className="mx-1">•</span>
                <span>{restaurant.reviews} reviews</span>
                <span className="mx-1">•</span>
                <span>{restaurant.cuisine}</span>
              </div>
              <div className="flex items-center mt-1">
                <MdLocationOn className="mr-1" />
                <span>{restaurant.address}</span>
                <span className="mx-2">•</span>
                <MdDeliveryDining className="mr-1" />
                <span>{restaurant.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Restaurant Details and Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">About {restaurant.name}</h2>
            <p className="text-gray-600">{restaurant.description}</p>
          </div>
        </div>
        
        {/* Tabs for Meals and Menus */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('meals')}
            className={`py-3 px-6 font-medium flex items-center gap-2 ${
              activeTab === 'meals'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MdFastfood /> Individual Items
          </button>
          <button
            onClick={() => setActiveTab('menus')}
            className={`py-3 px-6 font-medium flex items-center gap-2 ${
              activeTab === 'menus'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MdRestaurantMenu /> Set Menus
          </button>
        </div>
        
        {/* Meals Tab Content */}
        {activeTab === 'meals' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {restaurant.meals.map((meal) => (
              <motion.div
                key={meal.id}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300"
              >
                <img 
                  src={meal.image} 
                  alt={meal.name} 
                  className="w-full h-44 object-cover"
                />
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">{meal.name}</h3>
                      <span className="block text-green-600 font-medium">${meal.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{meal.description}</p>
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
            ))}
          </motion.div>
        )}

        {/* Menus Tab Content */}
        {activeTab === 'menus' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {restaurant.menus.map((menu) => (
              <motion.div
                key={menu.id}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300"
              >
                <img 
                  src={menu.image} 
                  alt={menu.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">{menu.name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{menu.description}</p>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Items in this menu:</h4>
                    <ul className="space-y-1">
                      {menu.items.map(item => (
                        <li key={item.id} className="text-sm flex justify-between">
                          <span>{item.name}</span>
                          <span className="text-green-600">${item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors">
                    Order This Menu
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}