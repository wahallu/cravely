import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MdCheckCircle, 
  MdCancel, 
  MdRestaurant,
  MdVisibility,
  MdFilterList,
  MdSearch,
  MdLocationOn,
  MdEmail,
  MdPhone,
  MdCalendarToday
} from 'react-icons/md'
import { 
  useGetAllRestaurantsQuery,
  useUpdateRestaurantStatusMutation 
} from '../../Redux/slices/restaurantSlice'
import toast from 'react-hot-toast'

export default function RestaurantVerification() {
  // State to track pending restaurant registrations
  const [pendingRestaurants, setPendingRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false) // Add state for processing status

  // Fetch restaurants data
  const { 
    data: restaurantsData, 
    isLoading,
    isError,
    refetch
  } = useGetAllRestaurantsQuery()
  
  // Get the mutation hook for updating restaurant status
  const [updateRestaurantStatus] = useUpdateRestaurantStatusMutation()

  // Process data when it's received
  useEffect(() => {
    if (restaurantsData?.data) {
      // Filter restaurants based on status
      const filtered = restaurantsData.data.filter(restaurant => 
        filterStatus === 'all' || restaurant.status === filterStatus
      )
      setPendingRestaurants(filtered)
    }
  }, [restaurantsData, filterStatus])

  // Filter by search query
  const filteredRestaurants = pendingRestaurants.filter(restaurant => 
    restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    restaurant.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle approve restaurant
  const handleApprove = async (id) => {
    try {
      setIsProcessing(true) // Start processing
      
      // Make API call to update restaurant status to 'active'
      await updateRestaurantStatus({
        id,
        status: 'active'
      }).unwrap()
      
      toast.success('Restaurant approved successfully')
      setIsModalOpen(false)
      
      // Refetch data to update the UI
      refetch()
    } catch (error) {
      console.error('Failed to approve restaurant:', error)
      toast.error(error?.data?.error || 'Failed to approve restaurant')
    } finally {
      setIsProcessing(false) // End processing regardless of outcome
    }
  }

  // Handle reject restaurant
  const handleReject = async (id) => {
    try {
      setIsProcessing(true) // Start processing
      
      // Make API call to update restaurant status to 'suspended'
      await updateRestaurantStatus({
        id,
        status: 'suspended'
      }).unwrap()
      
      toast.success('Restaurant rejected')
      setIsModalOpen(false)
      
      // Refetch data to update the UI
      refetch()
    } catch (error) {
      console.error('Failed to reject restaurant:', error)
      toast.error(error?.data?.error || 'Failed to reject restaurant')
    } finally {
      setIsProcessing(false) // End processing regardless of outcome
    }
  }

  // Show restaurant details modal
  const openRestaurantDetails = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load restaurants</p>
          <button 
            onClick={refetch}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Restaurant Verification</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter */}
          <div className="flex items-center gap-2">
            <MdFilterList className="text-gray-500" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent p-2"
            >
              <option value="pending">Pending</option>
              <option value="active">Approved</option>
              <option value="suspended">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-medium text-gray-700">Pending Verification</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">
            {pendingRestaurants.filter(r => r.status === 'pending').length}
          </p>
        </motion.div>
        
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-medium text-gray-700">Approved</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">
            {pendingRestaurants.filter(r => r.status === 'active').length}
          </p>
        </motion.div>
        
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-medium text-gray-700">Rejected</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">
            {pendingRestaurants.filter(r => r.status === 'suspended').length}
          </p>
        </motion.div>
      </div>

      {/* Restaurant List */}
      <motion.div
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Restaurant Applications</h2>
        </div>
        
        <div className="overflow-x-auto">
          {filteredRestaurants.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          <img src={restaurant.logo || "/hero1.png"} alt={restaurant.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">{restaurant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{restaurant.cuisineType || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{restaurant.city || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {restaurant.status === 'pending' && (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                      {restaurant.status === 'active' && (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
                      )}
                      {restaurant.status === 'suspended' && (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => openRestaurantDetails(restaurant)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                          disabled={isProcessing}
                        >
                          <MdVisibility className="text-xl" />
                        </button>
                        
                        {restaurant.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(restaurant._id)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Approve"
                              disabled={isProcessing}
                            >
                              <MdCheckCircle className="text-xl" />
                            </button>
                            
                            <button
                              onClick={() => handleReject(restaurant._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Reject"
                              disabled={isProcessing}
                            >
                              <MdCancel className="text-xl" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <MdRestaurant className="text-gray-300 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No restaurants found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Restaurant Details Modal */}
      {isModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                {selectedRestaurant.name}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MdCancel className="text-2xl" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="w-full sm:w-1/3">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    <img 
                      src={selectedRestaurant.logo || "/hero1.png"} 
                      alt={selectedRestaurant.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    {selectedRestaurant.status === 'pending' && (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                    )}
                    {selectedRestaurant.status === 'active' && (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
                    )}
                    {selectedRestaurant.status === 'suspended' && (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cuisine</h3>
                    <p className="mt-1">{selectedRestaurant.cuisineType || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                    <div className="flex items-center mt-1">
                      <MdCalendarToday className="text-gray-400 mr-2" />
                      <span>{selectedRestaurant.createdAt ? new Date(selectedRestaurant.createdAt).toLocaleDateString() : "Unknown"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 border-b pb-2">Contact Information</h3>
                  
                  <div className="flex items-start">
                    <MdEmail className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                      <p className="mt-1">{selectedRestaurant.email || "Not available"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MdPhone className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                      <p className="mt-1">{selectedRestaurant.phone || "Not available"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MdLocationOn className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p className="mt-1">{selectedRestaurant.address || "Not available"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 border-b pb-2">Restaurant Details</h3>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="mt-1 text-gray-700">{selectedRestaurant.description || "No description provided."}</p>
                  </div>
                </div>
              </div>
              
              {selectedRestaurant.status === 'pending' && (
                <div className="mt-8 flex justify-end space-x-3">
                  <button 
                    onClick={() => handleReject(selectedRestaurant._id)}
                    className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedRestaurant._id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}