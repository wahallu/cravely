import React, { useState, useEffect } from 'react'
import DealItem from '../components/dealItem'
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice'

export default function FlashDeals() {
    const { data: restaurantsData, isLoading } = useGetAllRestaurantsQuery();
    const [flashDeals, setFlashDeals] = useState([]);
    
    useEffect(() => {
        if (restaurantsData?.data) {
            // Get 4 random restaurants and create flash deals from them
            const restaurants = [...restaurantsData.data];
            const randomRestaurants = restaurants
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);
                
            const deals = randomRestaurants.map((restaurant, index) => ({
                id: restaurant._id || restaurant.id || index,
                image: '/hero1.png',
                discount: `${Math.floor(Math.random() * 25) + 10}%`, // Random discount between 10-35%
                title: restaurant.name || 'Restaurant Special',
                cuisineType: restaurant.cuisineType || 'Various Cuisine',
                restaurantId: restaurant._id || restaurant.id
            }));
            
            setFlashDeals(deals);
        }
    }, [restaurantsData]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className='bg-white'>
            <div className="flex flex-wrap justify-around overflow-x-auto space-x-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {flashDeals.map((deal) => (
                    <DealItem key={deal.id} deal={deal} />
                ))}
            </div>
        </div>
    )
}
