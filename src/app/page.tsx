'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Zap, Target, Lock, Layers, Biohazard, Terminal, LayoutGrid, ShieldCheck } from 'lucide-react';

import { sounds } from '@/lib/sounds';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Matrix Overlay - Subtle */}
      <div className="absolute inset-0 pointer-events-none matrix-bg opacity-10"></div>

      <main className="relative pt-40 pb-20 px-8 max-w-7xl mx-auto z-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center mb-40">
          <div className="lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-urban-red text-white text-[9px] font-black uppercase tracking-[0.4em] px-3 py-1.5 inline-block">
                  System_Override_Active
                </span>
                <span className="text-white/20 text-[7px] font-mono uppercase tracking-widest hidden md:inline">
                  &gt; node_id: 403_B // status: restricted
                </span>
              </div>
              <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter leading-[0.8] uppercase italic glitch-text" data-text=">SYS_403">
                &gt;SYS<span className="text-[#00FF00]">_</span><br />
                <span className="text-stroke">403</span>
              </h1>
            </motion.div>
            
            <p className="max-w-xl text-lg md:text-xl uppercase tracking-[0.2em] font-bold leading-relaxed opacity-60 border-l border-white/20 pl-8">
              Donde el barrio se encuentra con el lujo. 
              <span className="text-urban-red"> Tu ADN no puede ser replicado.</span>
            </p>
          </div>

          <div className="lg:col-span-4">
             <Link 
               href="/laboratorio" 
               onMouseEnter={() => sounds.playHover()}
               onClick={() => sounds.playClick()}
               className="group bg-white text-black p-12 flex flex-col justify-between aspect-square hover:bg-urban-red hover:text-white transition-all duration-700 shadow-2xl relative overflow-hidden"
             >
                <Terminal size={40} className="relative z-10" />
                <div className="relative z-10">
                   <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 glitch-text" data-text="FORJAR ADN">FORJAR<br />MI ADN</h3>
                   <div className="flex justify-between items-center border-t border-current pt-6">
                      <span className="text-[10px] font-black uppercase tracking-widest">_inyectar_adn.exe</span>
                      <ArrowUpRight size={24} />
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                   <Biohazard size={180} />
                </div>
             </Link>
          </div>
        </div>

        {/* Minimal Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-white/5 border border-white/5">
          <div className="p-12 bg-black flex flex-col justify-between h-96 group hover:bg-white/5 transition-all">
             <LayoutGrid className="text-urban-red/40 group-hover:text-urban-red transition-colors" size={32} />
             <div>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Mapeo ADN</h4>
                <p className="text-[10px] uppercase tracking-widest leading-loose opacity-40">Precisión absoluta en cada inyección visual sobre la prenda.</p>
             </div>
          </div>

          <div className="p-12 bg-black flex flex-col justify-between h-96 group hover:bg-white/5 transition-all border-x border-white/5">
             <ShieldCheck className="text-urban-red/40 group-hover:text-urban-red transition-colors" size={32} />
             <div>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Cero Réplicas</h4>
                <p className="text-[10px] uppercase tracking-widest leading-loose opacity-40">Una vez forjada, tu pieza se retira del archivo mundial para siempre.</p>
             </div>
          </div>

          <div className="p-12 bg-black flex flex-col justify-between h-96 group hover:bg-white/5 transition-all">
             <Zap className="text-urban-red/40 group-hover:text-urban-red transition-colors" size={32} />
             <div>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Sobre-Carga</h4>
                <p className="text-[10px] uppercase tracking-widest leading-loose opacity-40">Múltiples capas de arte inyectadas en una sola arquitectura textil.</p>
             </div>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <div className="mt-32 text-center border-y border-white/10 py-16">
           <Link 
            href="/revista" 
            onMouseEnter={() => sounds.playStatic()}
            onClick={() => sounds.playClick()}
            className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic hover:text-urban-red transition-colors inline-block group"
           >
              Explorar el Archivo <span className="text-stroke group-hover:text-urban-red transition-colors">Digital</span>
           </Link>
        </div>
      </main>
    </div>
  );
}
