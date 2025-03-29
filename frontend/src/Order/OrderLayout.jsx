import React, { useState } from "react";
import Header from "../Home/components/header"; // added header import
import Footer from "../Home/components/footer";
import FlashDeals from '../Home/pages/flashDeals'
import Cart from "../Order/Cart";

export default function OrderLayout() {
return (
    <>
        <Header />
        <div className="container mx-auto p-1">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Flash Deals Section */}
                <div className="flex-1 bg-white rounded-lg p-6">
                    <FlashDeals />
                </div>
                {/* Cart Sidebar */}
                <div className="w-full md:w-1/4 bg-orange-50 mt-6 mb-4 shadow-md rounded-lg p-8">
                    <div className="mt-4">
                        <Cart />
                    </div>
                </div>
            </div>
            
        </div>
        <Footer />
    </>
);
}