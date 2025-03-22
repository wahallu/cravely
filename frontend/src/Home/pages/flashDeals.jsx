import React from 'react'
import DealItem from '../components/dealItem'

const deals = [
    {
        id: 1,
        image: '/hero1.png',
        discount: '15%',
        title: 'Greys Vage',
    },
    {
        id: 2,
        image: '/hero1.png',
        discount: '10%',
        title: 'Greys Vage',
    },
    {
        id: 3,
        image: '/hero1.png',
        discount: '25%',
        title: 'Greys Vage',
    },
    {
        id: 4,
        image: '/hero1.png',
        discount: '20%',
        title: 'Greys Vage',
    },
];

export default function flashDeals() {
    return (
        <div className='bg-white'>
            <div className="flex flex-wrap justify-around overflow-x-auto space-x-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {deals.map((deal) => (
                    <DealItem key={deal.id} deal={deal} />
                ))}
            </div>
        </div>
    )
}
