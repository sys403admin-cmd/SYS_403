'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { products, updateProducts, Product, CustomOrder } from '@/lib/store';
import { 
  Trash2, Plus, Package, MessageSquare, X, Upload, Palette, Target, 
  Zap, ShieldCheck, User, Lock, Terminal, Box, ChevronDown, 
  ArrowUpRight, Eye, Clock, CheckCircle, Truck, Trash 
} from 'lucide-react';
import Image from 'next/image';
import { sounds } from '@/lib/sounds';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Decal, Environment, Center, useTexture, Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Componente de Previsualización 3D para el Admin
function OrderPreview3D({ order }: { order: CustomOrder }) {
  const modelPath = order.garmentType === 'CAMISA' ? '/models/camisa.glb' : '/models/buso.glb';
  const { nodes } = useGLTF(modelPath) as any;
  const meshes = Object.values(nodes).filter((n: any) => n.isMesh) as THREE.Mesh[];

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(order.garmentColor),
    roughness: 1,
    metalness: 0
  });

  // Manejar el nuevo formato envuelto { payload: [...] }
  const rawDesigns = typeof order.designs === 'string' ? JSON.parse(order.designs) : order.designs;
  const designs = rawDesigns.payload || rawDesigns;

  return (
    <group scale={1.8} position={[0, -1, 0]}>
      {meshes.map((mesh) => (
        <mesh key={mesh.uuid} geometry={mesh.geometry} material={mat}>
          {Array.isArray(designs) && designs.map((d: any, i: number) => (
            <AdminDecal key={i} design={d} targetMesh={mesh} type={order.garmentType} />
          ))}
        </mesh>
      ))}
    </group>
  );
}

