import React, { useState } from 'react'
import { FaMotorcycle } from 'react-icons/fa'
import { MdLocationOn, MdStorefront } from 'react-icons/md'

export default function hero() {

    const [deliveryType, setDeliveryType] = useState('delivery')

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                    <h1 className="text-5xl font-bold text-gray-800 mb-6">
                        Are you starving?
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Within a few clicks, find meals that are accessible near you
                    </p>

                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <div className="flex gap-4 mb-4">
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-full ${deliveryType === 'delivery'
                                        ? 'bg-orange-400 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                onClick={() => setDeliveryType('delivery')}
                            >
                                <FaMotorcycle />
                                Delivery
                            </button>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-full ${deliveryType === 'pickup'
                                        ? 'bg-orange-400 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                onClick={() => setDeliveryType('pickup')}
                            >
                                <MdStorefront />
                                Pickup
                            </button>
                        </div>

                        <div className="flex">
                            <div className="flex-1">
                                <div className="relative">
                                    <MdLocationOn className="absolute left-3 top-3 text-gray-400 text-xl" />
                                    <input
                                        type="text"
                                        placeholder="Enter Your Address"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-orange-400"
                                    />
                                </div>
                            </div>
                            <button className="bg-orange-400 text-white px-8 py-2 rounded-r-lg hover:bg-orange-600 transition-colors">
                                Find Food
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block">
                    <img
                        src="https://placehold.co/600x600"
                        alt="Delicious Food"
                        className="w-full h-auto rounded-lg shadow-xl"
                    />
                </div>
            </div>
        </main>
    );
}
