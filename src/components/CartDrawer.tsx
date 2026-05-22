'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingCart, Zap, Terminal, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { sounds } from '@/lib/sounds';
import { submitCatalogOrder } from '@/lib/actions';
import Image from 'next/image';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [customer, setCustomer] = React.useState({ name: '', email: '', whatsapp: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleCheckout = async () => {
    if (!customer.name || !customer.email || !customer.whatsapp) {
      sounds.playStatic();
      return;
    }

    setIsSubmitting(true);
    sounds.playClick();
    
    try {
      const res = await submitCatalogOrder({
        customer,
        items: cart,
        total: totalPrice
      });

      if (res.success) {
        // Preparar resumen detallado para WhatsApp (Lore-heavy, SIN links de imágenes)
        const itemsList = cart.map((item, index) => 
          `FRAGMENTO_0${index + 1}: ${item.product.name}\n- Dimensión: ${item.selectedSize}\n- Croma: ${item.selectedColor}\n- Cant: ${item.quantity} Uds`
        ).join('\n\n');
        
        const waMsg = `> *INFORME_DE_EXTRACCIÓN_SYS_403*\n\n*FORJADOR:* ${customer.name}\n*COMMS_WA:* ${customer.whatsapp}\n\n*CONTENIDO_DE_LA_BÓVEDA:*\n${itemsList}\n\n*VALOR_TOTAL_EXTRAÍDO:* $${totalPrice.toFixed(2)}\n\n_El ADN ha sido interceptado. Esperando sellado final en el bunker._`;
        const waUrl = `https://wa.me/573011138847?text=${encodeURIComponent(waMsg)}`;

        setShowSuccess(true);
        clearCart();
        setCustomer({ name: '', email: '', whatsapp: '' });
        
        // Redirección automática tras la animación de éxito (3 segundos)
        setTimeout(() => {
          window.open(waUrl, '_blank');
          setIsCartOpen(false);
          setShowSuccess(false);
        }, 3000);
      } else {
        throw new Error(res.error || 'SISTEMA_FUERA_DE_LINEA');
      }
    } catch (error: any) {
      sounds.playStatic();
      alert(`FALLA_SISTEMA: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Success Overlay Notification */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1100] flex items-center justify-center p-6"
              >
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md"></div>
                <div className="relative bg-black border-l-8 border-[#00FF00] p-10 shadow-[0_0_100px_rgba(0,255,0,0.2)] max-w-lg w-full overflow-hidden">
                   <div className="absolute inset-0 matrix-bg opacity-20"></div>
                   <div className="relative z-10 space-y-6 text-center">
                      <div className="w-20 h-20 bg-[#00FF00]/10 border-2 border-[#00FF00] mx-auto flex items-center justify-center animate-pulse">
                         <CheckCircle2 size={40} className="text-[#00FF00]" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white">PEDIDO_RECONOCIDO</h2>
                        <p className="text-[10px] font-black text-[#00FF00] uppercase tracking-[0.5em]">ADN inyectado con éxito</p>
                      </div>
                      <p className="text-sm font-bold text-white/60 leading-relaxed">
                        El sistema ha validado tu estructura. Redirigiendo al terminal de WhatsApp para el sellado final...
                      </p>
                      <div className="pt-4">
                        <div className="h-1 bg-white/10 w-full overflow-hidden">
                          <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '0%' }}
                            transition={{ duration: 3 }}
                            className="h-full bg-[#00FF00]"
                          />
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000]"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-[#050505] border-l border-white/10 z-[1001] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black">
              <div className="flex items-center gap-4">
                <ShoppingCart className="text-urban-red" size={24} />
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">CARRITO_ADN</h2>
                  <p className="text-[10px] font-black text-[#00FF00] tracking-widest uppercase opacity-60">Items en Bóveda: {totalItems}</p>
                </div>
              </div>
              <button 
                onClick={() => { sounds.playStatic(); setIsCartOpen(false); }}
                className="p-2 hover:bg-white/5 transition-colors group"
              >
                <X size={32} className="text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
              <div className="absolute inset-0 pointer-events-none matrix-bg opacity-5"></div>
              
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30 italic">
                  <Terminal size={48} />
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-center">Bóveda Vacía. <br /> Esperando Inyección de Datos.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-6 group relative"
                  >
                    <div className="relative w-24 h-32 bg-black border border-white/10 overflow-hidden shrink-0">
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter text-white leading-none">{item.product.name}</h3>
                        <div className="flex items-center gap-3">
                           {item.selectedColor && (
                             <div className="w-3 h-3 border border-white/20" style={{ backgroundColor: item.selectedColor }}></div>
                           )}
                           <span className="text-[10px] font-black text-urban-red uppercase tracking-widest">{item.selectedSize}</span>
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest border-l border-white/10 pl-3">{item.product.category}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-white/10 bg-black/50">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                            className="p-2 hover:bg-urban-red hover:text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-xs font-black font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                            className="p-2 hover:bg-urban-red hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-lg font-black text-urban-red italic font-mono">${(parseFloat(item.product.price.replace('$', '')) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                      className="absolute -top-2 -right-2 p-1.5 bg-urban-red text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 border-t border-white/10 bg-black space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-[#00FF00] tracking-widest uppercase opacity-60">Datos_de_Acceso</span>
                  <div className="grid grid-cols-1 gap-3">
                    <input 
                      type="text" 
                      placeholder="NOMBRE_COMPLETO" 
                      value={customer.name}
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black uppercase outline-none focus:border-urban-red transition-all"
                    />
                    <input 
                      type="email" 
                      placeholder="CORREO_ELECTRONICO" 
                      value={customer.email}
                      onChange={(e) => setCustomer({...customer, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black uppercase outline-none focus:border-urban-red transition-all"
                    />
                    <input 
                      type="text" 
                      placeholder="WHATSAPP (+57...)" 
                      value={customer.whatsapp}
                      onChange={(e) => setCustomer({...customer, whatsapp: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black uppercase outline-none focus:border-urban-red transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Valor Total del ADN</span>
                  <span className="text-4xl font-black text-white italic tracking-tighter underline decoration-4 decoration-urban-red underline-offset-8">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] italic hover:bg-urban-red hover:text-white transition-all flex items-center justify-center gap-4 group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">{isSubmitting ? 'SELLANDO_ORDEN...' : 'FINALIZAR_FORJA'}</span>
                  <Zap size={20} className={`relative z-10 ${isSubmitting ? 'animate-pulse' : 'group-hover:scale-125'} transition-transform`} />
                  <div className="absolute inset-0 bg-urban-red translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>

                <p className="text-[9px] font-black text-white/20 text-center uppercase tracking-widest">
                  Protocolo de seguridad activo. <br /> El inventario se reserva al finalizar.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
