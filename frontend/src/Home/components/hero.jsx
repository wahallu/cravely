import React, { useState } from 'react'
import { FaMotorcycle, FaUtensils, FaSearch } from 'react-icons/fa'
import { MdLocationOn, MdStorefront, MdFastfood, MdDeliveryDining } from 'react-icons/md'

export default function Hero() {
  const [deliveryType, setDeliveryType] = useState('delivery')
  const [address, setAddress] = useState('')

  // Popular food categories for the floating badges
  const foodCategories = [
    { name: 'Pizza', icon: <MdFastfood /> },
    { name: 'Burgers', icon: <FaUtensils /> },
    { name: 'Sushi', icon: <FaUtensils /> },
    { name: 'Desserts', icon: <FaUtensils /> }
  ]

  return (
    <main className="relative overflow-hidden">
      {/* Background pattern image */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url(${'/herobg.png'})`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      ></div>

      {/* Background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Floating food badges */}
      <div className="hidden lg:block">
        {foodCategories.map((category, index) => (
          <div
            key={index}
            className={`absolute rounded-full bg-white shadow-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 animate-float animation-delay-${index * 1000} z-10`}
            style={{
              top: `${20 + (index * 15)}%`,
              right: `${5 + (index % 2) * 10}%`,
              animationDelay: `${index * 0.5}s`
            }}
          >
            <span className="text-orange-500">{category.icon}</span>
            {category.name}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content section */}
          <div className="relative z-10">
            <div className="inline-block px-4 py-1 bg-orange-100 rounded-full text-orange-500 font-medium text-sm mb-6 animate-fadeIn">
              <span className="flex items-center gap-2">
                <MdDeliveryDining className="text-lg" />
                #1 Food Delivery App
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Are you <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">starving</span>?
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-xl">
              Within a few clicks, find meals that are accessible near you and enjoy the most delicious food delivered to your doorstep.
            </p>

            {/* Search box with enhanced styling */}
            <div className="bg-white p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 border border-gray-100">
              <div className="flex gap-4 mb-6">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${deliveryType === 'delivery'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  onClick={() => setDeliveryType('delivery')}
                >
                  <FaMotorcycle className={deliveryType === 'delivery' ? 'animate-bounce' : ''} />
                  <span className="font-medium">Delivery</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${deliveryType === 'pickup'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  onClick={() => setDeliveryType('pickup')}
                >
                  <MdStorefront className={deliveryType === 'pickup' ? 'animate-bounce' : ''} />
                  <span className="font-medium">Pickup</span>
                </button>
              </div>

              <div className="relative">
                <div className="flex overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-orange-400">
                  <div className="flex-1">
                    <div className="relative">
                      <MdLocationOn className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 text-xl" />
                      <input
                        type="text"
                        placeholder={deliveryType === 'delivery' ? "Enter your delivery address" : "Enter pickup location"}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-0 focus:outline-none focus:ring-0 text-gray-700"
                      />
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-8 py-4 focus:outline-none hover:from-orange-500 hover:to-orange-600 transition-all duration-300 flex items-center gap-2 font-medium">
                    <FaSearch className="text-sm" />
                    <span>Find Food</span>
                  </button>
                </div>

                {/* Popular locations suggestion */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Popular:</span>
                  {['Pittugala Malabe', 'Colombo 07', 'Kandy City'].map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => setAddress(loc)}
                      className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 text-center">
              {[
                { number: '10k+', label: 'Restaurants' },
                { number: '2M+', label: 'Customers' },
                { number: '99.5%', label: 'Satisfaction' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-lg p-4 shadow-sm">
                  <p className="text-2xl font-bold text-orange-500">{stat.number}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image section with enhanced styling */}
          <div className="hidden lg:block relative">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>

            <div className="relative animate-float">
              <div className="absolute inset-0 rounded-2xl rotate-3 bg-gradient-to-r from-orange-400 to-orange-500 shadow-xl transform -translate-y-2 translate-x-2"></div>
              <img
                src="/hero1.png"
                alt="Delicious Food"
                className="relative rounded-2xl shadow-2xl w-full h-auto transform transition-transform duration-500 hover:scale-105 hover:rotate-2 z-10"
              />

              {/* Order now floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 animate-bounce z-20">
                <span className="text-orange-500 text-lg">
                  <MdFastfood />
                </span>
                <span className="font-bold text-gray-800">Order Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
