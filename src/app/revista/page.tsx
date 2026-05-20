'use client';

import dynamic from 'next/dynamic';

const RevistaComponent = dynamic(() => import('./RevistaComponent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-urban-red border-t-transparent animate-spin"></div>
    </div>
  )
});

export default function RevistaPage() {
  return <RevistaComponent />;
}
