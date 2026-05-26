'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { products as localProducts, Product } from '@/lib/store';
import { X, ChevronLeft, ChevronRight, Maximize2, Zap, Palette, Terminal, ShoppingCart, Loader2 } from 'lucide-react';

import { sounds } from '@/lib/sounds';
import { useCart } from '@/lib/cartContext';
import { getProducts } from '@/lib/actions';

export default function Revista({ initialProducts }: { initialProducts: Product[] }) {
  const [dbProducts, setDbProducts] = useState<Product[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'T-SHIRTS' | 'HOODIES'>('ALL');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Sincronización con las props para actualizaciones en tiempo real tras revalidatePath
  React.useEffect(() => {
    setDbProducts(initialProducts);
  }, [initialProducts]);

  React.useEffect(() => {
    if (!selectedProduct) {
      setSelectedColor(null);
      setSelectedSize(null);
    }
  }, [selectedProduct]);

  // Sincronización: Siempre usar los productos que vienen de la base de datos
  const displayProducts = dbProducts.filter(p => 
    activeCategory === 'ALL' ? true : p.category === activeCategory
  );


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="text-urban-red animate-spin" size={48} />
      </div>
    );
  }

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

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap gap-4 pt-10">
          {[
            { id: 'ALL', label: 'TODO_EL_ARCHIVO' },
            { id: 'T-SHIRTS', label: 'T-SHIRTS' },
            { id: 'HOODIES', label: 'HOODIES' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playHover();
                setActiveCategory(cat.id as any);
              }}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] italic transition-all relative overflow-hidden group ${
                activeCategory === cat.id 
                  ? 'bg-urban-red text-white shadow-[0_0_30px_rgba(230,57,70,0.5)] border-transparent' 
                  : 'bg-white/5 text-white/40 border border-white/10 hover:border-urban-red hover:text-white'
              }`}
            >
              <span className="relative z-10">{cat.label}</span>
              {activeCategory === cat.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-urban-red -z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-24 relative z-10">
        {displayProducts.length === 0 ? (
          <div className="col-span-full h-[40vh] border-4 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10 uppercase tracking-[0.5em] italic">
             <Zap size={64} className="mb-6 animate-pulse" />
             <p className="text-xl font-black">ARCHIVO_VACÍO_SIN_ADN</p>
          </div>
        ) : (
          displayProducts.map((product, index) => (
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
                  className={`object-cover transition-all duration-1000 group-hover:scale-110 ${product.stock === 0 ? 'grayscale opacity-50' : 'grayscale group-hover:grayscale-0'}`}
                />
              )}
              
              {product.soldOut && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                   <div className="bg-urban-red text-white font-black text-2xl px-8 py-4 -rotate-12 border-4 border-white shadow-[0_0_50px_rgba(230,57,70,0.6)] uppercase tracking-[0.3em] glitch-text" data-text="AGOTADO">
                      AGOTADO
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
        ))
      )}
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
              className="absolute top-4 right-4 lg:top-10 lg:right-10 z-[510] p-4 lg:p-6 bg-urban-red text-white hover:bg-white hover:text-black transition-all shadow-2xl group"
            >
              <X className="w-6 h-6 lg:w-10 lg:h-10 group-hover:rotate-90 transition-transform duration-500" />
            </button>

            <div className="relative w-full lg:w-[65vw] h-[45vh] lg:h-full bg-[#0D0D0D] overflow-hidden border-b-4 lg:border-b-0 lg:border-r-8 border-white/5 shrink-0">
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
                      className="object-contain p-8 lg:p-32"
                    />
                  </motion.div>
               </AnimatePresence>

               <div className="absolute bottom-6 left-6 lg:bottom-16 lg:left-16 flex gap-3 lg:gap-6 z-20">
                  {selectedProduct.images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => { sounds.playHover(); setCurrentImageIndex(i); }}
                      className={`relative w-12 h-16 lg:w-20 lg:h-28 border-2 lg:border-4 transition-all overflow-hidden ${currentImageIndex === i ? 'border-urban-red shadow-[0_0_40px_rgba(230,57,70,0.4)] -translate-y-2 lg:-translate-y-4' : 'border-white/10 opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex-grow p-6 lg:p-16 flex flex-col overflow-y-auto custom-scrollbar bg-black text-white selection:bg-urban-red selection:text-white relative">
               <div className="absolute inset-0 pointer-events-none matrix-bg opacity-5"></div>
               <div className="space-y-10 lg:space-y-16 relative z-10">
                  <div className="space-y-6 lg:space-y-8">
                     <span className="bg-urban-red text-white text-[9px] lg:text-[11px] font-black uppercase tracking-[0.5em] lg:tracking-[0.8em] px-4 py-2 lg:px-6 lg:py-3 italic shadow-2xl inline-block tech-glow">
                        PIEZA UNICA FORJADA
                     </span>
                     <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic leading-[0.9] border-l-8 lg:border-l-12 border-urban-red pl-6 lg:pl-8 glitch-text" data-text={selectedProduct.name}>
                        {selectedProduct.name}
                     </h2>
                     <p className="text-2xl lg:text-4xl font-black text-urban-red italic tracking-tight underline decoration-4 lg:decoration-8 decoration-white/20 underline-offset-8 lg:underline-offset-16">{selectedProduct.price}</p>
                  </div>

                  <div className="space-y-6 border-t-4 lg:border-t-8 border-white/10 pt-8 lg:pt-12">
                     <h4 className="text-[12px] lg:text-[14px] font-black uppercase tracking-[0.4em] lg:tracking-[0.6em] text-[#00FF00] flex items-center gap-3 lg:gap-4">
                        <Terminal size={18} /> MANIFIESTO_VISUAL.txt
                     </h4>
                     <div className="lg:max-h-none pr-4 custom-scrollbar">
                        <p className="text-base lg:text-lg uppercase tracking-[0.1em] font-black italic leading-[1.6] lg:leading-[1.7] text-white/90 whitespace-pre-wrap">
                           {selectedProduct.description}
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t-4 lg:border-t-8 border-white/10 pt-8 lg:pt-12">
                    <div className="space-y-6">
                       <h4 className="text-[12px] lg:text-[14px] font-black uppercase tracking-[0.4em] lg:tracking-[0.6em] text-[#00FF00] flex items-center gap-3 lg:gap-4">
                          <Maximize2 size={18} /> DIMENSIÓN_ADN
                       </h4>
                       <div className="flex gap-3">
                          {['M', 'L', 'XL'].map((size) => (
                            <button 
                              key={size} 
                              onClick={() => { sounds.playHover(); setSelectedSize(size); }}
                              className={`flex-grow py-4 text-xs font-black border-2 transition-all ${selectedSize === size ? 'bg-urban-red border-urban-red text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                            >
                              {size}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <h4 className="text-[12px] lg:text-[14px] font-black uppercase tracking-[0.4em] lg:tracking-[0.6em] text-[#00FF00] flex items-center gap-3 lg:gap-4">
                             <Palette size={18} /> CROMA ADN
                          </h4>
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                             STOCK: <span className={selectedProduct.stock > 0 ? 'text-[#00FF00]' : 'text-urban-red'}>{selectedProduct.stock} UDS</span>
                          </span>
                       </div>
                       <div className="flex flex-wrap gap-3">
                          {selectedProduct.colors.map(color => (
                            <button 
                              key={color} 
                              onClick={() => { sounds.playHover(); setSelectedColor(color); }}
                              className={`flex flex-col items-center gap-2 group transition-all ${selectedColor === color ? 'scale-110' : 'opacity-60'}`}
                            >
                               <div className={`w-10 h-10 lg:w-12 lg:h-12 border-4 shadow-2xl transition-all ${selectedColor === color ? 'border-urban-red rotate-6' : 'border-white/5'}`} style={{ backgroundColor: color }} />
                               <span className={`text-[8px] font-black uppercase tracking-widest ${selectedColor === color ? 'text-white' : 'opacity-40'}`}>{color}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>

               <div className="pt-12 lg:pt-20 space-y-6 lg:space-y-8 relative z-10 mt-auto">
                  <button 
                    disabled={selectedProduct.soldOut || !selectedColor || !selectedSize}
                    onClick={() => {
                      if (selectedProduct && selectedColor && selectedSize) {
                        addToCart(selectedProduct, selectedColor, selectedSize);
                      }
                    }}
                    className={`w-full py-6 lg:py-10 text-base lg:text-lg font-black uppercase tracking-[0.5em] lg:tracking-[1em] italic transition-all shadow-[0_30px_80px_rgba(255,0,0,0.1)] flex items-center justify-center gap-4 lg:gap-6 group overflow-hidden relative ${selectedProduct.soldOut || !selectedColor || !selectedSize ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-urban-red hover:text-white'}`}
                  >
                     <span className="relative z-10">
                      {selectedProduct.soldOut ? 'ADN AGOTADO' : !selectedSize ? 'ELEGIR TALLA' : !selectedColor ? 'ELEGIR COLOR' : 'INYECTAR AL CARRITO'}
                     </span>
                     {!selectedProduct.soldOut && selectedColor && selectedSize && <ShoppingCart size={24} className="relative z-10 group-hover:scale-125 transition-transform" />}
                     <div className="absolute inset-0 bg-urban-red translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
                  <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] lg:tracking-[0.6em] text-center text-white/30 leading-loose">
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