function AdminDecal({ design, targetMesh, type }: { design: any, targetMesh: THREE.Mesh, type: string }) {
  const texture = useTexture(design.url);
  const offsetZ = type === 'BUSO' ? 0.18 : 0.15;

  useMemo(() => {
    if (texture) {
      (texture as any).anisotropy = 16;
      (texture as any).colorSpace = THREE.SRGBColorSpace;
      (texture as any).minFilter = THREE.LinearMipmapLinearFilter;
      (texture as any).magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  // Lógica de coordenadas espejo del Laboratorio para precisión total
  const getDecalProps = () => {
    const basePos = [...design.position];
    const baseRot = [...design.rotation];

    if (design.zone === 'front') {
      return {
        pos: [basePos[0], basePos[1] + 0.6, offsetZ] as [number, number, number],
        rot: [0, 0, baseRot[2]] as [number, number, number]
      };
    }
    if (design.zone === 'back') {
      return {
        pos: [basePos[0], basePos[1] + 0.6, -offsetZ] as [number, number, number],
        rot: [0, Math.PI, baseRot[2]] as [number, number, number]
      };
    }
    if (design.zone === 'sleeve-l') {
      return {
        pos: [-0.40 + basePos[0], basePos[1] + 0.6, basePos[2]] as [number, number, number],
        rot: [0, -Math.PI / 2, baseRot[2]] as [number, number, number]
      };
    }
    if (design.zone === 'sleeve-r') {
      return {
        pos: [0.40 + basePos[0], basePos[1] + 0.6, basePos[2]] as [number, number, number],
        rot: [0, Math.PI / 2, baseRot[2]] as [number, number, number]
      };
    }
    return { pos: [0, 0, 0] as [number, number, number], rot: [0, 0, 0] as [number, number, number] };
  };

  const { pos, rot } = getDecalProps();

  // Filtrado de malla para evitar sangrado (espejo del Lab)
  const isTargetMesh = useMemo(() => {
    if (!targetMesh.name) return true;
    const name = targetMesh.name.toLowerCase();
    if (design.zone === 'front' && (name.includes('sleeve') || name.includes('back'))) return false;
    if (design.zone === 'back' && (name.includes('sleeve') || name.includes('front'))) return false;
    if (design.zone.includes('sleeve') && (name.includes('body') || name.includes('front') || name.includes('back'))) return false;
    return true;
  }, [targetMesh.name, design.zone]);

  if (!isTargetMesh) return null;

  return (
    <Decal 
      mesh={{ current: targetMesh } as any} 
      position={pos} 
      rotation={rot} 
      scale={[design.scale[0], design.scale[1], 0.1]}
    >
      <meshStandardMaterial 
        map={texture as any} 
        transparent 
        alphaTest={0.01} 
        polygonOffset 
        polygonOffsetFactor={-15}
        roughness={1}
        metalness={0}
        toneMapped={false}
      />
    </Decal>
  );
}
export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [localProducts, setLocalProducts] = useState(products);
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('orders');
  const [liveOrders, setLiveOrders] = useState<CustomOrder[]>([]);
  const [previewOrder, setPreviewOrder] = useState<CustomOrder | null>(null);
  const [newItem, setNewItem] = useState<Partial<Product>>({ 
    name: '', 
    price: '', 
    category: 'T-SHIRTS', 
    images: [], 
    description: '', 
    colors: [] 
  });
  const [colorInput, setColorInput] = useState('#FF0000');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) setLiveOrders(data as CustomOrder[]);
    if (error) console.error("Error fetching live orders:", error);
  };

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
    if (!confirm("> ¿CONFIRMAR ELIMINACIÓN DE REGISTRO ADN?")) return;
    sounds.playStatic();
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (!error) {
      setLiveOrders(prev => prev.filter(o => o.id !== orderId));
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

  const sanitize = (str: string) => {
    return str.replace(/[<>'"/&]/g, (match) => {
      const map: any = { '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '/': '&#47;', '&': '&amp;' };
      return map[match];
    }).trim();
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
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

  const addColor = () => {
    if (!newItem.colors?.includes(colorInput)) {
      setNewItem(prev => ({ ...prev, colors: [...(prev.colors || []), colorInput] }));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    
    const product: Product = {
      ...newItem,
      id: Date.now(),
      name: sanitize(newItem.name || 'NUEVA FORJA'),
      price: sanitize(newItem.price || '$0.00'),
      category: newItem.category as any,
      images: newItem.images || [],
      description: sanitize(newItem.description || ''),
      colors: newItem.colors || [],
      soldOut: false
    } as Product;
    const updated = [...localProducts, product];
    setLocalProducts(updated);
    updateProducts(updated);
    setNewItem({ name: '', price: '', category: 'T-SHIRTS', images: [], description: '', colors: [] });
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
      {/* Sidebar: El Trono del Sistema */}
      <div className="w-full lg:w-80 bg-[#050505] border-r-4 border-urban-red p-8 space-y-12 z-20 flex flex-col justify-between h-screen sticky top-0 shrink-0 shadow-[20px_0_100px_rgba(230,57,70,0.1)]">
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

        <div className="bg-gradient-to-b from-white/5 to-transparent p-6 border-l-4 border-urban-red space-y-4 relative overflow-hidden">
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

      {/* Main Command Center: El Asfalto Visual */}
      <div className="flex-grow p-8 lg:p-20 overflow-y-auto custom-scrollbar bg-black relative">
        {/* Matrix Overlay */}
        <div className="fixed inset-0 pointer-events-none matrix-bg opacity-10"></div>
        <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-urban-red/5 via-transparent to-transparent"></div>

        {activeTab === 'orders' ? (
          <div className="space-y-20 relative z-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-4 bg-urban-red"></div>
                   <span className="text-urban-red text-[14px] font-black uppercase tracking-[1em]">INCOMING_ADN</span>
                </div>
                <h1 className="text-8xl md:text-[10rem] font-black uppercase italic tracking-tighter leading-none glitch-text" data-text="PEDIDOS">PEDIDOS<br /><span className="text-stroke text-white/5">SISTEMA</span></h1>
              </div>
            </header>

            <div className="flex flex-col gap-16 max-w-5xl mx-auto">
              {liveOrders.length === 0 ? (
                <div className="h-[50vh] border-8 border-dashed border-white/5 flex flex-col items-center justify-center text-white/5 uppercase tracking-[1em] italic bg-black/40">
                   <Zap size={100} className="mb-8 animate-pulse" />
                   <p className="text-2xl font-black">SILENCIO_EN_EL_BARRIO</p>
                </div>
              ) : (
                liveOrders.map((order) => (
                  <div key={order.id} className="bg-[#0D0D0D] border-t-[12px] border-urban-red p-8 lg:p-12 flex flex-col gap-12 hover:bg-[#111111] transition-all shadow-[20px_20px_50px_rgba(0,0,0,0.5)] relative group overflow-hidden">
                    <div className="absolute top-6 right-8 text-[10px] font-black text-white/20 uppercase tracking-widest italic">#{order.id.toString().slice(-8)}</div>
                    
                    <div className="flex flex-col lg:flex-row gap-12">
                      <div className="flex flex-wrap gap-4 lg:w-[250px] shrink-0">
                        {(() => {
                          const raw = typeof order.designs === 'string' ? JSON.parse(order.designs) : order.designs;
                          const designsList = raw.payload || raw;
                          return Array.isArray(designsList) ? designsList.map((d: any, i: number) => (
                            <div key={i} className="flex flex-col gap-2 w-[100px]">
                               <div className="relative aspect-square bg-black border-2 border-white/10 overflow-hidden shadow-lg flex items-center justify-center group-hover:border-urban-red transition-colors">
                                 {d.url ? <Image src={d.url} alt="" fill className="object-contain p-1" /> : <Zap size={16} className="text-white/10" />}
                               </div>
                               <div className="bg-white/5 px-2 py-1 border-l border-urban-red">
                                  <p className="text-[6px] font-black text-[#00FF00] uppercase tracking-tighter truncate">{d.zone}</p>
                               </div>
                            </div>
                          )) : null;
                        })()}
                      </div>
                      
                      <div className="flex-grow space-y-8">
                         <div className="flex justify-between items-start">
                            <div className="space-y-2 border-b-4 border-white/5 pb-8 flex-grow">
                               <h3 className="text-5xl font-black uppercase italic text-white leading-none group-hover:text-urban-red transition-colors">{order.name}</h3>
                               <div className="flex flex-col gap-2 mt-4">
                                  <div className="flex gap-4 items-center">
                                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">WhatsApp:</span>
                                     <span className="text-xl font-black text-urban-red">{order.whatsapp}</span>
                                  </div>
                                  <div className="flex gap-4 items-center">
                                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Talla:</span>
                                     <span className="text-xl font-black text-white">{order.size}</span>
                                  </div>
                               </div>
                            </div>
                            <div className={`ml-8 px-6 py-3 border-2 font-black uppercase italic text-xs tracking-widest ${getStatusStyle(order.status)}`}>
                               {order.status}
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-10 pt-4">
                            <div className="space-y-2">
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Arquitectura</span>
                               <p className="text-2xl font-black uppercase italic text-white">{order.garmentType}</p>
                            </div>
                            <div className="space-y-4">
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">GESTIÓN_ESTADO</span>
                               <div className="flex flex-wrap gap-2">
                                  {[
                                    { s: 'Pendiente', i: Clock },
                                    { s: 'En Forja', i: Zap },
                                    { s: 'Listo', i: CheckCircle },
                                    { s: 'Entregado', i: Truck }
                                  ].map((state) => (
                                    <button 
                                      key={state.s}
                                      onClick={() => updateOrderStatus(order.id, state.s)}
                                      className={`p-2 border transition-all ${order.status === state.s ? 'bg-white text-black border-white' : 'border-white/10 text-white/20 hover:border-white/40 hover:text-white'}`}
                                      title={state.s}
                                    >
                                      <state.i size={16} />
                                    </button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="flex gap-6">
                       <button 
                         onClick={() => { sounds.playClick(); setPreviewOrder(order); }}
                         className="flex-grow bg-[#00FF00] text-black py-10 font-black uppercase text-2xl hover:bg-white transition-all italic shadow-[0_0_60px_rgba(0,255,0,0.1)] group/btn relative overflow-hidden"
                       >
                          <span className="relative z-10 flex items-center justify-center gap-6">VISUALIZAR ADN <Eye size={32} /></span>
                          <div className="absolute inset-0 bg-white translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                       </button>
                       
                       <a 
                         href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`> SYS_403 // INFORME_TECNICO\n\nSaludos Forjador ${order.name}.\nTu ADN ha sido analizado. Estamos listos para iniciar la forja de tu ${order.garmentType} (Talla: ${order.size}).\n\nConfirma para proceder con el sellado.`)}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         onMouseEnter={() => sounds.playHover()}
                         className="w-24 bg-[#25D366] flex items-center justify-center hover:bg-white hover:text-[#25D366] transition-all group/wa shadow-[0_0_30px_rgba(37,211,102,0.2)]"
                       >
                          <MessageSquare size={40} className="group-hover:scale-110 transition-transform" />
                       </a>

                       <button 
                         onClick={() => deleteOrder(order.id)}
                         className="w-24 border-8 border-white/10 flex items-center justify-center hover:bg-urban-red hover:border-urban-red hover:text-white transition-all group/x"
                       >
                          <Trash size={40} className="group-hover:scale-110 transition-transform" />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal de Previsualización 3D Matrix */}
            <AnimatePresence>
              {previewOrder && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-12"
                >
                  <div className="relative w-full h-full border-4 border-white/10 bg-black overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center p-8 border-b border-white/10 bg-white/5">
                       <div className="flex items-center gap-6">
                          <div className="w-4 h-4 bg-[#00FF00] animate-pulse"></div>
                          <h2 className="text-4xl font-black uppercase italic tracking-tighter">RECONSTRUCCIÓN_3D // {previewOrder.name}</h2>
                       </div>
                       <button onClick={() => setPreviewOrder(null)} className="p-4 bg-urban-red text-white hover:rotate-90 transition-transform">
                          <X size={40} />
                       </button>
                    </div>
                    
                    <div className="flex-grow relative cursor-crosshair">
                       <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 40 }}>
                          <Suspense fallback={null}>
                             <ambientLight intensity={1} />
                             <spotLight position={[10, 10, 10]} intensity={10} />
                             <Environment preset="studio" />
                             <Center>
                                <OrderPreview3D order={previewOrder} />
                             </Center>
                             <OrbitControls />
                             <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={10} blur={2.5} far={2} />
                          </Suspense>
                       </Canvas>
                    </div>

                    <div className="p-8 bg-white/5 border-t border-white/10 flex justify-between items-center font-mono text-[10px] text-[#00FF00]">
                       <span>&gt; STATUS: ADN_MAPPED_SUCCESSFULLY</span>
                       <span>&gt; PROTOCOLO: SYS_403_VISTA_CAPO</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-32 pb-40 relative z-10">
            <header className="space-y-6">
               <div className="flex items-center gap-8">
                  <div className="w-24 h-6 bg-urban-red"></div>
                  <span className="text-urban-red text-[16px] font-black uppercase tracking-[1em]">STOCK_ARCHITECTURE</span>
               </div>
               <h1 className="text-8xl md:text-[12rem] font-black uppercase italic tracking-tighter leading-none">ARCHIVO<br /><span className="text-stroke text-white/5">SISTEMA</span></h1>
            </header>

            {/* Formulario de Inyección: El Oro del Barrio */}
            <form onSubmit={handleAdd} className="bg-white text-black p-12 lg:p-24 space-y-20 shadow-[50px_50px_0_#E63946] relative overflow-hidden">
               <div className="flex items-center gap-8 border-b-8 border-black pb-12">
                  <div className="w-32 h-32 bg-black text-white flex items-center justify-center shadow-[20px_20px_0_#E63946]">
                     <Plus size={80} />
                  </div>
                  <h3 className="text-6xl font-black uppercase italic tracking-tighter leading-none">INYECTAR NUEVA PIEZA AL ARCHIVO</h3>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-2 gap-24">
                  <div className="space-y-12">
                     <div className="space-y-4">
                        <label className="text-[14px] font-black uppercase tracking-[0.5em] opacity-30 italic">IDENTIDAD DE LA PIEZA</label>
                        <input type="text" placeholder="NOMBRE DE LA FORJA" className="w-full bg-gray-100 p-8 text-3xl font-black uppercase border-b-8 border-black outline-none focus:bg-gray-200 transition-all" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                     </div>
                     <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                           <label className="text-[14px] font-black uppercase tracking-[0.5em] opacity-30 italic">VALOR USD</label>
                           <input type="text" placeholder="$0.00" className="w-full bg-gray-100 p-8 text-3xl font-black uppercase border-b-8 border-black outline-none focus:bg-gray-200 transition-all" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[14px] font-black uppercase tracking-[0.5em] opacity-30 italic">CORTE</label>
                           <select className="w-full bg-gray-100 p-8 text-2xl font-black uppercase border-b-8 border-black outline-none cursor-pointer" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})}>
                              <option value="T-SHIRTS">T-SHIRT OVERSIZE</option>
                              <option value="HOODIES">HOODIE OVERSIZE</option>
                           </select>
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-12">
                     <div className="space-y-4">
                        <label className="text-[14px] font-black uppercase tracking-[0.5em] opacity-30 italic">MANIFIESTO VISUAL (HISTORIA)</label>
                        <textarea placeholder="DESCRIBE LA ESENCIA DEL BARRIO..." className="w-full h-72 bg-gray-100 p-8 text-xl font-bold uppercase border-4 border-black outline-none resize-none italic leading-relaxed" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} required />
                     </div>
                  </div>
               </div>

               <div className="pt-12 border-t-8 border-black/5 space-y-12">
                  <label className="text-[16px] font-black uppercase tracking-[0.8em] text-urban-red italic">MULTIMEDIA DE ALTA FIDELIDAD (MÁX 6)</label>
                  <div className="flex gap-8 items-center bg-black/5 p-8 border-4 border-dashed border-black/20">
                     <Upload size={48} className="text-black/20" />
                     <input type="file" multiple className="text-lg font-black uppercase cursor-pointer" onChange={handleFileAdd} />
                  </div>
               </div>

               <button type="submit" className="w-full py-16 bg-black text-white text-5xl font-black uppercase italic tracking-[0.5em] hover:bg-urban-red transition-all shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
                  PUBLICAR EN EL ARCHIVO
               </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-20">
               {localProducts.map((p) => (
                  <div key={p.id} className="bg-[#0A0A0A] border-4 border-white/5 p-10 group relative overflow-hidden hover:border-urban-red transition-all shadow-[50px_50px_100px_rgba(0,0,0,0.5)]">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-urban-red opacity-10 -rotate-45 translate-x-16 -translate-y-16"></div>
                     <div className="relative aspect-[3/4] mb-12 overflow-hidden border-8 border-white/5 text-center flex items-center justify-center">
                        {p.images[0] ? <Image src={p.images[0]} alt="" fill className={`object-cover transition-all duration-1000 group-hover:scale-110 ${p.soldOut ? 'grayscale opacity-20' : 'grayscale group-hover:grayscale-0'}`} /> : <Package size={100} className="text-white/5" />}
                        <button onClick={() => {
                           const updated = localProducts.filter(x => x.id !== p.id);
                           setLocalProducts(updated);
                           updateProducts(updated);
                        }} className="absolute top-6 right-6 bg-urban-red text-white p-5 z-10 shadow-2xl hover:rotate-12 transition-transform"><Trash2 size={32}/></button>
                        
                        {p.soldOut && (
                          <div className="absolute inset-0 flex items-center justify-center">
                             <span className="bg-urban-red text-white text-2xl font-black px-12 py-6 -rotate-12 border-4 border-white shadow-[0_0_50px_rgba(230,57,70,0.5)] uppercase tracking-widest">RECLAMADO</span>
                          </div>
                        )}
                     </div>
                     <div className="space-y-8">
                        <div className="flex justify-between items-end border-b-4 border-white/5 pb-6">
                           <h4 className="text-4xl font-black uppercase italic tracking-tighter text-white group-hover:text-urban-red transition-colors leading-none">{p.name}</h4>
                           <span className="text-2xl font-black text-white italic">{p.price}</span>
                        </div>
                        <button onClick={() => {
                           const updated = localProducts.map(x => x.id === p.id ? {...x, soldOut: !x.soldOut} : x);
                           setLocalProducts(updated);
                           updateProducts(updated);
                        }} className={`w-full py-6 text-sm font-black uppercase tracking-[0.5em] border-4 transition-all italic ${p.soldOut ? 'bg-urban-red border-urban-red text-white shadow-2xl' : 'border-white/20 text-white/30 hover:border-white hover:text-white'}`}>
                           {p.soldOut ? 'LIBERAR ADN' : 'MARCAR COMO RECLAMADO'}
                        </button>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
