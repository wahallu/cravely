import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdSearch, MdFilterList, MdAdd, MdDelete, MdEdit, MdCancel, MdDeliveryDining, MdVisibility, MdDirectionsBike, MdDirectionsCar, MdLocalShipping } from 'react-icons/md';
import {
  useGetAllDriversQuery,
  useAddDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation
} from '../../Redux/slices/driverSlice';
import DriverFormModal from './driverFormModal';

export default function Drivers() {
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    vehicleType: 'all',
    rating: 0
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Form states
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [editDriverOpen, setEditDriverOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    driverId: '',
    name: '',
    status: 'Available',
    phone: '',
    licenseNumber: '',
    vehicleType: '',
  });

  // RTK Query hooks
  const {
    data: drivers = [],
    isLoading,
    isError,
    error: fetchError,
    refetch
  } = useGetAllDriversQuery();

  const [addDriver, { isLoading: isAddingDriver }] = useAddDriverMutation();
  const [updateDriver, { isLoading: isUpdatingDriver }] = useUpdateDriverMutation();
  const [deleteDriver, { isLoading: isDeletingDriver }] = useDeleteDriverMutation();

  // Filter drivers based on search query and filters
  const filteredDrivers = drivers.filter(driver => {
    // Search query filter
    if (searchQuery && !driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !driver.driverId?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && driver.status !== filters.status) {
      return false;
    }

    // Vehicle type filter
    if (filters.vehicleType !== 'all' && driver.vehicleType !== filters.vehicleType) {
      return false;
    }

    return true;
  });

  // Get unique vehicle types for filter
  const vehicleTypes = ['all', ...new Set(drivers.filter(d => d.vehicleType).map(d => d.vehicleType))];

  // Status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Available</span>;
      case 'On Delivery':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">On Delivery</span>;
      case 'Unavailable':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Unavailable</span>;
      default:
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Vehicle icon component
  const getVehicleIcon = (vehicleType) => {
    if (!vehicleType) return <MdLocalShipping className="text-gray-500" />;

    switch (vehicleType.toLowerCase()) {
      case 'motorcycle':
        return <MdDirectionsBike className="text-orange-500" />;
      case 'car':
        return <MdDirectionsCar className="text-blue-500" />;
      case 'bicycle':
        return <MdDirectionsBike className="text-green-500" />;
      default:
        return <MdLocalShipping className="text-gray-500" />;
    }
  };

  // Handle opening driver details
  const openDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setDetailsOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      driverId: '',
      name: '',
      status: 'Available',
      phone: '',
      licenseNumber: '',
      vehicleType: '',
    });
  };

  // Open add driver form
  const openAddDriverForm = () => {
    resetFormData();
    setAddDriverOpen(true);
  };

  // Open edit driver form
  const openEditDriverForm = (driver) => {
    setFormData({
      driverId: driver.driverId,
      name: driver.name || '',
      status: driver.status || 'Available',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      vehicleType: driver.vehicleType || '',
    });
    setSelectedDriver(driver);
    setEditDriverOpen(true);
  };

  // Handle add driver submission
  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      await addDriver(formData).unwrap();
      setAddDriverOpen(false);
      resetFormData();
    } catch (error) {
      console.error('Failed to add driver:', error);
    }
  };

  // Handle edit driver submission
  const handleEditDriver = async (e) => {
    e.preventDefault();
    try {
      await updateDriver({
        driverId: selectedDriver.driverId,
        ...formData
      }).unwrap();
      setEditDriverOpen(false);
      setSelectedDriver(null);
      resetFormData();
    } catch (error) {
      console.error('Failed to update driver:', error);
    }
  };

  // Handle delete driver confirmation
  const handleDeleteConfirmation = (driver) => {
    setSelectedDriver(driver);
    setConfirmDeleteOpen(true);
  };

  // Handle driver deletion
  const handleDeleteDriver = async () => {
    try {
      await deleteDriver(selectedDriver.driverId).unwrap();
      setConfirmDeleteOpen(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error('Failed to delete driver:', error);
    }
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen || !selectedDriver) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl max-w-md w-full p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete driver <span className="font-semibold">{selectedDriver.name}</span> (ID: {selectedDriver.driverId})? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isDeletingDriver}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              disabled={isDeletingDriver}
            >
              {isDeletingDriver ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Driver Management</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search drivers..."
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

          {/* Add Driver Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            onClick={openAddDriverForm}
          >
            <MdAdd />
            <span>Add Driver</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On Delivery">On Delivery</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={filters.vehicleType}
                onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                {vehicleTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type === 'all' ? 'All Vehicle Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <p>{fetchError?.data?.message || 'Error loading drivers'}</p>
              <button
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredDrivers.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.driverId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {driver.name}
                          </div>
                          <div className="text-sm text-gray-500">ID: {driver.driverId}</div>
                          {driver.phone && (
                            <div className="text-sm text-gray-500">{driver.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getVehicleIcon(driver.vehicleType)}
                        <span className="ml-2 text-sm text-gray-900">{driver.vehicleType || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.licenseNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.completedOrders || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${driver.totalEarnings ? driver.totalEarnings.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDriverDetails(driver)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <MdVisibility className="text-xl" />
                        </button>
                        <button
                          onClick={() => openEditDriverForm(driver)}
                          className="text-orange-600 hover:text-orange-900 transition-colors"
                          title="Edit Driver"
                        >
                          <MdEdit className="text-xl" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirmation(driver)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Driver"
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
              <MdDeliveryDining className="text-gray-300 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No drivers found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver Details Modal */}
      {detailsOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                {selectedDriver.name}
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
                <div className="w-full">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Driver ID</h3>
                    <p className="mt-1 font-bold text-lg">{selectedDriver.driverId}</p>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    {getStatusBadge(selectedDriver.status)}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500">Vehicle Type</h3>
                    <div className="mt-1 flex items-center">
                      {getVehicleIcon(selectedDriver.vehicleType)}
                      <span className="ml-2">{selectedDriver.vehicleType || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                    <p className="mt-1">{selectedDriver.licenseNumber || 'N/A'}</p>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1">{selectedDriver.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 border-b pb-2">Performance</h3>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Total Completed Orders</h4>
                    <p className="text-xl font-bold mt-1">{selectedDriver.completedOrders || 0}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Total Earnings</h4>
                    <p className="text-xl font-bold mt-1">${selectedDriver.totalEarnings ? selectedDriver.totalEarnings.toFixed(2) : '0.00'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 border-b pb-2">System Information</h3>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Created Date</h4>
                    <p className="mt-1">{selectedDriver.createdAt ? new Date(selectedDriver.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                    <p className="mt-1">{selectedDriver.updatedAt ? new Date(selectedDriver.updatedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setDetailsOpen(false);
                    openEditDriverForm(selectedDriver);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Edit Driver
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Driver Modal */}
      <DriverFormModal
        isOpen={addDriverOpen}
        onClose={() => setAddDriverOpen(false)}
        title="Add New Driver"
        onSubmit={handleAddDriver}
        isEditing={false}
        formData={formData}
        handleInputChange={handleInputChange}
        isLoading={isAddingDriver}
      />

      {/* Edit Driver Modal */}
      <DriverFormModal
        isOpen={editDriverOpen}
        onClose={() => setEditDriverOpen(false)}
        title="Edit Driver"
        onSubmit={handleEditDriver}
        isEditing={true}
        formData={formData}
        handleInputChange={handleInputChange}
        isLoading={isUpdatingDriver}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteDriver}
      />
    </div>
  );
}
