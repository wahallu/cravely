import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  MdArrowBack,
  MdLocalOffer,
  MdRestaurant,
  MdOutlineContentCopy,
  MdOutlineCheck,
  MdStar,
  MdArrowForward
} from 'react-icons/md'
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice'

export default function Offers() {
  const [activeTab, setActiveTab] = useState('current')
  const [copiedCode, setCopiedCode] = useState(null)
  const [restaurantOffers, setRestaurantOffers] = useState([])
  const [featuredOffers, setFeaturedOffers] = useState([])
  const { data: restaurantsData, isLoading } = useGetAllRestaurantsQuery()

  // Generate offers based on restaurant data
  useEffect(() => {
    if (restaurantsData?.data) {
      const restaurants = restaurantsData.data || []
      
      // Create restaurant-specific offers
      const restOffers = restaurants.slice(0, 6).map((restaurant, index) => ({
        id: `rest-${restaurant._id || restaurant.id || index}`,
        title: `${Math.floor(Math.random() * 20) + 10}% OFF`,
        description: `at ${restaurant.name}`,
        code: `${restaurant.name.replace(/\s/g, '').toUpperCase().slice(0, 6)}${Math.floor(Math.random() * 100)}`,
        expiry: `Valid until ${new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        minOrderValue: Math.floor(Math.random() * 10) * 5 + 10,
        restaurant: restaurant,
        color: index % 2 === 0 
          ? 'bg-gradient-to-r from-orange-400 to-orange-600' 
          : 'bg-gradient-to-r from-blue-400 to-blue-600',
        isNew: index < 2
      }))
      
      setRestaurantOffers(restOffers)
      
      // Create featured offers
      const featured = [
        {
          id: 'featured-1',
          title: '50% OFF',
          description: 'On your first order',
          code: 'WELCOME50',
          expiry: `Valid until ${new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          minOrderValue: 15,
          color: 'bg-gradient-to-r from-orange-400 to-orange-600',
          isNew: true
        },
        {
          id: 'featured-2',
          title: 'FREE DELIVERY',
          description: 'On orders above $25',
          code: 'FREEDEL',
          expiry: `Valid until ${new Date(Date.now() + (45 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          minOrderValue: 25,
          color: 'bg-gradient-to-r from-blue-400 to-blue-600',
          isNew: false
        },
        {
          id: 'featured-3',
          title: '30% OFF',
          description: 'Weekend special',
          code: 'WEEKEND30',
          expiry: `Valid until ${new Date(Date.now() + (15 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          minOrderValue: 30,
          color: 'bg-gradient-to-r from-purple-400 to-purple-600',
          isNew: true
        }
      ]
      
      setFeaturedOffers(featured)
    }
  }, [restaurantsData])

  // Handle copy to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Render an offer card
  const renderOfferCard = (offer, showRestaurant = false) => (
    <motion.div 
      key={offer.id}
      className={`${offer.color} rounded-xl overflow-hidden shadow-sm`}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ duration: 0.2 }}
    >
      {offer.isNew && (
        <div className="bg-white text-orange-500 text-xs font-bold px-3 py-1 rounded-br-lg absolute top-0 left-0">
          NEW
        </div>
      )}
      <div className="p-6 text-white">
        <h3 className="text-2xl font-bold">{offer.title}</h3>
        <p className="mt-1 opacity-90">{offer.description}</p>
        <p className="mt-2 text-sm opacity-80">Min. order: ${offer.minOrderValue}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="bg-white/20 rounded-lg p-2 flex items-center">
            <span className="font-mono font-bold mr-2">{offer.code}</span>
            <button 
              onClick={() => handleCopyCode(offer.code)}
              className="bg-white/30 hover:bg-white/40 rounded-full p-1 transition-colors"
            >
              {copiedCode === offer.code ? <MdOutlineCheck /> : <MdOutlineContentCopy />}
            </button>
          </div>
          
          {showRestaurant && offer.restaurant && (
            <Link 
              to={`/restaurant/${offer.restaurant._id || offer.restaurant.id}`}
              className="bg-white/30 hover:bg-white/40 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              View Restaurant <MdArrowForward className="ml-1" />
            </Link>
          )}
        </div>
        
        <p className="mt-3 text-sm opacity-80">{offer.expiry}</p>
      </div>
      
      {showRestaurant && offer.restaurant && (
        <div className="bg-white p-4 flex items-center">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 mr-3">
            <img 
              src={offer.restaurant.image || '/hero1.png'} 
              alt={offer.restaurant.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{offer.restaurant.name}</h4>
            <div className="flex items-center mt-1">
              <MdStar className="text-yellow-400 mr-1" />
              <span className="text-sm text-gray-600">{offer.restaurant.rating || '4.5'}</span>
              <span className="mx-1 text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {offer.restaurant.cuisineType || 'Various Cuisine'}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to="/user" className="mr-4">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <MdArrowBack className="text-gray-600" />
          </motion.div>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <MdLocalOffer className="text-orange-500 mr-2" /> 
          Special Offers & Discounts
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button 
          className={`pb-3 px-4 font-medium flex items-center ${
            activeTab === 'current' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('current')}
        >
          Current Offers
        </button>
        <button 
          className={`pb-3 px-4 font-medium flex items-center ${
            activeTab === 'restaurant' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('restaurant')}
        >
          <MdRestaurant className="mr-2" /> Restaurant Offers
        </button>
      </div>

      {/* Current Offers Tab Content */}
      {activeTab === 'current' && (
        <div className="space-y-8">
          {/* Featured Offers */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Featured Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredOffers.map(offer => renderOfferCard(offer))}
            </div>
          </div>
          
          {/* Recently Added */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Added</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurantOffers
                .filter(offer => offer.isNew)
                .map(offer => renderOfferCard(offer, true))
              }
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Offers Tab Content */}
      {activeTab === 'restaurant' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurantOffers.map(offer => renderOfferCard(offer, true))}
          </div>
        </div>
      )}
      
      {/* Terms and conditions */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Terms & Conditions</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Offers cannot be combined with any other promotions or discounts</li>
          <li>• Minimum order value applies before taxes and delivery fees</li>
          <li>• Valid for orders placed through Cravely app or website</li>
          <li>• Offers are subject to change or cancellation at any time</li>
          <li>• Restaurant specific offers can only be used at the designated restaurants</li>
        </ul>
      </div>
    </div>
  )
}
