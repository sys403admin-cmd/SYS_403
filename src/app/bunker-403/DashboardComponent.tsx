'use client';

import React, { useState, useEffect, Suspense, useMemo, memo } from 'react';
import { Product, CustomOrder } from '@/lib/store';
import { 
  Trash2, Plus, Package, MessageSquare, X, Upload, Palette, Target, 
  Zap, ShieldCheck, User, Lock, Terminal, Box, ChevronDown, 
  ArrowUpRight, Eye, Clock, CheckCircle, Truck, Trash, AlertTriangle, Loader2 
} from 'lucide-react';
import Image from 'next/image';
import { sounds } from '@/lib/sounds';
import { supabase } from '@/lib/supabase';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadDNA } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import OrderScene3D from './OrderScene3D';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('orders');
  const [liveOrders, setLiveOrders] = useState<CustomOrder[]>([]);
  const [previewOrder, setPreviewOrder] = useState<CustomOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newItem, setNewItem] = useState<Partial<Product>>({ 
    name: '', 
    price: '', 
    category: 'T-SHIRTS', 
    images: [], 
    description: '', 
    colors: ['#000000'],
    stock: 10
  });
  const [colorInput, setColorInput] = useState('#000000');

  const addColor = () => {
    if (colorInput && !newItem.colors?.includes(colorInput)) {
      setNewItem(prev => ({ ...prev, colors: [...(prev.colors || []), colorInput] }));
    }
  };

  const removeColor = (color: string) => {
    setNewItem(prev => ({ ...prev, colors: prev.colors?.filter(c => c !== color) }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchInitialProducts();
    }
  }, [isAuthenticated]);

  const fetchInitialProducts = async () => {
    setIsLoadingProducts(true);
    const data = await getProducts();
    setLocalProducts(data);
    setIsLoadingProducts(false);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) setLiveOrders(data as CustomOrder[]);
    if (error) console.error("Error fetching live orders:", error);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [productDeleteId, setProductDeleteId] = useState<number | null>(null);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    sounds.playClick();
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) {
      setLiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const deleteOrder = async (orderId: number) => {
    sounds.playStatic();
    // Optimistic Update: Remove from UI immediately to eliminate perceived lag
    const previousOrders = [...liveOrders];
    setLiveOrders(prev => prev.filter(o => o.id !== orderId));
    setDeleteConfirmId(null);

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (error) {
      console.error("Error deleting order:", error);
      // Rollback if DB fails
      setLiveOrders(previousOrders);
      alert("FALLA_AL_ELIMINAR: El registro sigue en la base de datos.");
    } else {
      sounds.playClick();
    }
  };

  const OrderCard = memo(({ order }: { order: CustomOrder }) => {
    const rawDesigns = typeof order.designs === 'string' ? JSON.parse(order.designs) : order.designs;
    const isCatalog = order.garmenttype === 'CATALOGO';
    const designsList = (rawDesigns?.payload || rawDesigns || []) as any[];

    return (
      <div className="bg-[#0D0D0D] border-t-8 border-urban-red p-6 lg:p-10 flex flex-col gap-8 hover:bg-[#111111] transition-all relative group shadow-2xl">
        <div className="absolute top-4 right-6 text-[8px] font-black text-white/10 uppercase tracking-widest">#{order.id.toString().slice(-8)}</div>
        
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <h3 className="text-4xl font-black uppercase italic text-white group-hover:text-urban-red transition-colors leading-none">{order.name}</h3>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                   <span className="text-urban-red">{order.whatsapp}</span>
                   <span className="text-white/20">|</span>
                   <span className={isCatalog ? 'text-[#00FF00]' : 'text-white/40'}>
                     {isCatalog ? 'ORDEN_CATÁLOGO' : `FORJA_${order.garmenttype} // TALLA ${order.size}`}
                   </span>
                </div>
             </div>
             <div className={`px-4 py-2 border font-black uppercase italic text-[10px] tracking-widest ${getStatusStyle(order.status)}`}>
                {order.status}
             </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
             {isCatalog ? (
                designsList.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2 min-w-[100px] bg-white/5 p-2 border border-white/10">
                     <div className="relative aspect-square bg-black overflow-hidden">
                       <Image src={item.product.images[0]} alt="" fill className="object-cover" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[7px] font-black text-[#00FF00] uppercase truncate">{item.product.name}</p>
                        <p className="text-[6px] font-black text-white/40 uppercase">{item.selectedSize} // {item.quantity} UDS</p>
                     </div>
                  </div>
                ))
             ) : (
                designsList.map((d: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2 min-w-[140px] group/item bg-white/5 p-2 border border-white/10">
                     <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
                       {d.url ? (
                          <>
                            <Image src={d.url} alt="" fill className="object-contain p-2" />
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                const response = await fetch(d.url);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `adn_${order.name}_${d.zone}.png`;
                                a.click();
                              }}
                              className="absolute inset-0 bg-urban-red/90 opacity-0 group-hover/item:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2"
                            >
                              <ArrowUpRight size={18} />
                              <span className="text-[8px] font-black">DESCARGAR</span>
                            </button>
                          </>
                       ) : <Zap size={12} className="text-white/10" />}
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-urban-red uppercase">{d.zone}</p>
                        <div className="grid grid-cols-3 gap-1 text-[7px] font-mono text-white/40 uppercase">
                           <span>X:{d.position?.[0]?.toFixed(2)}</span>
                           <span>Y:{d.position?.[1]?.toFixed(2)}</span>
                           <span>S:{d.scale?.[0]?.toFixed(2)}</span>
                        </div>
                     </div>
                  </div>
                ))
             )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 items-center border-t border-white/5 pt-6">
             <div className="flex gap-2 shrink-0">
                {[
                  { s: 'Pendiente', i: Clock },
                  { s: 'En Forja', i: Zap },
                  { s: 'Listo', i: CheckCircle },
                  { s: 'Entregado', i: Truck }
                ].map((state) => (
                  <button 
                    key={state.s}
                    onClick={() => updateOrderStatus(order.id, state.s)}
                    className={`p-3 border transition-all ${order.status === state.s ? 'bg-white text-black border-white' : 'border-white/10 text-white/20 hover:border-white/40'}`}
                    title={state.s}
                  >
                    <state.i size={16} />
                  </button>
                ))}
             </div>

             <div className="flex gap-4 w-full">
                {!isCatalog && (
                  <button 
                    onClick={() => { sounds.playClick(); setPreviewOrder(order); }}
                    className="flex-grow bg-[#00FF00] text-black py-4 font-black uppercase text-sm hover:bg-white transition-all italic flex items-center justify-center gap-3"
                  >
                     VISUALIZAR ADN 3D <Eye size={18} />
                  </button>
                )}
                <a 
                  href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  className="w-16 bg-[#25D366] flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                   <MessageSquare size={24} />
                </a>
                <button 
                  onClick={() => { sounds.playStatic(); setDeleteConfirmId(order.id); }}
                  className="w-16 border border-white/10 flex items-center justify-center hover:bg-urban-red hover:text-white transition-all"
                >
                   <Trash size={24} />
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  });
  OrderCard.displayName = 'OrderCard';

  const toggleProductSoldOut = async (product: Product) => {
    sounds.playClick();
    const newStatus = !product.soldOut;
    const res = await updateProduct(product.id, { soldOut: newStatus });
    if (res.success) {
      setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, soldOut: newStatus } : p));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    sounds.playStatic();
    const res = await deleteProduct(id);
    if (res.success) {
      setLocalProducts(prev => prev.filter(p => p.id !== id));
      setProductDeleteId(null);
      sounds.playClick();
      alert("SISTEMA_LIMPIO: Producto eliminado permanentemente.");
    } else {
      console.error("FALLA_PURGA_PRODUCTO:", res.error);
      alert(`FALLA_CRITICA_AL_ELIMINAR: ${res.error}`);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Pendiente': return 'border-urban-red text-urban-red bg-urban-red/5';
      case 'En Forja': return 'border-orange-500 text-orange-500 bg-orange-500/5';
      case 'Listo': return 'border-[#00FF00] text-[#00FF00] bg-[#00FF00]/5';
      case 'Entregado': return 'border-white text-white opacity-40';
      default: return 'border-white/10 text-white/40';
    }
  };

  const handleLogin = () => {
    const now = Date.now();
    if (now - lastAttemptTime < 2000) { 
      sounds.playStatic();
      return;
    }
    setLastAttemptTime(now);
    
    if (password === 'SYS403_BUNKER') {
      sounds.playClick();
      setIsAuthenticated(true);
    } else {
      setLoginAttempts(prev => prev + 1);
      sounds.playStatic();
      alert(`ACCESO DENEGADO. INTENTO ${loginAttempts + 1}/3 REGISTRADO.`);
      if (loginAttempts >= 2) {
        alert("SISTEMA BLOQUEADO TEMPORALMENTE.");
        setLastAttemptTime(now + 30000);
      }
    }
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const MAX_SIZE = 4 * 1024 * 1024; // 4MB límite de Vercel
      Array.from(e.target.files).forEach(file => {
        if (file.size > MAX_SIZE) {
          alert(`ARCHIVO_DEMASIADO_GRANDE: "${file.name}" supera los 4MB. Redúcelo antes de subir.`);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            setNewItem(prev => ({ ...prev, images: [...(prev.images || []), reader.result as string] }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    sounds.playClick();
    
    try {
      console.log("> INICIANDO_INYECCION_PRODUCTO");
      
      // 1. Subir imágenes (Una por una para mejor control)
      const uploadedUrls: string[] = [];
      for (let i = 0; i < (newItem.images || []).length; i++) {
        const img = newItem.images![i];
        if (img.startsWith('data:')) {
          console.log(`> SUBIENDO_IMAGEN_${i+1}...`);
          const fd = new FormData();
          fd.append('file', img);
          fd.append('fileName', `product_${Date.now()}_${i}.png`);
          const url = await uploadDNA(fd);
          if (url) uploadedUrls.push(url);
        } else {
          uploadedUrls.push(img);
        }
      }

      console.log("> IMAGENES_LISTAS_PARA_DB");

      const productData = {
        ...newItem,
        images: uploadedUrls.filter(Boolean) as string[],
        colors: newItem.colors || ['#000000']
      };

      // 2. Crear producto en DB
      const res = await createProduct(productData);
      
      if (res.success && res.data) {
        setLocalProducts(prev => [...prev, res.data as Product]);
        setNewItem({ 
          name: '', 
          price: '', 
          category: 'T-SHIRTS', 
          images: [], 
          description: '', 
          colors: ['#000000'],
          stock: 10 
        });
        sounds.playClick();
        alert("INYECTADO_CON_EXITO: El producto ya es parte del archivo.");
      } else {
        throw new Error(res.error || "ERROR_DESCONOCIDO_DB");
      }
    } catch (err: any) {
      console.error("--- FALLA_SISTEMA_BUNKER ---", err.message);
      alert("FALLA_CRITICA: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8 crt">
        <div className="w-full max-w-md space-y-12 border-l-8 border-urban-red p-12 bg-[#0A0A0A] shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-urban-red/30">SECURE_SHELL_V4</div>
          <div className="text-center space-y-4">
            <Lock className="mx-auto text-urban-red animate-pulse" size={64} />
            <h1 className="text-5xl font-black uppercase italic tracking-tighter glitch-text" data-text="BUNKER_403">BUNKER<br />403</h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#00FF00] italic animate-pulse">Waiting for Auth_Key...</p>
          </div>
          <div className="space-y-6">
            <input 
              type="password" 
              placeholder="ENCRYPTED_KEY" 
              className="w-full bg-white/5 border-b-4 border-urban-red p-5 text-center text-xl font-black outline-none focus:bg-white/10 transition-all uppercase tracking-[0.2em] text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button 
              onClick={handleLogin}
              className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.8em] text-xs hover:bg-urban-red hover:text-white transition-all shadow-2xl relative group overflow-hidden"
            >
              <span className="relative z-10">DESCIFRAR</span>
              <div className="absolute inset-0 bg-urban-red translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row font-sans selection:bg-urban-red overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-[#050505] border-r-4 border-urban-red p-8 space-y-12 z-20 flex flex-col justify-between lg:h-screen sticky top-0 shrink-0 shadow-[20px_0_100px_rgba(230,57,70,0.1)]">
        <div className="space-y-12">
           <div className="space-y-4 text-center lg:text-left">
              <div className="relative inline-block">
                 <ShieldCheck className="text-urban-red animate-pulse mb-2" size={48} />
                 <div className="absolute -inset-1 bg-urban-red blur-lg opacity-20"></div>
              </div>
              <div>
                 <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.8] text-white glitch-text" data-text="SYS_403">SYS_<br /><span className="text-urban-red">403</span></h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#00FF00] mt-3 border-t border-white/10 pt-3 italic">Jerarquía de Sistema</p>
              </div>
           </div>
           
           <nav className="space-y-4">
             <button onClick={() => { sounds.playHover(); setActiveTab('orders'); }} className={`w-full flex items-center justify-between p-5 font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group ${activeTab === 'orders' ? 'bg-urban-red text-white scale-105 shadow-[0_0_40px_rgba(230,57,70,0.4)]' : 'border-2 border-white/5 text-white/30 hover:border-urban-red hover:text-white hover:scale-105'}`}>
               <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
               <span className="relative z-10 flex items-center gap-4 text-sm"><Terminal size={20} /> LOGS</span>
               <span className="relative z-10 text-[11px] bg-black/40 px-3 py-1 italic">{liveOrders.length}</span>
             </button>
             <button onClick={() => { sounds.playHover(); setActiveTab('catalog'); }} className={`w-full flex items-center justify-between p-5 font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group ${activeTab === 'catalog' ? 'bg-urban-red text-white scale-105 shadow-[0_0_40px_rgba(230,57,70,0.4)]' : 'border-2 border-white/5 text-white/30 hover:border-urban-red hover:text-white hover:scale-105'}`}>
               <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
               <span className="relative z-10 flex items-center gap-4 text-sm"><Package size={20} /> ARCHIVO</span>
               <span className="relative z-10 text-[11px] bg-black/40 px-3 py-1 italic">{localProducts.length}</span>
             </button>
           </nav>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-transparent p-6 border-l-4 border-urban-red space-y-4 relative overflow-hidden hidden lg:block">
           <div className="absolute top-0 right-0 w-20 h-20 bg-urban-red opacity-5 rotate-45 translate-x-10 -translate-y-10"></div>
           <div className="flex items-center gap-3 text-urban-red relative z-10">
              <User size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">CAPO_TERMINAL</span>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 leading-relaxed relative z-10">
              Protocolo de <br />
              Exclusividad Total
           </p>
        </div>
      </div>

      {/* Main Command Center */}
      <div className="flex-grow p-4 lg:p-20 overflow-y-auto custom-scrollbar bg-black relative">
        <div className="fixed inset-0 pointer-events-none matrix-bg opacity-10"></div>

        {activeTab === 'orders' ? (
          <div className="space-y-12 lg:space-y-20 relative z-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-3 bg-urban-red"></div>
                   <span className="text-urban-red text-xs font-black uppercase tracking-[0.5em]">INCOMING_ADN</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none glitch-text" data-text="PEDIDOS">PEDIDOS<br /><span className="text-stroke text-white/5">SISTEMA</span></h1>
              </div>
            </header>

            <div className="flex flex-col gap-10 max-w-5xl">
              {liveOrders.length === 0 ? (
                <div className="h-[40vh] border-4 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10 uppercase tracking-[0.5em] italic">
                   <Zap size={64} className="mb-6 animate-pulse" />
                   <p className="text-xl font-black">SILENCIO_EN_EL_BARRIO</p>
                </div>
              ) : (
                liveOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-16 lg:space-y-24 relative z-10">
            <header className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-2 bg-urban-red"></div>
                  <span className="text-urban-red text-xs font-black uppercase tracking-[0.5em]">STOCK_ARCHITECTURE</span>
               </div>
               <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">ARCHIVO<br /><span className="text-stroke text-white/5">SISTEMA</span></h1>
            </header>

            <form onSubmit={handleAddProduct} className="bg-[#050505] border-l-4 border-urban-red p-6 lg:p-10 space-y-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-urban-red/5 -rotate-45 translate-x-16 -translate-y-16"></div>
               
               <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <Terminal size={20} className="text-urban-red" />
                  <h3 className="text-lg font-black uppercase italic tracking-widest text-white">INYECCIÓN_ADN_PRODUCTO</h3>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 relative group/input">
                           <span className="absolute -top-2 left-4 bg-[#050505] px-2 text-[7px] font-black text-urban-red tracking-widest uppercase italic z-10">IDENTIDAD</span>
                           <input type="text" placeholder="NOMBRE DE LA FORJA" className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black uppercase outline-none focus:border-urban-red transition-all text-white" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                        </div>
                        <div className="relative">
                           <span className="absolute -top-2 left-4 bg-[#050505] px-2 text-[7px] font-black text-urban-red tracking-widest uppercase italic z-10">VALOR</span>
                           <input type="text" placeholder="$0.00" className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black uppercase outline-none focus:border-urban-red transition-all text-white" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                           <span className="absolute -top-2 left-4 bg-[#050505] px-2 text-[7px] font-black text-urban-red tracking-widest uppercase italic z-10">CORTE</span>
                           <select className="w-full bg-white/5 border border-white/10 p-3 text-[10px] font-black uppercase outline-none cursor-pointer focus:border-urban-red appearance-none text-white" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                              <option value="T-SHIRTS">T-SHIRT OVERSIZE</option>
                              <option value="HOODIES">HOODIE OVERSIZE</option>
                           </select>
                        </div>
                        <div className="relative">
                           <span className="absolute -top-2 left-4 bg-[#050505] px-2 text-[7px] font-black text-urban-red tracking-widest uppercase italic z-10">STOCK_UDS</span>
                           <input type="number" placeholder="10" className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black uppercase outline-none focus:border-urban-red transition-all text-white" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})} required />
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="color" className="w-8 h-8 bg-transparent border-none cursor-pointer shrink-0" value={colorInput} onChange={e => setColorInput(e.target.value)} />
                           <button type="button" onClick={addColor} className="flex-grow py-2.5 border border-urban-red text-urban-red text-[8px] font-black uppercase hover:bg-urban-red hover:text-white transition-all">Añadir Croma</button>
                        </div>
                     </div>

                     {/* Image Strip */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-black uppercase tracking-widest text-white/20">MULTIMEDIA_ADN</span>
                           <span className="text-[8px] font-black text-urban-red">{newItem.images?.length || 0} / 6</span>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                           {newItem.images?.map((img, i) => (
                              <div key={i} className="relative aspect-square border border-white/10 bg-black group/img">
                                 <Image src={img} alt="" fill className="object-cover opacity-60" />
                                 <button type="button" onClick={() => setNewItem(prev => ({...prev, images: prev.images?.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-urban-red/80 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"><X size={14}/></button>
                              </div>
                           ))}
                           {(newItem.images?.length || 0) < 6 && (
                              <label className="aspect-square border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-urban-red transition-all hover:bg-white/5">
                                 <Plus size={16} className="text-white/20" />
                                 <input type="file" multiple className="hidden" onChange={handleFileAdd} />
                              </label>
                           )}
                        </div>
                     </div>
                  </div>
                  
                  {/* Right Column - Manifesto & Colors */}
                  <div className="lg:col-span-4 space-y-6">
                     <div className="relative h-[120px]">
                        <span className="absolute -top-2 left-4 bg-[#050505] px-2 text-[7px] font-black text-urban-red tracking-widest uppercase italic z-10">MANIFIESTO</span>
                        <textarea placeholder="ESENCIA DEL BARRIO..." className="w-full h-full bg-white/5 border border-white/10 p-3 text-[10px] font-bold uppercase outline-none resize-none italic focus:border-urban-red transition-all text-white custom-scrollbar" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} required />
                     </div>
                     <div className="bg-white/5 p-3 border border-white/10 min-h-[60px]">
                        <span className="text-[7px] font-black text-urban-red uppercase tracking-widest block mb-2">CROMA_ACTIVO</span>
                        <div className="flex flex-wrap gap-1.5">
                           {newItem.colors?.map(c => (
                              <div key={c} className="flex items-center gap-1.5 bg-black p-1 border border-white/5 pr-2">
                                 <div className="w-4 h-4" style={{ backgroundColor: c }}></div>
                                 <span className="text-[6px] font-mono">{c}</span>
                                 <button type="button" onClick={() => removeColor(c)} className="text-urban-red hover:text-white transition-colors"><X size={10}/></button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] italic hover:bg-urban-red hover:text-white transition-all shadow-xl flex items-center justify-center gap-4 group disabled:opacity-50">
                  {isSubmitting ? (
                    <>EJECUTANDO_INYECCIÓN... <Loader2 size={14} className="animate-spin" /></>
                  ) : (
                    <>PUBLICAR_EN_EL_ARCHIVO <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
               </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
               {isLoadingProducts ? (
                 <div className="col-span-full h-40 flex items-center justify-center text-white/10 italic uppercase tracking-[0.5em]">
                    <Loader2 size={32} className="animate-spin mr-4" /> RECUERANDO_ARCHIVOS...
                 </div>
               ) : localProducts.length === 0 ? (
                 <div className="col-span-full h-40 border border-white/5 flex items-center justify-center text-white/10 italic uppercase tracking-[0.5em]">
                    ARCHIVO_VACÍO
                 </div>
               ) : (
                 localProducts.map((p) => (
                  <div key={p.id} className="bg-[#0A0A0A] border border-white/5 p-6 group relative overflow-hidden hover:border-urban-red/50 transition-all shadow-2xl">
                     <div className="relative aspect-square mb-6 overflow-hidden border border-white/5 bg-black">
                        {p.images[0] ? <Image src={p.images[0]} alt="" fill className={`object-cover transition-all duration-700 group-hover:scale-105 ${p.soldOut ? 'grayscale opacity-20' : 'grayscale group-hover:grayscale-0'}`} /> : <Package size={48} className="text-white/5" />}
                        <button onClick={() => setProductDeleteId(p.id)} className="absolute top-4 right-4 bg-urban-red text-white p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20}/></button>
                        
                        {p.soldOut && (
                          <div className="absolute inset-0 flex items-center justify-center">
                             <span className="bg-urban-red text-white text-[10px] font-black px-4 py-2 -rotate-12 border border-white shadow-2xl uppercase tracking-widest">RECLAMADO</span>
                          </div>
                        )}
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                           <div>
                              <h4 className="text-xl font-black uppercase italic tracking-tighter text-white group-hover:text-urban-red transition-colors leading-none">{p.name}</h4>
                              <p className="text-[8px] font-black text-white/30 mt-1 uppercase tracking-widest">STOCK: {p.stock} UDS</p>
                           </div>
                           <span className="text-lg font-black text-white italic">{p.price}</span>
                        </div>
                        <button onClick={() => toggleProductSoldOut(p)} className={`w-full py-3 text-[8px] font-black uppercase tracking-[0.3em] border transition-all italic ${p.soldOut ? 'bg-urban-red border-urban-red text-white' : 'border-white/10 text-white/20 hover:border-white hover:text-white'}`}>
                           {p.soldOut ? 'LIBERAR_ARCHIVO' : 'MARCAR_AGOTADO'}
                        </button>
                     </div>
                  </div>
                 ))
               )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(deleteConfirmId || productDeleteId) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-8"
          >
            <div className="max-w-md w-full border-t-8 border-urban-red bg-[#0D0D0D] p-10 shadow-2xl space-y-6 text-center">
               <AlertTriangle size={48} className="text-urban-red mx-auto" />
               <h2 className="text-3xl font-black italic text-white uppercase">PURGAR_DATOS</h2>
               <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">¿Confirmar eliminación permanente del sistema?</p>
               <div className="flex gap-4">
                  <button onClick={() => { setDeleteConfirmId(null); setProductDeleteId(null); }} className="flex-grow py-4 border border-white/10 text-white font-black uppercase text-[10px] hover:bg-white/5 transition-colors">ABORTAR</button>
                  <button onClick={() => deleteConfirmId ? deleteOrder(deleteConfirmId) : productDeleteId && handleDeleteProduct(productDeleteId)} className="flex-grow py-4 bg-urban-red text-white font-black uppercase text-[10px] hover:bg-red-700 transition-colors">CONFIRMAR</button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] border border-white/10 bg-black overflow-hidden flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">RECONSTRUCCIÓN_3D // {previewOrder.name}</h2>
                 <button onClick={() => setPreviewOrder(null)} className="p-2 bg-urban-red text-white hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>
              <div className="flex-grow relative"><OrderScene3D order={previewOrder} /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

