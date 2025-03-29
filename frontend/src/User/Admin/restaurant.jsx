import React, { useState, useEffect } from 'react'
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

export default function Restaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    cuisine: 'all',
    rating: 0
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Mock data loading
  useEffect(() => {
    const fetchData = () => {
      // Simulating API call
      setTimeout(() => {
        setRestaurants([
          {
            id: 1,
            name: "Burger Arena",
            logo: "/hero1.png",
            cuisine: "American",
            email: "contact@burgerarena.com",
            phone: "+1 (555) 123-4567",
            address: "123 Main St, Downtown",
            rating: 4.8,
            reviews: 243,
            status: "active",
            since: "2022-01-15",
            orders: 1245,
            revenue: "$12,450",
            verified: true
          },
          {
            id: 2,
            name: "Pizza Palace",
            logo: "/hero1.png",
            cuisine: "Italian",
            email: "info@pizzapalace.com",
            phone: "+1 (555) 987-6543",
            address: "456 Oak St, Midtown",
            rating: 4.5,
            reviews: 187,
            status: "active",
            since: "2022-03-10",
            orders: 1048,
            revenue: "$10,480",
            verified: true
          },
          {
            id: 3,
            name: "Sushi Sensation",
            logo: "/hero1.png",
            cuisine: "Japanese",
            email: "hello@sushisensation.com",
            phone: "+1 (555) 876-5432",
            address: "789 Elm St, Uptown",
            rating: 4.7,
            reviews: 156,
            status: "pending",
            since: "2022-05-20",
            orders: 965,
            revenue: "$9,650",
            verified: false
          },
          {
            id: 4,
            name: "Taco Fiesta",
            logo: "/hero1.png",
            cuisine: "Mexican",
            email: "hola@tacofiesta.com",
            phone: "+1 (555) 234-5678",
            address: "101 Pine Rd, Westside",
            rating: 4.3,
            reviews: 112,
            status: "suspended",
            since: "2022-04-05",
            orders: 754,
            revenue: "$7,540",
            verified: true
          },
          {
            id: 5,
            name: "Curry House",
            logo: "/hero1.png",
            cuisine: "Indian",
            email: "namaste@curryhouse.com",
            phone: "+1 (555) 345-6789",
            address: "202 Cedar Ave, Eastside",
            rating: 4.6,
            reviews: 178,
            status: "active",
            since: "2022-02-18",
            orders: 892,
            revenue: "$8,920",
            verified: true
          }
        ]);
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, []);

  // Filter restaurants based on search query and filters
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search query filter
    if (searchQuery && !restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) {
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
  const cuisines = ['all', ...new Set(restaurants.map(r => r.cuisine))];

  const openRestaurantDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailsOpen(true);
  };

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
          {loading ? (
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
                  <tr key={restaurant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          <img src={restaurant.logo} alt={restaurant.name} className="h-full w-full object-cover" />
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
                        <span className="text-sm text-gray-900">{restaurant.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({restaurant.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(restaurant.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{restaurant.orders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{restaurant.revenue}</td>
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
                      src={selectedRestaurant.logo} 
                      alt={selectedRestaurant.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    {getStatusBadge(selectedRestaurant.status)}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cuisine</h3>
                    <p className="mt-1">{selectedRestaurant.cuisine}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                    <div className="mt-1 flex items-center">
                      <MdStar className="text-yellow-400 mr-1" />
                      <span>{selectedRestaurant.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({selectedRestaurant.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                    <p className="mt-1">{new Date(selectedRestaurant.since).toLocaleDateString()}</p>
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
                      <p className="mt-1">{selectedRestaurant.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MdPhone className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                      <p className="mt-1">{selectedRestaurant.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MdLocationOn className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p className="mt-1">{selectedRestaurant.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 border-b pb-2">Performance</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500">Total Orders</h4>
                      <p className="text-xl font-bold mt-1">{selectedRestaurant.orders}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500">Total Revenue</h4>
                      <p className="text-xl font-bold mt-1">{selectedRestaurant.revenue}</p>
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
