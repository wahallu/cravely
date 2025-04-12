import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { frame, motion, useSpring } from 'motion/react'
import hamburger from '/hamburger_icon.png'
import {useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useLoginMutation } from '../Redux/slices/authSlice'

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

export default function Login() {
  const [login] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  // Create refs for the follow pointer effect
  const hamburgerRef = useRef(null);
  const { x, y } = useFollowPointer(hamburgerRef);
  
  // Create static hamburger positions with useMemo to prevent re-generation on re-renders
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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
    login({ email, password }).unwrap()
      .then((response) => {
        console.log('Login successful:', response)
        toast.success('Login successful!')
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        navigate('/')
      })
      .catch((error) => {
        console.error('Login failed:', error)
        toast.error('Login failed. Please check your credentials.')
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Mouse follower element */}
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

      {/* Additional decorative hamburgers - FIXED POSITIONS */}
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

      {/* Login card */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div className="px-6 py-8 sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-800">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your account
            </p>
          </div>

          {/* Social Login */}
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
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-orange-400 focus:border-orange-400"
                  placeholder="your@email.com"
                />
              </div>
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-orange-400 focus:border-orange-400"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-orange-500 hover:text-orange-400">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-orange-400 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-orange-500 hover:text-orange-400">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
