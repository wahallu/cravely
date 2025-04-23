import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from '../src/Order/NotifyContext';
import Home from "./Home/pages/layout";
import AboutUs from "./Home/pages/aboutus";
import Login from "./User/login";
import Register from "./User/register";
import RestaurantRegister from "./Restaurant/Admin/RestaurantRegister";
import RestaurantLogin from "./Restaurant/Admin/RestaurantLogin";
import RestaurantDashboard from "./Restaurant/Admin/RestaurantDashboard";
import MenuManagement from "./Restaurant/Admin/MenuManagement";
import RestaurantList from "./Restaurant/Client/RestaurantList";
import RestaurantDetails from "./Restaurant/Client/RestaurantDetail";
import MealsMenus from "./Restaurant/Client/MealsAndMenus"
import Layout from "./Restaurant/Admin/Layout";
import ClientLayout from "./Restaurant/Client/Layout";
import OrderConfirmation from './Order/OrderConfirmation';
import Order from "./Order/Order";
import { AdminProtectedRoutes, UserProtectedRoutes } from "./protectedRoutes";

//order
import Cart from "../src/Order/Cart";
import Checkout from "./Order/Checkout";
import MyOrders from './Order/MyOrders';

import AdminLayout from "./User/Admin/layout";
import AdminDashboard from "./User/Admin/dashboard";
import AdminRestaurant from "./User/Admin/restaurant";
import AdminDrivers from "./User/Admin/drivers";

import UserLayout from "./User/Customer/layout";
import UserDashboard from "./User/Customer/dashboard";
import LiveTracking from "./Tracking/LiveTracking";
import Favourite from "./User/Customer/favourite";
import Offers from "./User/Customer/offers";
import Settings from "./User/Customer/settings";
import PaymentMethods from "./User/Customer/paymentMethods";

import DeliveryLayout from "./Delivery/DeliveryLayout";
import DeliveryDashboard from "./Delivery/DeliveryDashboard";
import DriverDashboard from "./Delivery/DriverDashboard";
import DriverProfile from "./Delivery/DriverProfile";
import AllDrivers from "./Delivery/AllDrivers";
import DriverSignup from "./Delivery/Auth/DriverSignup";
import DriverSignin from "./Delivery/Auth/DriverSignin";



export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurant/register" element={<RestaurantRegister />} />
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/livetracking" element={<LiveTracking />} />

          {/* Order */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<OrderConfirmation />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<Order />} />

          {/* Restaurant Admin Dashboard Routes */}
          <Route path="/restaurant" element={<Layout />}>
            <Route path="dashboard" element={<RestaurantDashboard />} />
            <Route path="menu" element={<MenuManagement />} />
          </Route>

          {/* Restaurant Client */}
          <Route path="/" element={<ClientLayout />}>
            <Route path="restaurants" element={<RestaurantList />} />
            <Route path="restaurant/:id" element={<RestaurantDetails />} />
            <Route path="meals&menus" element={<MealsMenus />} />
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
            <Route path="favorites" element={<Favourite />} />
            <Route path="offers" element={<Offers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="payments" element={<PaymentMethods />} />
          </Route>

          <Route path="/delivery" element={<DeliveryLayout />}>
            <Route path="" element={<DeliveryDashboard />} />
            <Route path="drivers" element={<DriverDashboard />} />
            <Route path="all-drivers" element={<AllDrivers />} />
            <Route path="drivers/:id" element={<DriverProfile />} />
            <Route path="signup" element={<DriverSignup />} />
            <Route path="login" element={<DriverSignin />} />
          </Route>

        </Routes>
      </NotificationProvider>

    </BrowserRouter>
  );
}
