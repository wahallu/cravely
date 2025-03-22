import React, { useState } from 'react'
import { IconContext } from 'react-icons';
import { MdFastfood, MdStar, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { motion } from 'framer-motion';

const restaurants = [
    {
        id: 1,
        image: '/hero1.png',
        name: 'Foodworld',
        logo: 'https://via.placeholder.com/60x60?text=F',
        discount: '20% off',
        fast: true,
        rating: 46,
        color: 'bg-blue-500',
    },
    {
        id: 2,
        image: '/hero1.png',
        name: 'Pizzahub',
        logo: 'https://via.placeholder.com/60x60?text=P',
        discount: '15% off',
        fast: true,
        rating: 40,
        color: 'bg-yellow-500',
    },
    {
        id: 3,
        image: '/hero1.png',
        name: 'Donuts hut',
        logo: 'https://via.placeholder.com/60x60?text=D',
        discount: '10% off',
        fast: true,
        rating: 20,
        color: 'bg-green-500',
    },
    {
        id: 4,
        image: '/hero1.png',
        name: 'Donuts hut',
        logo: 'https://via.placeholder.com/60x60?text=D',
        discount: '15% off',
        fast: true,
        rating: 50,
        color: 'bg-green-500',
    },
    {
        id: 5,
        image: '/hero1.png',
        name: 'Ruby Tuesday',
        logo: 'https://via.placeholder.com/60x60?text=R',
        discount: '10% off',
        fast: true,
        rating: 26,
        color: 'bg-orange-500',
    },
    {
        id: 6,
        image: '/hero1.png',
        name: 'Kuakata Fried Chicken',
        logo: 'https://via.placeholder.com/60x60?text=KFC',
        discount: '25% off',
        fast: true,
        rating: 53,
        color: 'bg-red-500',
    },
    {
        id: 7,
        image: '/hero1.png',
        name: 'Red Square',
        logo: 'https://via.placeholder.com/60x60?text=R',
        discount: '10% off',
        fast: true,
        rating: 45,
        color: 'bg-yellow-500',
    },
    {
        id: 8,
        image: '/hero1.png',
        name: 'Taco Bell',
        logo: 'https://via.placeholder.com/60x60?text=T',
        discount: '10% off',
        fast: true,
        rating: 35,
        color: 'bg-green-500',
    },
];

export default function FeaturedRestaurants() {
    const [hoveredId, setHoveredId] = useState(null);
    
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
                    {restaurants.map((restaurant) => (
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
                    <motion.button
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium flex items-center shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Explore All Restaurants
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    )
}
