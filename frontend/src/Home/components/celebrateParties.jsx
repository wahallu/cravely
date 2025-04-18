import React, { useState, useEffect } from 'react'
import { MdCelebration, MdOutlineGroups, MdArrowForward } from 'react-icons/md';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGetAllMenusQuery } from '../../Redux/slices/menuSlice';
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice';

export default function CelebrateParties() {
    const [featuredPartyMenu, setFeaturedPartyMenu] = useState(null);
    const [restaurantName, setRestaurantName] = useState("");
    
    const { data: menusData, isLoading: isMenusLoading } = useGetAllMenusQuery();
    const { data: restaurantsData, isLoading: isRestaurantsLoading } = useGetAllRestaurantsQuery();
    
    useEffect(() => {
        if (menusData && restaurantsData?.data) {
            // Look for party-related menus
            const partyMenus = menusData.filter(menu => 
                menu.name?.toLowerCase().includes('party') || 
                menu.name?.toLowerCase().includes('group') || 
                menu.name?.toLowerCase().includes('family') ||
                menu.name?.toLowerCase().includes('celebration') ||
                menu.description?.toLowerCase().includes('party') ||
                menu.description?.toLowerCase().includes('group')
            );
            
            if (partyMenus.length > 0) {
                // Take a random party menu
                const selectedMenu = partyMenus[Math.floor(Math.random() * partyMenus.length)];
                setFeaturedPartyMenu(selectedMenu);
                
                // Find restaurant name
                const restaurant = restaurantsData.data.find(r => r._id === selectedMenu.restaurant || r.id === selectedMenu.restaurant);
                if (restaurant) {
                    setRestaurantName(restaurant.name);
                }
            } else if (menusData.length > 0) {
                // If no party-specific menus, just take a random menu
                const randomMenu = menusData[Math.floor(Math.random() * menusData.length)];
                setFeaturedPartyMenu(randomMenu);
                
                // Find restaurant name
                const restaurant = restaurantsData.data.find(r => r._id === randomMenu.restaurant || r.id === randomMenu.restaurant);
                if (restaurant) {
                    setRestaurantName(restaurant.name);
                }
            }
        }
    }, [menusData, restaurantsData]);

    if (isMenusLoading || isRestaurantsLoading || !featuredPartyMenu) {
        return null; // Don't render the section if no party menu data is available
    }

    return (
        <div className='flex justify-center items-center py-8'>
            <motion.div 
                className="flex flex-col w-full max-w-7xl h-[400px] md:flex-row items-center justify-between bg-white rounded-lg shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
            >
                <div className="md:w-3/5 h-full">
                    <motion.img
                        src={featuredPartyMenu.image || "/hero1.png"}
                        alt={featuredPartyMenu.name}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    />
                </div>
                <div className="md:w-2/5 p-6 md:p-10">
                    <motion.div 
                        className="flex items-center mb-3"
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <MdCelebration className="text-purple-500 text-2xl mr-2" />
                        <span className="text-purple-500 font-semibold">Perfect for Celebrations</span>
                    </motion.div>
                    <motion.h2 
                        className="text-2xl font-bold text-gray-800 mb-2"
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        {featuredPartyMenu.name}
                    </motion.h2>
                    {restaurantName && (
                        <motion.p
                            className="text-sm text-gray-500 mb-3"
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            From {restaurantName}
                        </motion.p>
                    )}
                    <motion.p 
                        className="text-lg text-gray-600 mb-6"
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        {featuredPartyMenu.description || "Perfect for gatherings, celebrations and parties. Serves 4-6 people with a variety of delicious dishes everyone will love."}
                    </motion.p>
                    <motion.div
                        className="flex items-center"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <MdOutlineGroups className="text-gray-500 text-xl mr-2" />
                        <span className="text-gray-500">Perfect for groups of 4-6 people</span>
                    </motion.div>
                    <motion.div
                        className="mt-6"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <Link to={`/restaurant/${featuredPartyMenu.restaurant}`}>
                            <button className="bg-purple-600 text-white px-6 py-3 rounded-full font-medium hover:bg-purple-700 transition duration-300 flex items-center shadow-md">
                                VIEW MENU <MdArrowForward className="ml-2" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
