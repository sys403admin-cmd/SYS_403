'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, LayoutGrid, Archive, Biohazard, Terminal, Menu, X } from 'lucide-react';
import { sounds } from '@/lib/sounds';

const navItems = [
  { name: 'Inicio', path: '/', icon: LayoutGrid },
  { name: 'Archivo Revista', path: '/revista', icon: Archive },
  { name: 'Forjar ADN', path: '/laboratorio', icon: Biohazard },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    <nav className="fixed top-0 left-0 w-full z-[400] px-6 md:px-12 py-4 md:py-6 flex justify-between items-center bg-black/60 backdrop-blur-3xl border-b border-white/5 selection:bg-urban-red selection:text-white">
      <Link href="/" onClick={() => setIsOpen(false)} onMouseEnter={() => sounds.playStatic()} className="group flex items-center gap-3 md:gap-4 relative z-50">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-black flex items-center justify-center border border-urban-red/30 group-hover:border-urban-red transition-all duration-700 shadow-[4px_4px_0_rgba(255,0,0,0.2)] overflow-hidden relative">
           <img src="/sys_403.png" alt="SYS_403" className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-700 relative z-10" />
        </div>
        <div className="flex flex-col leading-[0.8]">
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic glitch-text" data-text=">SYS_403">
            <span className="text-white">&gt;SYS</span>
            <span className="text-[#00FF00]">_</span>
            <span className="text-white">403</span>
          </span>
          <span className="text-[8px] md:text-[9px] font-black tracking-[0.4em] md:tracking-[0.5em] uppercase text-urban-red">System Breach</span>
        </div>
      </Link>
      
      {/* Desktop Menu */}
      <div className="hidden lg:flex gap-12">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onMouseEnter={() => sounds.playHover()}
            onClick={() => sounds.playClick()}
            className={`relative group text-[10px] uppercase tracking-[0.4em] font-black italic flex items-center gap-3 ${pathname === item.path ? 'text-urban-red' : 'text-white/60 hover:text-white'}`}
          >
            <div className={`p-2 transition-all duration-500 relative overflow-hidden ${pathname === item.path ? 'bg-urban-red text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'bg-white/5 text-white group-hover:bg-white group-hover:text-black'}`}>
               <item.icon size={12} strokeWidth={3} className="relative z-10 group-hover:scale-110 transition-transform" />
               <div className="absolute inset-0 bg-urban-red/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            </div>
            <span className="glitch-text transition-all" data-text={item.name}>
               {item.name}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <Link 
          href="/admin" 
          onMouseEnter={() => sounds.playStatic()}
          onClick={() => { sounds.playClick(); setIsOpen(false); }}
          className="hidden md:flex items-center gap-4 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-urban-red hover:text-white transition-all shadow-xl group glitch-text" 
          data-text="Bunker Admin"
        >
           <div className="w-6 h-6 bg-black flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
              <Terminal size={14} strokeWidth={3} />
           </div>
           <span>Bunker Admin</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => { sounds.playClick(); setIsOpen(!isOpen); }}
          className="lg:hidden p-3 bg-white/5 border border-white/10 text-white relative z-50"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>

    {/* Mobile Overlay Menu */}
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[350] bg-black flex flex-col p-8 pt-32 lg:hidden"
        >
          <div className="absolute inset-0 pointer-events-none matrix-bg opacity-10"></div>
          <div className="flex flex-col gap-6 relative z-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => { sounds.playClick(); setIsOpen(false); }}
                className={`flex items-center gap-6 p-6 border-b border-white/5 text-2xl font-black uppercase italic tracking-tighter ${pathname === item.path ? 'text-urban-red' : 'text-white'}`}
              >
                <div className={`p-4 ${pathname === item.path ? 'bg-urban-red text-white' : 'bg-white/5'}`}>
                   <item.icon size={24} />
                </div>
                <span>{item.name}</span>
              </Link>
            ))}
            <Link 
              href="/admin" 
              onClick={() => { sounds.playClick(); setIsOpen(false); }}
              className="mt-12 flex items-center justify-center gap-4 p-8 bg-white text-black font-black uppercase italic tracking-widest text-sm"
            >
              <Terminal size={20} /> Entrar al Bunker
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
