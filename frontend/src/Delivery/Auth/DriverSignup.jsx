import React, { useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdPerson, MdPhone, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdError, MdDirectionsBike } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useAddDriverMutation } from '../../Redux/slices/driverSlice';
import toast from 'react-hot-toast';

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
    vehicleType: 'Motorcycle'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

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
          <div className="rounded-md shadow-sm space-y-4">
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

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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