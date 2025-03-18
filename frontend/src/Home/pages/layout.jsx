import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/header'
import Hero from '../components/hero'
import Footer from '../components/footer'

export default function layout() {
  return (
    <div>
        <Header />
        <div className='min-h-screen bg-gradient-to-r from-yellow-300 to-yellow-500'>
            <Hero />
        </div>
        <Footer />
    </div>
  )
}
