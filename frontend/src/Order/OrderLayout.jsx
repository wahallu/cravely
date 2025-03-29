import React, { useState } from "react";
import Header from "../Home/components/header"; // added header import
import Footer from "../Home/components/footer";
import FlashDeals from '../Home/pages/flashDeals'
import Cart from "../Order/Cart";

export default function OrderLayout() {
return (
    <>
        <Header />
       
                        <Cart />
             
        <Footer />
    </>
);
}