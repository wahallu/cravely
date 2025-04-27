import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdPerson, MdPhone, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdDirectionsBike, MdLocationCity, MdAdd, MdClose } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useAddDriverMutation } from '../../Redux/slices/driverSlice';
import toast from 'react-hot-toast';
import { saveAuth } from '../../utils/auth';

export default function DriverSignup() {
  const navigate = useNavigate();
  const [signup] = useAddDriverMutation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    vehicleType: 'Motorcycle',
    deliveryCities: [] // Array to store selected cities
  });

  // Sample list of cities - this could come from an API
  const [availableCities, setAvailableCities] = useState([
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
  ]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [newCity, setNewCity] = useState('');

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone.replace(/[^\d]/g, '').length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.licenseNumber.length < 5) {
      newErrors.licenseNumber = 'Please enter a valid license number';
    }
    if (formData.deliveryCities.length === 0) {
      newErrors.deliveryCities = 'Please select at least one delivery city';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await signup(formData).unwrap();
        console.log('Signup response:', response);
        
        if (response.token) {
          saveAuth(response.token, {
            ...response.driver,
            role: 'driver'
          });
          toast.success('Registration successful!');
          navigate('/delivery/login');
        } else {
          throw new Error('Registration failed - No token received');
        }
      } catch (err) {
        console.error('Signup error:', err);
        toast.error(err.data?.message || 'Registration failed');
      }
    }
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCitySelect = (city) => {
    if (!formData.deliveryCities.includes(city)) {
      setFormData(prev => ({
        ...prev,
        deliveryCities: [...prev.deliveryCities, city]
      }));
      
      if (errors.deliveryCities) {
        setErrors(prev => ({ ...prev, deliveryCities: '' }));
      }
    }
    setNewCity('');
  };

  const removeCity = (cityToRemove) => {
    setFormData(prev => ({
      ...prev,
      deliveryCities: prev.deliveryCities.filter(city => city !== cityToRemove)
    }));
  };

  const filteredCities = newCity 
    ? availableCities.filter(city => 
        city.toLowerCase().includes(newCity.toLowerCase()) && 
        !formData.deliveryCities.includes(city)
      )
    : [];

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Driver Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our delivery team
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">
                Personal Information
              </h3>
              
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`pl-10 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2.5`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2.5`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="mt-1 relative">
                    <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pl-10 block w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2.5`}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Driver Details Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">
                Driver Information
              </h3>
              
              <div className="space-y-4">
                {/* License Number Field */}
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                    Driver's License Number
                  </label>
                  <div className="mt-1 relative">
                    <MdDirectionsBike className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={`pl-10 block w-full border ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2.5`}
                      placeholder="License Number"
                    />
                  </div>
                  {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                  )}
                </div>

                {/* Vehicle Type Field */}
                <div>
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                    Vehicle Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg p-2.5"
                    >
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Car">Car</option>
                      <option value="Bicycle">Bicycle</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Cities Field */}
                <div>
                  <label htmlFor="deliveryCities" className="block text-sm font-medium text-gray-700">
                    Delivery Cities
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select cities where you're available to deliver
                  </p>
                  
                  {/* Selected Cities */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.deliveryCities.map(city => (
                      <div 
                        key={city} 
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center"
                      >
                        <MdLocationCity className="mr-1" />
                        <span>{city}</span>
                        <button 
                          type="button" 
                          onClick={() => removeCity(city)}
                          className="ml-1 text-orange-700 hover:text-orange-900"
                        >
                          <MdClose />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* City Input and Dropdown */}
                  <div className="relative">
                    <div className="flex">
                      <div className="relative flex-grow">
                        <MdLocationCity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="Search cities..."
                          className={`pl-10 block w-full border ${errors.deliveryCities ? 'border-red-500' : 'border-gray-300'} rounded-l-lg p-2.5`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (newCity && !formData.deliveryCities.includes(newCity)) {
                            handleCitySelect(newCity);
                          }
                        }}
                        className="bg-orange-500 text-white px-3 rounded-r-lg hover:bg-orange-600"
                      >
                        <MdAdd className="text-xl" />
                      </button>
                    </div>
                    
                    {filteredCities.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                        {filteredCities.map((city) => (
                          <li
                            key={city}
                            onClick={() => handleCitySelect(city)}
                            className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-orange-100"
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {errors.deliveryCities && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryCities}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">
                Account Security
              </h3>
              
              <div className="space-y-4">
                {/* Password Fields */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 block w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2.5`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <MdVisibilityOff className="text-gray-400" />
                      ) : (
                        <MdVisibility className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-10 block w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2.5`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <MdVisibilityOff className="text-gray-400" />
                      ) : (
                        <MdVisibility className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              Register as Driver
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/delivery/login" className="font-medium text-orange-600 hover:text-orange-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}