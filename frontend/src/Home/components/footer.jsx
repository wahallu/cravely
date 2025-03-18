import React, { useState } from 'react'
import { FaInstagram, FaFacebook, FaTwitter, FaHeart } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

const cities = {
  col1: ['San Francisco', 'Miami', 'San Diego', 'East Bay', 'Long Beach'],
  col2: ['Los Angeles', 'Washington DC', 'Seattle', 'Portland', 'Nashville'],
  col3: ['New York City', 'Orange County', 'Atlanta', 'Charlotte', 'Denver'],
  col4: ['Chicago', 'Phoenix', 'Las Vegas', 'Sacramento', 'Oklahoma City'],
  col5: ['Columbus', 'New Mexico', 'Albuquerque', 'Sacramento', 'New Orleans']
}

export default function footer() {

  const [email, setEmail] = useState('')
  
  return (
    <div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cities Section */}
          <div className="mb-16">
            <h3 className="text-lg font-semibold mb-6">Our top cities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.values(cities).map((cityList, idx) => (
                <ul key={idx}>
                  {cityList.map((city, cityIdx) => (
                    <li key={cityIdx} className="mb-2">
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {city}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Main Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Team</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help & Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Partner with us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Ride with us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Refund & Cancellation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">FOLLOW US</h4>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaInstagram size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaFacebook size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaTwitter size={24} />
                </a>
              </div>
              <h4 className="text-lg font-semibold mb-4">Receive exclusive offers in your mailbox</h4>
              <div className="flex">
                <div className="flex-1 relative">
                  <MdEmail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-orange-400 text-white"
                  />
                </div>
                <button className="bg-orange-400 text-white px-6 py-2 rounded-r-lg hover:bg-orange-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              All rights Reserved &copy; Your Company, 2021
            </p>
            <p className="text-gray-400 flex items-center">
              Made with <FaHeart className="text-orange-400 mx-2" /> by Themewagon
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
