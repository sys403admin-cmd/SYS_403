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
                <span className="bg-urban-red text-white text-[9px] font-black uppercase tracking-[0.4em] px-3 py-1.5 inline-block animate-pulse">
                  PROTOCOL_BREACH_DETECTED
                </span>
                <span className="text-white/20 text-[7px] font-mono uppercase tracking-widest hidden md:inline">
                  &gt; error_code: 403 // access: denied // status: converting_to_aesthetic
                </span>
              </div>
              <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter leading-[0.8] uppercase italic glitch-text" data-text=">SYS_403">
                &gt;SYS<span className="text-[#00FF00]">_</span><br />
                <span className="text-stroke">403</span>
              </h1>
            </motion.div>
            
            <p className="max-w-xl text-lg md:text-xl uppercase tracking-[0.2em] font-bold leading-relaxed opacity-60 border-l border-urban-red pl-8 mb-12">
              No somos una marca. Somos el umbral que el sistema te niega. 
              <span className="text-urban-red block mt-4"> Lo que ellos prohíben, nosotros lo vestimos.</span>
            </p>

            <Link 
              href="/laboratorio" 
              onClick={() => sounds.playClick()}
              className="inline-flex items-center gap-6 bg-urban-red text-white px-10 py-6 font-black uppercase tracking-[0.4em] italic hover:bg-white hover:text-black transition-all active:scale-95 md:hidden w-full justify-center shadow-[0_20px_40px_rgba(230,57,70,0.3)]"
            >
               FORJAR TU ADN <ArrowUpRight size={20} />
            </Link>
          </div>

          <div className="lg:col-span-4 hidden md:block">
             <Link 
               href="/laboratorio" 
               onMouseEnter={() => sounds.playHover()}
               onClick={() => sounds.playClick()}
               className="group bg-white text-black p-12 flex flex-col justify-between aspect-square hover:bg-urban-red hover:text-white transition-all duration-700 shadow-2xl relative overflow-hidden border-8 border-transparent hover:border-white/20"
             >
                <Terminal size={40} className="relative z-10" />
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-40 group-hover:opacity-100">_forjar_tu_adn.exe</p>
                   <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 glitch-text" data-text="FORJAR TU ADN">FORJAR TU<br />ADN</h3>
                   <div className="flex justify-between items-center border-t border-current pt-6">
                      <span className="text-[10px] font-black uppercase tracking-widest">inyectar_adn_prohibido</span>
                      <ArrowUpRight size={24} />
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                   <Biohazard size={180} />
                </div>
             </Link>
          </div>
        </div>

        {/* Brand Philosophy Section - Mobile Optimized */}
        <section className="mb-40 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
           <div className="space-y-8 border-t border-white/10 pt-12">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-2 bg-urban-red"></div>
                 <span className="text-urban-red text-[10px] font-black uppercase tracking-[0.5em]">Manifiesto_v1.0</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">Lo que el sistema niega, nosotros lo convertimos en estética.</h2>
              <div className="space-y-6 text-sm md:text-base uppercase tracking-widest leading-loose opacity-60 font-bold italic">
                 <p className="border-l-2 border-white/10 pl-6">SYS_403 es un código de error con identidad propia. 403 significa «acceso denegado». Lo que el sistema te prohíbe, nosotros lo convertimos en advertencia silenciosa.</p>
                 <p className="border-l-2 border-urban-red pl-6">Nuestras prendas no buscan entrar. Buscan ser el umbral que otros no pueden cruzar.</p>
              </div>
           </div>
           <div className="relative aspect-video md:aspect-square bg-white/5 overflow-hidden flex items-center justify-center group border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-urban-red/20 to-transparent opacity-40 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700"></div>
              <span className="text-white/10 text-9xl md:text-[15rem] font-black italic select-none group-active:scale-110 md:group-hover:scale-110 transition-transform duration-1000">403</span>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm md:backdrop-blur-none">
                 <Biohazard size={48} className="text-urban-red mb-4 animate-spin-slow" />
                 <span className="bg-urban-red text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.5em] shadow-[0_0_30px_rgba(230,57,70,0.5)]">ACCESO_CONCEDIDO_AL_ERROR</span>
              </div>
           </div>
        </section>

        {/* Minimal Features Grid - Interactive on Tap */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-white/10 border border-white/10 shadow-2xl">
          {[
            {
              icon: LayoutGrid,
              title: "Fragmentos de Código",
              desc: "Cada estampado es un sistema que se niega a obedecer. Una pantalla de error que decidió vestirse."
            },
            {
              icon: ShieldCheck,
              title: "Cero Permisos",
              desc: "Para los que entienden que «no tienes permiso» es el mejor cumplido del sistema."
            },
            {
              icon: Zap,
              title: "Estética del Glitch",
              desc: "Convertimos el fallo del servidor en la pieza más exclusiva de tu archivo."
            }
          ].map((feature, i) => (
            <div key={i} className="p-12 bg-black flex flex-col justify-between h-80 md:h-96 group relative overflow-hidden active:bg-white/5 md:hover:bg-white/5 transition-all">
               <div className="absolute top-0 left-0 w-1 h-0 bg-urban-red group-active:h-full md:group-hover:h-full transition-all duration-500"></div>
               <feature.icon className="text-urban-red/40 group-active:text-urban-red md:group-hover:text-urban-red transition-colors relative z-10" size={32} />
               <div className="relative z-10">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{feature.title}</h4>
                  <p className="text-[10px] uppercase tracking-widest leading-loose opacity-40 group-active:opacity-100 md:group-hover:opacity-80 transition-opacity">{feature.desc}</p>
               </div>
            </div>
          ))}
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
