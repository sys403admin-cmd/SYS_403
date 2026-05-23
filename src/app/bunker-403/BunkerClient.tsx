'use client';

import dynamic from 'next/dynamic';

const DashboardComponent = dynamic(() => import('./DashboardComponent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-urban-red border-t-transparent animate-spin"></div>
    </div>
  )
});

export default function BunkerClient() {
  return <DashboardComponent />;
}
