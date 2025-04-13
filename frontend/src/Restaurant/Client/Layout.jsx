import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from "../../Home/components/header";
import Footer from "../../Home/components/footer";

export default function Layout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
}