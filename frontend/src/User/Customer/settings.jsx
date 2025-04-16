import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdLock,
  MdVisibility, 
  MdVisibilityOff,
  MdSave,
  MdError
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { useUpdateUserMutation } from '../../Redux/slices/userSlice';

export default function Settings() {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prevData => ({
        ...prevData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || ''
      }));
    }
  }, []);

  // Format phone number while typing
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number formatting
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear any previous errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation rules
    if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (if provided)
    if (formData.phone && formData.phone.replace(/[^\d]/g, '').length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Password validation (only if the user is trying to change password)
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
      }
      
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Get user ID from localStorage
        const userData = localStorage.getItem('user');
        const userId = JSON.parse(userData)?._id;
        
        if (!userId) {
          toast.error('User authentication error. Please log in again.');
          return;
        }
        
        // Prepare data for API
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone.replace(/[^\d]/g, ''), // Strip formatting
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          }
        };
        
        // Include password data if changing password
        if (formData.newPassword) {
          updateData.currentPassword = formData.currentPassword;
          updateData.newPassword = formData.newPassword;
        }
        
        // Call the update user mutation
        const result = await updateUser({ id: userId, ...updateData }).unwrap();
        
        // Update the local storage with new user data
        const updatedUserData = {
          ...JSON.parse(userData),
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          }
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // Show success message
        toast.success('Profile updated successfully!');
        
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
      } catch (error) {
        console.error('Profile update failed:', error);
        toast.error(error.data?.message || 'Failed to update profile. Please try again.');
      }
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile information and preferences</p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('account')}
            className={`py-4 px-6 font-medium ${
              activeTab === 'account'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-orange-400'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-6 font-medium ${
              activeTab === 'security'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-orange-400'
            }`}
          >
            Password & Security
          </button>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'account' && (
              <>
                {/* Personal Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <MdPerson className="mr-2 text-orange-400" /> First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`block w-full p-3 border ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <MdError className="mr-1" /> {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <MdPerson className="mr-2 text-orange-400" /> Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`block w-full p-3 border ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <MdError className="mr-1" /> {errors.lastName}
                      </p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <MdEmail className="mr-2 text-orange-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full p-3 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-gray-100`}
                      placeholder="your@email.com"
                      disabled={true}
                      title="Email cannot be changed. Please contact support."
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <MdError className="mr-1" /> {errors.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <MdPhone className="mr-2 text-orange-400" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full p-3 border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <MdError className="mr-1" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Address Section */}
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Address Information</h2>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Street Address */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <MdLocationOn className="mr-2 text-orange-400" /> Street Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* City */}
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Springfield"
                        />
                      </div>
                      
                      {/* State */}
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          placeholder="IL"
                        />
                      </div>
                      
                      {/* Zip Code */}
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          placeholder="62701"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Change Password</h2>
                
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MdLock className="mr-2 text-orange-400" /> Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`block w-full p-3 pr-10 border ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdVisibility className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.currentPassword}
                    </p>
                  )}
                </div>
                
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MdLock className="mr-2 text-orange-400" /> New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`block w-full p-3 pr-10 border ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdVisibility className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.newPassword}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Password should be at least 8 characters long
                  </p>
                </div>
                
                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MdLock className="mr-2 text-orange-400" /> Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full p-3 pr-10 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdVisibility className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <MdError className="mr-1" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <MdSave className="mr-2" />
                {isLoading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
