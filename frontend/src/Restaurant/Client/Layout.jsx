import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from "../../Home/Components/header";
import Footer from "../../Home/Components/footer";

export default function Layout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
}