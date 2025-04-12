import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home/pages/layout";
import Login from "./User/login";
import Register from "./User/register";
import RestaurantRegister from "./Restaurant/Admin/RestaurantRegister";
import RestaurantLogin from "./Restaurant/Admin/RestaurantLogin";
import RestaurantDashboard from "./Restaurant/Admin/RestaurantDashboard";
import MenuManagement from "./Restaurant/Admin/MenuManagement";
import RestaurantList from "./Restaurant/Client/RestaurantList";
import RestaurantDetails from "./Restaurant/Client/RestaurantDetail";
import Layout from "./Restaurant/Admin/Layout";
import ClientLayout from "./Restaurant/Client/Layout";
import OrderConfirmation from './Order/OrderConfirmation';
import { AdminProtectedRoutes, UserProtectedRoutes } from "./protectedRoutes";

//order
import Cart from "../src/Order/OrderLayout";
import Checkout from "./Order/Checkout";

import AdminLayout from "./User/Admin/layout";
import AdminDashboard from "./User/Admin/dashboard";
import AdminRestaurant from "./User/Admin/restaurant";
import AdminDrivers from "./User/Admin/drivers";

import UserLayout from "./User/Customer/layout";
import UserDashboard from "./User/Customer/dashboard";
import LiveTracking from "./Tracking/LiveTracking";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurant/register" element={<RestaurantRegister />} />
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/livetracking" element={<LiveTracking />} />

        {/* Order */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<OrderConfirmation />} />

        {/* Restaurant Admin Dashboard Routes */}
        <Route path="/restaurant" element={<Layout />}>
          <Route path="dashboard" element={<RestaurantDashboard />} />
          <Route path="menu" element={<MenuManagement />} />
        </Route>

        {/* Restaurant Client */}
        <Route path="/" element={<ClientLayout />}>
          <Route path="restaurants" element={<RestaurantList />} />
          <Route path="restaurant/:id" element={<RestaurantDetails />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminProtectedRoutes>
            <AdminLayout />
          </AdminProtectedRoutes>
        }>
          <Route path="" element={<AdminDashboard />} />
          <Route path="restaurants" element={<AdminRestaurant />} />
          <Route path="drivers" element={<AdminDrivers />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/user" element={
          <UserProtectedRoutes>
            <UserLayout />
          </UserProtectedRoutes>
        }>
          <Route path="" element={<UserDashboard />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}
