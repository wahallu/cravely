import React from 'react'
import { MdFastfood } from 'react-icons/md';

export default function bestDeals() {
    return (
        <div className='flex justify-center items-center'>
            <div className="flex flex-col w-full max-w-7xl h-64 md:flex-row items-center justify-between bg-white rounded-lg shadow-xl md:pl-10 mb-8 overflow-hidden">
                <div className="md:w-2/5">
                    <h2 className="text-2xl font-bold text-yellow-500 mb-4">Best deals <span className="text-black">Crispy Sandwiches</span></h2>
                    <p className="text-lg text-gray-600 mb-20">Enjoy the large size of sandwiches. Complete perfect slice of sandwiches.</p>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300">
                        PROCEED TO ORDER <MdFastfood className="inline-block ml-2" />
                    </button>
                </div>
                <div className="md:w-3/5">
                    <img
                        src="/hero1.png"
                        alt="Crispy Sandwich"
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
            </div>
        </div>
    )
}
