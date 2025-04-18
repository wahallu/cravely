import React from 'react';
import { motion } from 'framer-motion';
import { IconContext } from 'react-icons';
import { MdLocationOn, MdOutlineFastfood } from 'react-icons/md';
import { BsFillCartFill } from 'react-icons/bs';
import { AiOutlineCreditCard } from 'react-icons/ai';

const steps = [
    {
        id: 1,
        icon: 'MdLocationOn',
        title: 'Select location',
        description: 'Choose the location where your food will be delivered.',
    },
    {
        id: 2,
        icon: 'BsFillCartFill',
        title: 'Choose order',
        description: 'Check over hundreds of menus to pick your favorite food.',
    },
    {
        id: 3,
        icon: 'AiOutlineCreditCard',
        title: 'Pay advanced',
        description: "It's quick, safe, and simple. Select several methods of payment.",
    },
    {
        id: 4,
        icon: 'MdOutlineFastfood',
        title: 'Enjoy meals',
        description: 'Food is made and delivered directly to your home.',
    },
];

export default function HowItWorks() {

    const iconMap = {
        MdLocationOn,
        BsFillCartFill,
        AiOutlineCreditCard,
        MdOutlineFastfood,
    };

    const iconContainerVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };


    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.2, // Staggered animation for each step
                duration: 0.5,
            },
        },
    };

    return (
        <div className='flex items-center justify-center bg-gradient-to-b from-amber-50 to-white'>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col max-w-7xl items-center justify-center text-center mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
            >
                <h2 className="text-3xl font-bold text-orange-500 mb-20">How does it work</h2>
                <div className="flex space-x-8 overflow-x-auto">
                    {steps.map((step) => (
                        <motion.div
                            key={step.id}
                            variants={iconContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex flex-col items-center space-y-2"
                        >
                            <IconContext.Provider value={{ size: '3rem', color: 'white' }}>
                                <div className="bg-yellow-500 rounded-full p-4 shadow-lg">
                                    {React.createElement(iconMap[step.icon])}
                                </div>
                            </IconContext.Provider>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <p className="text-gray-600 text-sm">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};