import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MdSearch, 
  MdFilterList, 
  MdAdd, 
  MdMoreVert, 
  MdStar, 
  MdDelete, 
  MdEdit, 
  MdCheckCircle, 
  MdCancel,
  MdRestaurant,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdVisibility
} from 'react-icons/md'
import { useGetAllRestaurantsQuery } from '../../Redux/slices/restaurantSlice'

export default function Restaurant() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    cuisine: 'all',
    rating: 0
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch restaurants using RTK Query
  const { 
    data: restaurantsData, 
    isLoading, 
    isError 
  } = useGetAllRestaurantsQuery();

  // Get restaurants array from response
  const restaurants = restaurantsData?.data || [];

  // Filter restaurants based on search query and filters
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search query filter
    if (searchQuery && !restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && restaurant.status !== filters.status) {
      return false;
    }
    
    // Cuisine filter
    if (filters.cuisine !== 'all' && restaurant.cuisine !== filters.cuisine) {
      return false;
    }
    
    // Rating filter
    if (filters.rating > 0 && restaurant.rating < filters.rating) {
      return false;
    }
    
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
      case 'pending':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'suspended':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Suspended</span>;
      default:
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Get unique cuisines for filter
  const cuisines = ['all', ...new Set(restaurants.filter(r => r.cuisine).map(r => r.cuisine))];

  const openRestaurantDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailsOpen(true);
  };

  // Show error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load restaurants</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Restaurant Management</h1>
        
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
          
          {/* Filter Button */}
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
          >
            <MdFilterList /> 
            <span>Filters</span>
          </button>
          
          {/* Add Restaurant Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <MdAdd />
            <span>Add Restaurant</span>
          </motion.button>
        </div>
      </div>
      
      {/* Filters */}
      {filterOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                {cuisines.map((cuisine, index) => (
                  <option key={index} value={cuisine}>
                    {cuisine === 'all' ? 'All Cuisines' : cuisine}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Restaurants Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant._id || restaurant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          <img src={restaurant.logo || "/hero1.png"} alt={restaurant.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {restaurant.name}
                            {restaurant.verified && (
                              <MdCheckCircle className="ml-1 text-green-500 text-base" title="Verified" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{restaurant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{restaurant.cuisine}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MdStar className="text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{restaurant.rating || "N/A"}</span>
                        <span className="text-xs text-gray-500 ml-1">({restaurant.reviews || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(restaurant.status || "unknown")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{restaurant.orders || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${((restaurant.orders || 0) * 10).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openRestaurantDetails(restaurant)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <MdVisibility className="text-xl" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900 transition-colors"
                          title="Edit Restaurant"
                        >
                          <MdEdit className="text-xl" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Restaurant"
                        >
                          <MdDelete className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <MdRestaurant className="text-gray-300 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No restaurants found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Details Modal */}
      {detailsOpen && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                {selectedRestaurant.name}
                {selectedRestaurant.verified && (
                  <MdCheckCircle className="ml-2 text-green-500" />
                )}
              </h2>
              <button 
                onClick={() => setDetailsOpen(false)}
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
                    {getStatusBadge(selectedRestaurant.status || "unknown")}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cuisine</h3>
                    <p className="mt-1">{selectedRestaurant.cuisine || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                    <div className="mt-1 flex items-center">
                      <MdStar className="text-yellow-400 mr-1" />
                      <span>{selectedRestaurant.rating || "N/A"}</span>
                      <span className="text-sm text-gray-500 ml-1">({selectedRestaurant.reviews || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                    <p className="mt-1">{selectedRestaurant.createdAt ? new Date(selectedRestaurant.createdAt).toLocaleDateString() : "Unknown"}</p>
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
                  <h3 className="font-medium text-gray-800 border-b pb-2">Performance</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500">Total Orders</h4>
                      <p className="text-xl font-bold mt-1">{selectedRestaurant.orders || 0}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500">Total Revenue</h4>
                      <p className="text-xl font-bold mt-1">${((selectedRestaurant.orders || 0) * 10).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                {selectedRestaurant.status === 'pending' && (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Approve
                  </button>
                )}
                {selectedRestaurant.status === 'suspended' && (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Reactivate
                  </button>
                )}
                {selectedRestaurant.status === 'active' && (
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                    Suspend
                  </button>
                )}
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
