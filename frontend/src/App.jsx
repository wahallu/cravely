import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home/pages/layout'
import Login from './User/login'
import Register from './User/register'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
      </Routes>
    </BrowserRouter>
  )
}
