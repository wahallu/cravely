import React, { useState } from 'react'
import { motion } from 'motion/react'

export default function dealItem({ deal }) {
    const [isHovered, setIsHovered] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0, x: 100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.2 * deal.id, // Add a staggered animation effect
                duration: 0.5,
                type: 'spring',
                stiffness: 100,
            }
        },
        hover: {
            y: -10,
            boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const imageVariants = {
        hover: {
            scale: 1.1,
            transition: { duration: 0.4 }
        }
    };

    const buttonVariants = {
        initial: {
            backgroundColor: "#EAB308" // yellow-500
        },
        hover: {
            backgroundColor: "#CA8A04", // yellow-600
            scale: 1.05,
            transition: {
                duration: 0.2,
                yoyo: Infinity,
                yoyoEase: "easeOut",
                repeatDelay: 0.8
            }
        }
    };

    const badgeVariants = {
        initial: {
            scale: 0,
            rotate: -45
        },
        animate: {
            scale: 1,
            rotate: 0,
            transition: {
                delay: 0.3 * deal.id,
                type: "spring",
                stiffness: 200,
                damping: 10
            }
        },
        hover: {
            scale: 1.2,
            backgroundColor: "#F59E0B", // amber-500
            transition: {
                duration: 0.2,
                ease: "backOut"
            }
        }
    };

    // Extract discount percentage to animate it
    const discountValue = parseInt(deal.discount);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="w-64 bg-white rounded-lg shadow-lg overflow-hidden relative cursor-pointer"
        >
            <div className="overflow-hidden">
                <motion.img
                    variants={imageVariants}
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-64 object-cover"
                />
            </div>

            <motion.div
                className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full font-bold shadow-md z-10"
                variants={badgeVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
            >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        transition: { delay: 0.5 * deal.id, duration: 0.3 }
                    }}
                >
                    {deal.discount}
                </motion.span>
            </motion.div>

            <div className="p-4">
                <motion.h2
                    className="text-xl font-bold mt-2 text-gray-800"
                    animate={isHovered ? { color: "#F59E0B" } : { color: "#1F2937" }}
                    transition={{ duration: 0.3 }}
                >
                    {deal.title}
                </motion.h2>

                <motion.div
                    className="flex items-center mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 * deal.id, duration: 0.5 }}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.svg
                            key={star}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                transition: {
                                    delay: 0.4 * deal.id + (star * 0.1),
                                    duration: 0.3
                                }
                            }}
                            className="w-4 h-4 text-yellow-500 fill-current"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </motion.svg>
                    ))}
                </motion.div>

                <motion.p
                    className="text-sm text-gray-600 mt-2 line-clamp-2 h-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 0.5 * deal.id, duration: 0.4 }
                    }}
                >
                    Enjoy special discounts on our most popular items for a limited time!
                </motion.p>

                <motion.div
                    className="mt-4 flex justify-between items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 * deal.id, duration: 0.5 }}
                >
                    <div className="flex items-end">
                        <motion.span
                            className="text-lg font-bold text-gray-900"
                            animate={isHovered ? {
                                color: "#059669",  // emerald-600 
                                transition: { duration: 0.3 }
                            } : {}}
                        >
                            ${(19.99 * (100 - discountValue) / 100).toFixed(2)}
                        </motion.span>
                        <motion.span
                            className="text-sm text-gray-500 line-through ml-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            transition={{ delay: 0.7 * deal.id }}
                        >
                            $19.99
                        </motion.span>
                    </div>
                </motion.div>

                <motion.button
                    className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-medium shadow-md"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                >
                    View Deal
                </motion.button>
            </div>
        </motion.div>
    )
}
