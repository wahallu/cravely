import React, { useState, useEffect } from 'react'
import { IconContext } from 'react-icons';
import { MdFastfood, MdStar, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice';
import { Link } from 'react-router-dom';

// Dummy data fallback
const dummyRestaurants = [
    {
        id: 'dummy-1',
        name: 'Burger Palace',
        rating: 4.8,
        cuisine: 'American',
        deliveryTime: '25-35 min',
        featured: true,
        logo: '/hero1.png',
        image: '/hero1.png',
        color: 'bg-red-500',
        fastDelivery: true
    },
    {
        id: 'dummy-2', 
        name: 'Pizza Corner',
        rating: 4.6,
        cuisine: 'Italian',
        deliveryTime: '30-40 min',
        featured: true,
        logo: '/hero1.png',
        image: '/hero1.png',
        color: 'bg-yellow-500',
        fastDelivery: true
    },
    {
        id: 'dummy-3',
        name: 'Sushi Master',
        rating: 4.9,
        cuisine: 'Japanese',
        deliveryTime: '35-45 min',
        featured: true,
        logo: '/hero1.png',
        image: '/hero1.png',
        color: 'bg-green-500',
        fastDelivery: false
    },
    {
        id: 'dummy-4',
        name: 'Taco Fiesta',
        rating: 4.5,
        cuisine: 'Mexican',
        deliveryTime: '20-30 min',
        featured: true,
        logo: '/hero1.png',
        image: '/hero1.png',
        color: 'bg-orange-500',
        fastDelivery: true
    }
];

export default function FeaturedRestaurants() {
    const [hoveredId, setHoveredId] = useState(null);
    const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
    
    // Fetch restaurants data
    const { data: restaurantsData, isLoading, error } = useGetAllRestaurantsQuery();
    
    // Process data when it's loaded
    useEffect(() => {
        if (restaurantsData?.data && restaurantsData.data.length > 0) {
            // Get all restaurants
            const restaurants = restaurantsData.data || [];
            
            // Filter for featured restaurants or just get first 8 if none are marked as featured
            let featured = restaurants.filter(r => r.featured);
            if (featured.length === 0) {
                featured = restaurants.slice(0, 8);
            }
            
            // Map to our display format
            const mappedRestaurants = featured.map(restaurant => {
                // Generate a random color for each restaurant
                const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                return {
                    id: restaurant._id || restaurant.id,
                    name: restaurant.name,
                    rating: restaurant.rating || 4.5,
                    cuisine: restaurant.cuisineType || 'Various',
                    deliveryTime: '25-35 min', // This could come from the restaurant data
                    logo: restaurant.logo || '/hero1.png',
                    image: restaurant.image || '/hero1.png',
                    color: randomColor,
                    fastDelivery: Math.random() > 0.5 // Random assignment for demo
                };
            });
            
            setFeaturedRestaurants(mappedRestaurants);
        } else if (!isLoading && (error || !restaurantsData?.data || restaurantsData.data.length === 0)) {
            // Use dummy data when API fails or returns empty data
            console.log('Using dummy restaurant data for featured restaurants');
            setFeaturedRestaurants(dummyRestaurants);
        }
    }, [restaurantsData, isLoading, error]);
    
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const childVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };
    
    const headingVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Featured Restaurants</h1>
                <p className="text-gray-500">Unable to load restaurants at this time.</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col items-center space-y-16 py-10'>
            <motion.h1 
                className="text-4xl font-bold text-center relative"
                initial="hidden"
                animate="visible"
                variants={headingVariants}
            >
                Featured Restaurants
            </motion.h1>
            
            <motion.div 
                className='w-full px-4 lg:px-8 max-w-7xl'
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredRestaurants.map((restaurant) => (
                        <motion.div 
                            key={restaurant.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300"
                            variants={childVariants}
                            whileHover={{ 
                                y: -8,
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                            }}
                            onHoverStart={() => setHoveredId(restaurant.id)}
                            onHoverEnd={() => setHoveredId(null)}
                        >
                            {/* Image with zoom effect */}
                            <div className="overflow-hidden relative h-64">
                                <motion.img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                />
                                
                                {/* Overlay badges */}
                                <div className="absolute top-3 left-3 flex space-x-2">
                                    <motion.span 
                                        className="bg-orange-500 text-white px-3 py-1 rounded-full flex items-center font-medium text-sm"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <IconContext.Provider value={{ size: '1rem', className: 'mr-1' }}>
                                            <MdFastfood />
                                        </IconContext.Provider>
                                        {restaurant.discount}
                                    </motion.span>
                                    
                                    {restaurant.fast && (
                                        <motion.span 
                                            className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            Fast Delivery
                                        </motion.span>
                                    )}
                                </div>
                            </div>

                            {/* Restaurant Info */}
                            <div className="p-5">
                                <div className="flex items-center space-x-3">
                                    <motion.img
                                        src={restaurant.logo}
                                        alt={`${restaurant.name} Logo`}
                                        className={`w-12 h-12 rounded-full p-1 ${restaurant.color} border-2 border-white`}
                                        whileHover={{ rotate: 10 }}
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold">{restaurant.name}</h2>
                                        <div className="flex items-center text-sm mt-1">
                                            <span className="flex items-center text-yellow-500">
                                                <MdStar className="mr-1" />
                                                <span>{restaurant.rating}/100</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link to={`/restaurant/${restaurant.id}`}>
                                    <motion.button
                                        className={`mt-4 w-full ${restaurant.color} text-white px-4 py-3 rounded-lg font-semibold flex justify-center items-center`}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0.9 }}
                                        animate={{ 
                                            opacity: 1,
                                            boxShadow: hoveredId === restaurant.id ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none"
                                        }}
                                    >
                                        View Menu
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
                
                {/* See More Button */}
                <motion.div 
                    className="mt-10 flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link to="/restaurants">
                        <motion.button
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium flex items-center shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore All Restaurants
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    )
}
