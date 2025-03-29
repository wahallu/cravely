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

import AdminLayout from "./User/Admin/layout";
import AdminDashboard from "./User/Admin/dashboard";
import AdminRestaurant from "./User/Admin/restaurant";
import AdminDrivers from "./User/Admin/drivers";

import UserLayout from "./User/Customer/layout";
import UserDashboard from "./User/Customer/dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurant/register" element={<RestaurantRegister />} />
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />

        {/* Restaurant Dashboard Routes */}
        <Route path="/restaurant" element={<Layout />}>
          <Route path="dashboard" element={<RestaurantDashboard />} />
          {/* Add other restaurant routes inside this Layout */}
          <Route path="menu" element={<MenuManagement />} />
          {/* <Route path="orders" element={<div>Orders Page</div>} /> */}
          {/* <Route path="customers" element={<div>Customers Page</div>} /> */}
          {/* <Route path="settings" element={<div>Settings Page</div>} /> */}
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="" element={<AdminDashboard />} />
          <Route path="restaurants" element={<AdminRestaurant />} />
          <Route path="drivers" element={<AdminDrivers />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="" element={<UserDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
