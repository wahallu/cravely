import React, { useState } from 'react'
import { FaInstagram, FaFacebook, FaTwitter, FaHeart, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa'
import { MdEmail, MdKeyboardArrowRight } from 'react-icons/md'
import { Link } from 'react-router-dom'

const cities = {
  col1: ['San Francisco', 'Miami', 'San Diego', 'East Bay', 'Long Beach'],
  col2: ['Los Angeles', 'Washington DC', 'Seattle', 'Portland', 'Nashville'],
  col3: ['New York City', 'Orange County', 'Atlanta', 'Charlotte', 'Denver'],
  col4: ['Chicago', 'Phoenix', 'Las Vegas', 'Sacramento', 'Oklahoma City'],
  col5: ['Columbus', 'New Mexico', 'Albuquerque', 'Sacramento', 'New Orleans']
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isHovered, setIsHovered] = useState(null)
  
  const handleSubscribe = (e) => {
    e.preventDefault()
    // Handle subscription logic
    console.log('Subscribing email:', email)
    setEmail('')
    // Add toast notification here
  }

  return (
    <div className="relative">
      {/* Wave Pattern Divider */}
      {/* <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 transform -translate-y-full">
        <svg className="relative block w-full h-12" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#1a202c"></path>
        </svg>
      </div> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newsletter Section */}
          <div className="relative z-10 bg-gradient-to-r from-orange-500 to-orange-400 p-8 rounded-xl shadow-xl mb-16 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">Join Our Newsletter</h3>
                <p className="text-white/90">Subscribe to get exclusive offers and stay updated with the latest food trends</p>
              </div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <MdEmail className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:border-gray-200 text-gray-700"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Main Footer Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* About Section */}
            <div>
              <div className="mb-6">
                <img
                  src="/logo.png"
                  alt="Cravely"
                  className="h-10"
                />
              </div>
              <p className="text-gray-400 mb-6">
                Cravely is a food delivery platform that brings your favorite restaurants to your doorstep with just a few clicks.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-orange-400 mr-3 mt-1" />
                  <span className="text-gray-400">123 Delivery Street, Foodville, CA 92602</span>
                </div>
                <div className="flex items-center">
                  <FaPhoneAlt className="text-orange-400 mr-3" />
                  <span className="text-gray-400">+1 (234) 567-8900</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-orange-400 mr-3" />
                  <span className="text-gray-400">support@cravely.com</span>
                </div>
              </div>

              {/* Driver Login Section */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h4 className="text-sm font-semibold mb-3 flex items-center">
                  <FaMapMarkerAlt className="text-orange-400 mr-2" />
                  Drivers Portal
                </h4>
                <Link 
                  to="/driver/login" 
                  className="inline-flex items-center bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded transition-colors duration-200"
                >
                  Driver Login
                  <MdKeyboardArrowRight className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                    <MdKeyboardArrowRight className="mr-2 group-hover:translate-x-1 transition-transform" />
                    About us
                  </Link>
                </li>
                <li>
                  <Link to="/team" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                    <MdKeyboardArrowRight className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Team
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                    <MdKeyboardArrowRight className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                    <MdKeyboardArrowRight className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Services</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/help" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                    <MdKeyboardArrowRight className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link to="/partner" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                    <MdKeyboardArrowRight className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Partner with us
                  </Link>
                </li>
                <li>
                  <Link to="/ride" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                    <MdKeyboardArrowRight className="mr-2 group-hover:translate-x-1 transition-transform" />
                    Ride with us
                  </Link>
                </li>
                <li>
                  <Link to="/restaurants" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                    <MdKeyboardArrowRight className="mr-2 group-hover:translate-x-1 transition-transform" />
                    All Restaurants
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Section */}
            <div>
              <h4 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Connect With Us</h4>
              <p className="text-gray-400 mb-4">Follow us on social media and stay updated with the latest offers and news</p>
              <div className="flex space-x-3 mb-6">
                {[
                  { icon: <FaInstagram size={18} />, name: 'Instagram', color: 'bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600' },
                  { icon: <FaFacebook size={18} />, name: 'Facebook', color: 'bg-blue-600' },
                  { icon: <FaTwitter size={18} />, name: 'Twitter', color: 'bg-sky-500' }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href="#" 
                    aria-label={social.name}
                    className={`h-10 w-10 rounded-full ${social.color} flex items-center justify-center text-white transform hover:scale-110 transition-transform duration-200`}
                    onMouseEnter={() => setIsHovered(idx)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    {social.icon}
                    {isHovered === idx && (
                      <span className="absolute -bottom-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 animate-fadeIn">
                        {social.name}
                      </span>
                    )}
                  </a>
                ))}
              </div>
              <Link to="/download" className="inline-block bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200">
                Download Our App
              </Link>
            </div>
          </div>

          {/* Cities Section */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-6 border-b border-gray-800 pb-2">Our Top Delivery Cities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.values(cities).map((cityList, idx) => (
                <ul key={idx}>
                  {cityList.map((city, cityIdx) => (
                    <li key={cityIdx} className="mb-2">
                      <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center group">
                        <MdKeyboardArrowRight className="mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        {city}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Cravely. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}