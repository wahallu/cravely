import React from 'react'
import { MdLocationOn } from 'react-icons/md'

export default function header() {
    return (
        <nav className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <img
                            src="https://placehold.co/150x40"
                            alt="FoodWagon"
                            className="h-8"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center text-gray-600">
                            <MdLocationOn className="text-orange-400 text-xl" />
                            <span className="ml-2">Current Location:</span>
                            <span className="ml-1 font-semibold">Pittugala Malabe</span>
                        </div>
                        <button className="bg-orange-400 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
