import React from "react";
import Header from "../components/header";
import Hero from "../components/hero";
import FlashDeals from "./flashDeals";
import PopularItems from "../components/popularItems";
import Footer from "../components/footer";
import HowItWorks from "../components/howItWorks";
import FeaturedRestaurants from "../components/featuredRestaurants";

export default function layout() {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-r from-yellow-300 to-yellow-500">
        <Hero />
      </div>
      <FlashDeals />
      <HowItWorks />
      <PopularItems />
      <FeaturedRestaurants />
      <Footer />
    </div>
  );
}
