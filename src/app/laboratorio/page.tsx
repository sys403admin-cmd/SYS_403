'use client';

import dynamic from 'next/dynamic';

const Customizer = dynamic(() => import('@/components/Customizer'), { 
  ssr: false,
  loading: () => (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-urban-red border-t-transparent animate-spin"></div>
    </div>
  )
});

export default function Laboratorio() {
  return (
    <main className="min-h-screen bg-urban-bone dark:bg-urban-charcoal">
      <Customizer />
    </main>
  );
}
