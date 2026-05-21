'use client';

import React from 'react';
import dynamic from "next/dynamic";
import { CartProvider } from "@/lib/cartContext";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const Preloader = dynamic(() => import("@/components/Preloader"), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CartProvider>
      {/* Componentes de Cliente: Solo se renderizan tras el montaje para evitar errores SSR */}
      {mounted && (
        <>
          <Preloader />
          <CustomCursor />
          <CartDrawer />
          <Navbar />
        </>
      )}
      
      {/* El contenido principal (children) se renderiza siempre para SEO y fluidez */}
      <main className="flex-grow">
        {children}
      </main>
      
      {mounted && <Footer />}
    </CartProvider>
  );
}
