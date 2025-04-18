import React from 'react';
import { motion } from 'framer-motion';
import { 
  MdFastfood, 
  MdDeliveryDining, 
  MdStorefront, 
  MdGroups,
  MdStarRate,
  MdReceipt,
  MdTimer
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';

export default function AboutUs() {
  // Stats data
  const stats = [
    { id: 1, icon: <MdStorefront />, value: '500+', label: 'Restaurant Partners' },
    { id: 2, icon: <MdDeliveryDining />, value: '1000+', label: 'Delivery Drivers' },
    { id: 3, icon: <MdReceipt />, value: '50,000+', label: 'Orders Delivered' },
    { id: 4, icon: <MdStarRate />, value: '4.8', label: 'Average Rating' }
  ];

  // Team data
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Chief Executive Officer',
      image: '/team-1.jpg',
      bio: 'Sarah brings over 15 years of experience in the food industry and a passion for connecting people with great food.'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      image: '/team-2.jpg',
      bio: 'Michael leads our tech team with innovative solutions that make food delivery seamless and accessible.'
    },
    {
      id: 3,
      name: 'Priya Patel',
      role: 'Head of Operations',
      image: '/team-3.jpg',
      bio: 'Priya ensures that Cravely operations run smoothly across all our service areas, with a focus on quality.'
    }
  ];

  // Core values
  const values = [
    {
      id: 1,
      title: 'Customer Satisfaction',
      description: 'We go above and beyond to ensure our customers have the best experience.',
      icon: <MdStarRate className="text-4xl mb-2 text-orange-500" />
    },
    {
      id: 2,
      title: 'Quality Food',
      description: 'We partner only with restaurants that meet our high standards for quality.',
      icon: <MdFastfood className="text-4xl mb-2 text-orange-500" />
    },
    {
      id: 3,
      title: 'Fast Delivery',
      description: 'Our efficient logistics ensure your food arrives hot and on time.',
      icon: <MdTimer className="text-4xl mb-2 text-orange-500" />
    },
    {
      id: 4,
      title: 'Community Focus',
      description: 'We support local businesses and contribute to community growth.',
      icon: <MdGroups className="text-4xl mb-2 text-orange-500" />
    }
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-yellow-300 to-yellow-500 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Our Story</h1>
              <p className="text-xl text-white max-w-3xl mx-auto">
                We're on a mission to make food delivery more convenient, delicious, and accessible for everyone.
              </p>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="bg-yellow-400 absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20"></div>
                  <div className="bg-orange-400 absolute -bottom-4 -right-4 w-32 h-32 rounded-full opacity-20"></div>
                  <div className="relative z-10 overflow-hidden rounded-xl shadow-xl">
                    <img 
                      src="/about-image.jpg" 
                      alt="Cravely Food Delivery"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop";
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Delivering Happiness <span className="text-orange-500">Since 2018</span>
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Cravely began with a simple idea: everyone deserves access to great food, delivered quickly and reliably. What started as a small operation in Foodville, CA has grown into a nationwide service connecting hungry customers with their favorite local restaurants.
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our platform combines cutting-edge technology with a human touch. We work closely with restaurant partners to ensure quality, empower delivery drivers with flexible opportunities, and provide customers with a seamless ordering experience.
                </p>
                <div className="flex items-center text-gray-800">
                  <MdDeliveryDining className="text-orange-500 text-3xl mr-2" />
                  <span className="font-medium">Food delivery that puts people first</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800">Cravely By The Numbers</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                We're proud of the impact we've made connecting restaurants, drivers, and hungry customers.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.id}
                  className="bg-white p-6 rounded-xl shadow-md text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-orange-500 text-3xl flex justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-gray-600 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800">Our Core Values</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                These principles guide everything we do at Cravely.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div 
                  key={value.id}
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-all text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {value.icon}
                  <h3 className="text-xl font-medium text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800">Meet Our Team</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                The passionate people behind Cravely working to deliver you the best food delivery experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={member.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="h-64 bg-gray-200">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'women' : 'men'}/${index + 1}.jpg`;
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                    <p className="text-orange-500 mb-4">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-orange-400 to-orange-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Ready to satisfy your cravings?</h2>
              <p className="text-white text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of happy customers who order delicious food from their favorite restaurants every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/restaurants" className="bg-white text-orange-500 hover:bg-gray-100 py-3 px-8 rounded-lg font-medium transition-colors">
                  Browse Restaurants
                </Link>
                <Link to="/register" className="bg-orange-700 text-white hover:bg-orange-800 py-3 px-8 rounded-lg font-medium transition-colors">
                  Sign Up Now
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800">Get In Touch</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="bg-gray-50 p-6 rounded-xl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Address</h3>
                <p className="text-gray-600">123 Delivery Street<br />Foodville, CA 92602</p>
              </motion.div>

              <motion.div
                className="bg-gray-50 p-6 rounded-xl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Phone</h3>
                <p className="text-gray-600">+1 (234) 567-8900</p>
              </motion.div>

              <motion.div
                className="bg-gray-50 p-6 rounded-xl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Email</h3>
                <p className="text-gray-600">support@cravely.com</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}