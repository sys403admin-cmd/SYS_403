'use client';

import dynamic from "next/dynamic";
import { CartProvider } from "@/lib/cartContext";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const Preloader = dynamic(() => import("@/components/Preloader"), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Preloader />
      <CustomCursor />
      <CartDrawer />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </CartProvider>
  );
}
