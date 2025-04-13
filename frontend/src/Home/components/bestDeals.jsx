import React, { useState, useEffect } from 'react'
import { MdDeliveryDining, MdLocalOffer } from 'react-icons/md';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGetAllMealsQuery } from '../../Redux/slices/mealSlice';

export default function BestDeals() {
    const [featuredDeal, setFeaturedDeal] = useState(null);
    const { data: mealsData, isLoading } = useGetAllMealsQuery();
    
    useEffect(() => {
        if (mealsData) {
            // Look for deals - assume meals with discount or with sandwich category
            const sandwiches = mealsData.filter(meal => 
                meal.category?.toLowerCase().includes('sandwich') || 
                meal.name?.toLowerCase().includes('sandwich') ||
                meal.discount // meals with any discount
            );
            
            if (sandwiches.length > 0) {
                // Take a random sandwich or the one with highest discount
                const sortedSandwiches = [...sandwiches].sort((a, b) => {
                    // Sort by discount percentage if available
                    const discountA = a.discount ? parseFloat(a.discount) : 0;
                    const discountB = b.discount ? parseFloat(b.discount) : 0;
                    return discountB - discountA;
                });
                setFeaturedDeal(sortedSandwiches[0]);
            }
        }
    }, [mealsData]);

    if (isLoading || !featuredDeal) {
        return null; // Don't render the section if no deals are available
    }

    const discountText = featuredDeal.discount 
        ? `${featuredDeal.discount}% OFF` 
        : "Special Offer";

    return (
        <div className='flex justify-center items-center py-8'>
            <motion.div 
                className="flex flex-col w-full max-w-7xl h-64 md:flex-row items-center justify-between bg-white rounded-lg shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
            >
                <div className="md:w-2/5 p-6 md:p-10">
                    <motion.div 
                        className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full inline-flex items-center mb-3"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <MdLocalOffer className="mr-1" /> {discountText}
                    </motion.div>
                    <motion.h2 
                        className="text-2xl font-bold text-gray-800 mb-4"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        Best Deal on <span className="text-yellow-500">{featuredDeal.name}</span>
                    </motion.h2>
                    <motion.p 
                        className="text-lg text-gray-600 mb-6"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        {featuredDeal.description || `Enjoy our perfectly crafted ${featuredDeal.name} at an unbeatable price. Limited time offer!`}
                    </motion.p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <Link to={`/meals&menus?search=${featuredDeal.name}`}>
                            <button className="bg-yellow-500 text-white px-6 py-3 rounded-full font-medium hover:bg-yellow-600 transition duration-300 flex items-center shadow-md">
                                ORDER NOW <MdDeliveryDining className="ml-2 text-xl" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
                <div className="md:w-3/5 h-full">
                    <motion.img
                        src={featuredDeal.image || "/hero1.png"}
                        alt={featuredDeal.name}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    />
                </div>
            </motion.div>
        </div>
    )
}
