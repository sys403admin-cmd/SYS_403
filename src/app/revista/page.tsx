'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { products, Product } from '@/lib/store';
import { X, ChevronLeft, ChevronRight, Maximize2, Zap, Palette } from 'lucide-react';

import { sounds } from '@/lib/sounds';

export default function Revista() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="pt-40 pb-20 px-8 max-w-[1600px] mx-auto min-h-screen relative overflow-hidden">
      {/* Matrix Overlay */}
      <div className="fixed inset-0 pointer-events-none matrix-bg opacity-5"></div>

      <header className="mb-24 space-y-4 relative z-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-1.5 bg-urban-red shadow-[0_0_15px_rgba(255,0,0,0.5)]"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#00FF00] italic">Archivo de Sistema // restricted_access</span>
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] glitch-text" data-text="ARCHIVO DIGITAL">
          ARCHIVO<br />
          <span className="text-stroke text-white">DIGITAL</span>
        </h1>
        <p className="text-[12px] md:text-[14px] uppercase tracking-[0.3em] font-bold opacity-60 max-w-2xl leading-relaxed italic border-l-2 border-urban-red pl-6">
          Piezas únicas forjadas bajo demanda. Una vez que un diseño encuentra dueño, el ADN se borra del sistema para siempre.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-24 relative z-10">
        {products.map((product, index) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            className="group cursor-crosshair"
            onClick={() => {
              sounds.playClick();
              setSelectedProduct(product);
              setCurrentImageIndex(0);
            }}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-black border-4 border-white/5 group-hover:border-urban-red transition-all duration-700 shadow-2xl group-hover:shadow-[0_40px_80px_rgba(230,57,70,0.3)]">
              {product.images[0] && (
                <Image 
                  src={product.images[0]} 
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-1000 group-hover:scale-110 ${product.soldOut ? 'grayscale opacity-50' : 'grayscale group-hover:grayscale-0'}`}
                />
              )}
              
              {product.soldOut && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                   <div className="bg-urban-red text-white font-black text-2xl px-8 py-4 -rotate-12 border-4 border-white shadow-[0_0_50px_rgba(230,57,70,0.6)] uppercase tracking-[0.3em] glitch-text" data-text="RECLAMADO">
                      RECLAMADO
                   </div>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                 {!product.soldOut && (
                    <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center border-8 border-black shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 rotate-12">
                       <Maximize2 size={32} className="text-black mb-1" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-black">INYECTAR</span>
                    </div>
                 )}
              </div>

              <div className="absolute top-8 left-8 flex flex-col gap-2">
                <span className="bg-urban-red text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 shadow-2xl italic tech-glow">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="flex justify-between items-end border-b-4 border-white/10 pb-4">
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-none group-hover:text-urban-red transition-colors text-white">{product.name}</h3>
                  <div className="flex gap-2">
                     {product.colors.map((c, i) => (
                        <div key={i} className="w-4 h-4 border-2 border-white/10 shadow-sm" style={{ backgroundColor: c }} />
                     ))}
                  </div>
                </div>
                <p className="text-2xl font-black text-white tracking-tight italic underline decoration-4 decoration-urban-red underline-offset-8">{product.price}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black flex flex-col lg:flex-row overflow-hidden font-sans"
          >
            <button 
              onClick={() => { sounds.playStatic(); setSelectedProduct(null); }}
              className="absolute top-10 right-10 z-[510] p-6 bg-urban-red text-white hover:bg-white hover:text-black transition-all shadow-2xl group"
            >
              <X size={40} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>

            <div className="relative w-full lg:w-[65vw] h-[50vh] lg:h-full bg-[#0D0D0D] overflow-hidden border-r-8 border-white/5">
               <div className="absolute inset-0 pointer-events-none matrix-bg opacity-10"></div>
               <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full h-full"
                  >
                    <Image 
                      src={selectedProduct.images[currentImageIndex]} 
                      alt={selectedProduct.name}
                      fill
                      className="object-cover lg:object-contain p-10 lg:p-32"
                    />
                  </motion.div>
               </AnimatePresence>

               <div className="absolute bottom-16 left-16 flex gap-6 z-20">
                  {selectedProduct.images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => { sounds.playHover(); setCurrentImageIndex(i); }}
                      className={`relative w-20 h-28 border-4 transition-all overflow-hidden ${currentImageIndex === i ? 'border-urban-red shadow-[0_0_40px_rgba(230,57,70,0.4)] translate-y-[-15px]' : 'border-white/10 opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex-grow p-12 lg:p-24 flex flex-col justify-between overflow-y-auto custom-scrollbar bg-black text-white selection:bg-urban-red selection:text-white relative">
               <div className="absolute inset-0 pointer-events-none matrix-bg opacity-5"></div>
               <div className="space-y-20 relative z-10">
                  <div className="space-y-8">
                     <span className="bg-urban-red text-white text-[11px] font-black uppercase tracking-[0.8em] px-6 py-3 italic shadow-2xl inline-block tech-glow">
                        PIEZA UNICA FORJADA
                     </span>
                     <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter italic leading-[0.8] border-l-12 border-urban-red pl-8 glitch-text" data-text={selectedProduct.name}>
                        {selectedProduct.name}
                     </h2>
                     <p className="text-5xl font-black text-urban-red italic tracking-tight underline decoration-8 decoration-white/20 underline-offset-16">{selectedProduct.price}</p>
                  </div>

                  <div className="space-y-10 border-t-8 border-white/10 pt-16">
                     <h4 className="text-[14px] font-black uppercase tracking-[0.6em] text-[#00FF00] flex items-center gap-4">
                        <Terminal size={20} /> MANIFIESTO_VISUAL.txt
                     </h4>
                     <p className="text-lg md:text-xl uppercase tracking-[0.1em] font-black italic leading-[1.8] opacity-90">
                        {selectedProduct.description}
                     </p>
                  </div>

                  <div className="space-y-10 border-t-8 border-white/10 pt-16">
                     <h4 className="text-[14px] font-black uppercase tracking-[0.6em] text-[#00FF00] flex items-center gap-4">
                        <Palette size={20} /> PALETA ADN AUTORIZADA
                     </h4>
                     <div className="flex flex-wrap gap-6">
                        {selectedProduct.colors.map(color => (
                          <div key={color} className="flex flex-col items-center gap-4 group">
                             <div className="w-16 h-16 border-8 border-white/5 shadow-2xl group-hover:scale-110 transition-transform group-hover:rotate-6" style={{ backgroundColor: color }} />
                             <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{color}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="pt-32 space-y-10 relative z-10">
                  <button 
                    disabled={selectedProduct.soldOut}
                    onClick={() => sounds.playClick()}
                    className={`w-full py-10 text-lg font-black uppercase tracking-[1em] italic transition-all shadow-[0_30px_80px_rgba(255,0,0,0.1)] flex items-center justify-center gap-6 group overflow-hidden relative ${selectedProduct.soldOut ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-urban-red hover:text-white'}`}
                  >
                     <span className="relative z-10">{selectedProduct.soldOut ? 'ADN RECLAMADO' : 'RECLAMAR EXCLUSIVIDAD'}</span>
                     {!selectedProduct.soldOut && <Zap size={28} className="fill-current group-hover:scale-125 transition-transform relative z-10" />}
                     <div className="absolute inset-0 bg-urban-red translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] text-center text-white/30 leading-loose">
                     AL EJECUTAR LA COMPRA, EL ADN SE RETIRA DEL ARCHIVO MUNDIAL PERMANENTE. <br /> NO SE ADMITEN REPLICAS.
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

