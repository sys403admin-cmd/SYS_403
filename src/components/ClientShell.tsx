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

  // Durante SSR (mounted = false), renderizamos un esqueleto mínimo 
  // que NO incluye componentes interactivos propensos a fallar en el servidor.
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        {/* Renderizamos children con cuidado, o simplemente nada para máxima seguridad */}
        <div className="flex-grow"></div>
      </div>
    );
  }

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
