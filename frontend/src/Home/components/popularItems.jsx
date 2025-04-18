import React, { useState, useRef, useEffect } from 'react'
import { IconContext } from 'react-icons';
import { MdArrowBackIosNew, MdArrowForwardIos, MdLocationOn } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAllMealsQuery } from '../../Redux/slices/mealSlice';
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice';

export default function PopularItems() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const sliderRef = useRef(null);
    const containerRef = useRef(null);
    const [popularItems, setPopularItems] = useState([]);

    // Fetch meals and restaurants data
    const { data: mealsData, isLoading: isMealsLoading } = useGetAllMealsQuery();
    const { data: restaurantsData, isLoading: isRestaurantsLoading } = useGetAllRestaurantsQuery();

    // Process data when it's loaded
    useEffect(() => {
        if (mealsData && restaurantsData?.data) {
            // Get all meals and prepare them with restaurant info
            const meals = mealsData || [];
            const restaurants = restaurantsData.data || [];
            
            // Map and prepare the popular items
            const items = meals.map(meal => {
                // Find the restaurant for this meal
                const restaurant = restaurants.find(r => r._id === meal.restaurant || r.id === meal.restaurant);
                
                return {
                    id: meal._id || meal.id,
                    image: meal.image || '/hero1.png',
                    name: meal.name,
                    restaurant: restaurant?.name || 'Restaurant',
                    price: meal.price ? meal.price.toFixed(2) : '0.00',
                    rating: meal.rating || 4.5 // Default rating if not available
                };
            });
            
            // Sort by some criteria like rating or add a "popular" flag in your backend
            const sortedItems = items.sort((a, b) => b.rating - a.rating);
            
            // Take top 5 or however many you want to display
            setPopularItems(sortedItems.slice(0, 5));
        }
    }, [mealsData, restaurantsData]);

    // Determine how many items to show based on container width
    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        
        return () => {
            window.removeEventListener('resize', updateItemsPerPage);
        };
    }, []);

    const handleNext = () => {
        if (currentIndex < popularItems.length - itemsPerPage) {
            setCurrentIndex(currentIndex + 1);
            scrollToItem(currentIndex + 1);
        } else {
            // Optional: loop back to the beginning
            setCurrentIndex(0);
            scrollToItem(0);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            scrollToItem(currentIndex - 1);
        } else {
            // Optional: loop to the end
            setCurrentIndex(popularItems.length - itemsPerPage);
            scrollToItem(popularItems.length - itemsPerPage);
        }
    };

    const scrollToItem = (index) => {
        if (sliderRef.current) {
            const itemWidth = sliderRef.current.children[0]?.offsetWidth || 0;
            const margin = 16; // Equivalent to space-x-4 (1rem = 16px)
            sliderRef.current.scrollTo({
                left: index * (itemWidth + margin),
                behavior: 'smooth'
            });
        }
    };

    // Loading state
    if (isMealsLoading || isRestaurantsLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    // Handle case with no items
    if (popularItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <h1 className="text-4xl font-bold text-center mb-6">Popular Items</h1>
                <p className="text-gray-500">No items available at the moment</p>
            </div>
        );
    }

    return (
        <motion.div 
            className='flex flex-col py-16'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1 
                className="text-4xl font-bold text-center mb-20"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                Popular items
            </motion.h1>
            
            <div ref={containerRef} className="flex relative overflow-hidden justify-center">
                {/* Navigation Arrows - Only show if there are more items than what fits on screen */}
                {popularItems.length > itemsPerPage && (
                    <>
                        <motion.div 
                            className="absolute top-1/2 transform -translate-y-1/2 left-2 sm:left-10 md:left-20 z-10"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <button 
                                onClick={handlePrev}
                                className="bg-yellow-500 text-white rounded-full p-3 shadow-md hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                aria-label="Previous item"
                            >
                                <IconContext.Provider value={{ size: '1.5rem', color: 'white' }}>
                                    <MdArrowBackIosNew />
                                </IconContext.Provider>
                            </button>
                        </motion.div>
                        <motion.div 
                            className="absolute top-1/2 transform -translate-y-1/2 right-2 sm:right-10 md:right-20 z-10"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <button 
                                onClick={handleNext}
                                className="bg-yellow-500 text-white rounded-full p-3 shadow-md hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                aria-label="Next item"
                            >
                                <IconContext.Provider value={{ size: '1.5rem', color: 'white' }}>
                                    <MdArrowForwardIos />
                                </IconContext.Provider>
                            </button>
                        </motion.div>
                    </>
                )}

                {/* Item Container */}
                <motion.div 
                    ref={sliderRef}
                    className="flex overflow-x-hidden max-w-7xl space-x-4 pb-8 scroll-smooth"
                    layout
                >
                    <AnimatePresence initial={false} mode="wait">
                        {popularItems.map((item) => (
                            <motion.div 
                                key={item.id} 
                                className="w-64 bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ 
                                    opacity: 1, 
                                    scale: 1,
                                    x: 0
                                }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                    y: -5
                                }}
                            >
                                <div className="relative overflow-hidden">
                                    <motion.img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-64 object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <motion.div 
                                        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                    >
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <motion.span 
                                                className="inline-block bg-yellow-500 text-white px-2 py-1 rounded-md text-sm font-medium"
                                                initial={{ y: 20, opacity: 0 }}
                                                whileHover={{ y: 0, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                            >
                                                Popular
                                            </motion.span>
                                        </div>
                                    </motion.div>
                                </div>
                                <motion.div 
                                    className="p-4"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                >
                                    <h2 className="text-xl font-bold">{item.name}</h2>
                                    <div className="flex items-center mt-2">
                                        <IconContext.Provider value={{ size: '1rem', color: 'orange' }}>
                                            <MdLocationOn />
                                        </IconContext.Provider>
                                        <span className="ml-1 text-gray-600">{item.restaurant}</span>
                                    </div>
                                    <div className="mt-2 flex justify-between items-center">
                                        <p className="text-gray-700 font-semibold">${item.price}</p>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star, idx) => (
                                                <motion.svg 
                                                    key={star} 
                                                    className="w-4 h-4 text-yellow-500 fill-current" 
                                                    viewBox="0 0 24 24"
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.2 }}
                                                >
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                </motion.svg>
                                            ))}
                                        </div>
                                    </div>
                                    <motion.button 
                                        className="mt-4 w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        Order Now
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
            
            {/* Dots indicator */}
            <div className="flex justify-center space-x-2 mt-6">
                {Array.from({ length: Math.ceil(popularItems.length - itemsPerPage + 1) }).map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => {
                            setCurrentIndex(index);
                            scrollToItem(index);
                        }}
                        className={`w-3 h-3 rounded-full focus:outline-none transition-colors duration-200 ${
                            currentIndex === index ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0,
                            scale: currentIndex === index ? 1.2 : 1
                        }}
                        transition={{ 
                            delay: index * 0.05, 
                            duration: 0.2,
                            type: "spring",
                            stiffness: 300
                        }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </motion.div>
    )
}
