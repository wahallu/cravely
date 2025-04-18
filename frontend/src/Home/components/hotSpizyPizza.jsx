import React, { useState, useEffect } from 'react'
import { MdLocalPizza, MdOutlineLocalFireDepartment } from 'react-icons/md';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGetAllMealsQuery } from '../../Redux/slices/mealSlice';

export default function HotSpizyPizza() {
    const [featuredPizza, setFeaturedPizza] = useState(null);
    const { data: mealsData, isLoading } = useGetAllMealsQuery();
    
    useEffect(() => {
        if (mealsData) {
            // Find a pizza meal to feature
            const pizzas = mealsData.filter(meal => 
                meal.category?.toLowerCase().includes('pizza') || 
                meal.name?.toLowerCase().includes('pizza')
            );
            
            if (pizzas.length > 0) {
                // Take a random pizza or the one with highest rating
                const sortedPizzas = [...pizzas].sort((a, b) => (b.rating || 0) - (a.rating || 0));
                setFeaturedPizza(sortedPizzas[0]);
            }
        }
    }, [mealsData]);

    if (isLoading || !featuredPizza) {
        return null; // Don't render the section if no pizza data is available
    }

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
                    <motion.h2 
                        className="text-2xl font-bold mb-4 flex items-center"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <MdOutlineLocalFireDepartment className="text-red-500 mr-2 text-3xl" /> 
                        Hot & Spicy <span className="text-orange-500 ml-2">{featuredPizza.name}</span>
                    </motion.h2>
                    <motion.p 
                        className="text-lg text-gray-600 mb-6"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        {featuredPizza.description || `Enjoy the mouthwatering flavor of our ${featuredPizza.name}. Made with premium ingredients for the perfect slice every time.`}
                    </motion.p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <Link to="/meals&menus">
                            <button className="bg-red-500 text-white px-6 py-3 rounded-full font-medium hover:bg-red-600 transition duration-300 flex items-center shadow-md">
                                ORDER NOW <MdLocalPizza className="ml-2 text-xl" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
                <div className="md:w-3/5 h-full">
                    <motion.img
                        src={featuredPizza.image || "/hero1.png"}
                        alt={featuredPizza.name}
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
