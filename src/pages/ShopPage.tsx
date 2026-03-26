import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StickerGrid from "@/components/StickerGrid";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

const ShopPage = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <Hero />
      <StickerGrid />
      <div className="h-8" />
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default ShopPage;
