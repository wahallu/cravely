import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MdEmail, MdLock, MdPerson, MdPhone, MdVisibility, MdVisibilityOff, MdError } from 'react-icons/md'
import { FaGoogle, FaFacebook, FaCheck } from 'react-icons/fa'
import { frame, motion, useSpring } from 'motion/react'
import { useSignupMutation } from '../Redux/slices/authSlice'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import hamburger from '/hamburger_icon.png'

const spring = { damping: 3, stiffness: 50, restDelta: 0.001 };

function useFollowPointer(ref) {
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  useEffect(() => {
    if (!ref.current) return;

    const handlePointerMove = ({ clientX, clientY }) => {
      const element = ref.current;

      frame.read(() => {
        x.set(clientX - element.offsetLeft - element.offsetWidth / 2);
        y.set(clientY - element.offsetTop - element.offsetHeight / 2);
      });
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [x, y]);

  return { x, y };
}

export default function Register() {
  const [signup] = useSignupMutation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  })

  const navigate = useNavigate();

  // Create ref for the follow pointer effect
  const hamburgerRef = useRef(null);
  const { x, y } = useFollowPointer(hamburgerRef);

  // Generate static background hamburger positions once with useMemo
  const backgroundHamburgers = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${30 + Math.random() * 50}px`,
      height: `${30 + Math.random() * 50}px`,
      rotation: Math.random() * 360
    }));
  }, []); // Empty dependency array means this runs once on mount

  // Format phone number while typing
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    
    // Remove all non-digits
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    // Get the length based on input
    const phoneNumberLength = phoneNumber.length;
    
    // Format based on length
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Check password strength when password changes
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
    
    // Clear confirm password error if passwords match
    if (formData.confirmPassword && formData.password === formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Format phone number if the field is phone
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone.replace(/[^\d]/g, '').length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Password validation
    if (!passwordStrength.length || !passwordStrength.uppercase || 
        !passwordStrength.number || !passwordStrength.special) {
      newErrors.password = 'Password does not meet requirements';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // First name and last name validation
    if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form before submission
    if (validateForm()) {
      signup(formData).unwrap()
        .then((response) => {
          console.log('Registration successful', response);
          toast.success('Registration successful!');
          navigate('/login');
        })
        .catch((error) => {
          console.error('Registration failed', error);
          toast.error('Registration failed. Please try again.');
        });
    } else {
      console.log('Form has errors', errors);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Mouse follower hamburger */}
      <motion.div
        ref={hamburgerRef}
        style={{ 
          x, 
          y,
          position: 'absolute',
          zIndex: 0,
          pointerEvents: 'none'
        }}
        className="opacity-70"
      >
        <img 
          src={hamburger} 
          alt=""
          className="w-28 h-28 object-contain"
        />
      </motion.div>

      {/* Additional decorative hamburgers with fixed positions */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {backgroundHamburgers.map((burger) => (
          <div
            key={burger.id}
            className="absolute opacity-20"
            style={{
              left: burger.left,
              top: burger.top,
              width: burger.width,
              height: burger.height,
              transform: `rotate(${burger.rotation}deg)`,
              zIndex: 0
            }}
          >
            <img 
              src={hamburger} 
              alt="" 
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
      
      <div className="max-w-lg w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div className="px-6 py-8 sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-800">Create an Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join Cravely to satisfy your cravings
            </p>
          </div>

          {/* Social Registration */}
          <div className="mt-6">
            <div className="flex gap-4">
              <button
                className="w-full flex justify-center items-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
              >
                <FaGoogle className="text-red-500" />
                <span>Google</span>
              </button>
              <button
                className="w-full flex justify-center items-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
              >
                <FaFacebook className="text-blue-600" />
                <span>Facebook</span>
              </button>
            </div>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with email</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPerson className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'} rounded-lg`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <MdError className="mr-1" /> {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPerson className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'} rounded-lg`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <MdError className="mr-1" /> {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'} rounded-lg`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <MdError className="mr-1" /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'} rounded-lg`}
                  placeholder="(123) 456-7890"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <MdError className="mr-1" /> {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'} rounded-lg`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Password strength indicators */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs">
                  <div className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {passwordStrength.length && <FaCheck className="text-white text-xs" />}
                  </div>
                  <span className={passwordStrength.length ? 'text-green-500' : 'text-gray-500'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <div className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center ${passwordStrength.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {passwordStrength.uppercase && <FaCheck className="text-white text-xs" />}
                  </div>
                  <span className={passwordStrength.uppercase ? 'text-green-500' : 'text-gray-500'}>
                    At least 1 uppercase letter
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <div className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {passwordStrength.number && <FaCheck className="text-white text-xs" />}
                  </div>
                  <span className={passwordStrength.number ? 'text-green-500' : 'text-gray-500'}>
                    At least 1 number
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <div className={`h-4 w-4 rounded-full mr-2 flex items-center justify-center ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {passwordStrength.special && <FaCheck className="text-white text-xs" />}
                  </div>
                  <span className={passwordStrength.special ? 'text-green-500' : 'text-gray-500'}>
                    At least 1 special character
                  </span>
                </div>
              </div>
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <MdError className="mr-1" /> {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'} rounded-lg`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <MdError className="mr-1" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" className="text-orange-400 hover:text-orange-500">Terms of Service</a> and <a href="#" className="text-orange-400 hover:text-orange-500">Privacy Policy</a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={!acceptTerms}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white ${!acceptTerms ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-400 hover:bg-orange-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-lg`}
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-orange-500 hover:text-orange-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
