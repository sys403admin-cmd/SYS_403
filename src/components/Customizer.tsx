'use client';

import React, { useState, useRef, Suspense, useMemo, useEffect, memo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  ContactShadows, 
  Decal, 
  Environment, 
  Center,
  useTexture,
  useGLTF
} from '@react-three/drei';
import * as THREE from 'three';
import { z } from 'zod';
import { 
  Plus, 
  Trash2, 
  Shield, 
  Zap, 
  Palette, 
  X, 
  Maximize2, 
  Terminal, 
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '@/lib/sounds';
import { submitOrder, uploadDNA } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';

// --- SCHEMA (ñ y acentos permitidos) ---
const OrderSchema = z.object({
  name: z.string().min(3).max(50).regex(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]*$/),
  email: z.string().email(),
  whatsapp: z.string().min(10).max(20).regex(/^[0-9+\s]*$/),
  size: z.enum(['M', 'L', 'XL']),
  honeypot: z.string().max(0),
});

type GarmentType = 'CAMISA' | 'BUSO';

interface DesignInstance {
  id: string;
  url: string;
  zone: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}

// --- SUB-COMPONENTS ---

const SystemMessage = memo(({ notification, onClose }: any) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`p-6 border-l-8 ${notification.type === 'error' ? 'border-urban-red bg-black/95' : 'border-[#00FF00] bg-black/95'} shadow-2xl relative overflow-hidden min-w-[320px] pointer-events-auto`}
    >
      <div className="flex items-center gap-4">
        {notification.type === 'error' ? <AlertTriangle className="text-urban-red" size={24} /> : <CheckCircle2 className="text-[#00FF00]" size={24} />}
        <div>
          <p className={`text-[8px] font-black uppercase tracking-[0.3em] ${notification.type === 'error' ? 'text-urban-red' : 'text-[#00FF00]'}`}>
            {notification.type === 'error' ? 'SISTEMA_RECHAZADO' : 'SISTEMA_OPERATIVO'}
          </p>
          <p className="text-xs font-black uppercase italic text-white mt-1">{notification.message}</p>
        </div>
      </div>
    </motion.div>
  );
});
SystemMessage.displayName = 'SystemMessage';

const DecalItem = memo(({ design, targetMesh }: any) => {
  // Verificación de URL antes del hook no es posible, pero aseguramos que el padre filtre
  const texture = useTexture(design.url);
  
  useMemo(() => { 
    if (texture) { 
      const tex = Array.isArray(texture) ? texture[0] : texture;
      // Configuramos propiedades básicas de la textura para visualización óptima
      try {
        tex.anisotropy = 16; 
        tex.colorSpace = THREE.SRGBColorSpace; 
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
      } catch (e) {
        console.warn("Texture config skip", e);
      }
    } 
  }, [texture]);

  const getDecalProps = () => {
    const [x, y] = design.position || [0, 0, 0];
    const [sx, sy] = design.scale || [0.3, 0.3, 0.3];
    const r = (design.rotation && design.rotation[2]) || 0;
    // Profundidad ultra-reducida para evitar sangrado en mangas y cuerpo
    const depth = 0.1; 

    if (design.zone === 'front') {
      return { pos: [x, y + 0.6, 0.5] as [number, number, number], rot: [0, 0, r] as [number, number, number], s: [sx, sy, depth] as [number, number, number] };
    }
    if (design.zone === 'back') {
      return { pos: [x, y + 0.6, -0.5] as [number, number, number], rot: [0, Math.PI, r] as [number, number, number], s: [sx, sy, depth] as [number, number, number] };
    }
    if (design.zone === 'sleeve-l') {
      return { pos: [-0.5, y + 0.6, x] as [number, number, number], rot: [0, -Math.PI / 2, r] as [number, number, number], s: [sx, sy, depth] as [number, number, number] };
    }
    if (design.zone === 'sleeve-r') {
      return { pos: [0.5, y + 0.6, -x] as [number, number, number], rot: [0, Math.PI / 2, r] as [number, number, number], s: [sx, sy, depth] as [number, number, number] };
    }
    return null;
  };

  const props = getDecalProps();
  if (!props) return null;

  return (
    <Decal mesh={{ current: targetMesh } as any} position={props.pos} rotation={props.rot} scale={props.s}>
      <meshStandardMaterial map={texture as any} transparent alphaTest={0.001} polygonOffset polygonOffsetFactor={-1} roughness={1} metalness={0} toneMapped={false} />
    </Decal>
  );
});
DecalItem.displayName = 'DecalItem';

const GarmentModel = memo(({ type, color, designs }: any) => {
  const modelPath = type === 'CAMISA' ? '/models/camisa.glb' : '/models/buso.glb';
  const { nodes } = useGLTF(modelPath) as any;
  const garmentMeshes = useMemo(() => Object.values(nodes).filter((node: any) => node.isMesh) as THREE.Mesh[], [nodes]);

  const fabricMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 1, metalness: 0,
    side: THREE.DoubleSide,
  }), [color]);

  return (
    <group scale={type === 'BUSO' ? 0.9 : 1.0} position={[0, -0.6, 0]}>
      {garmentMeshes.map((mesh) => (
        <mesh key={mesh.uuid} geometry={mesh.geometry} material={fabricMaterial} castShadow receiveShadow>
          {designs.map((d: any) => (
            // FILTRO DE SEGURIDAD: Solo inyectar si hay URL
            d.url ? <DecalItem key={d.id} design={d} targetMesh={mesh} /> : null
          ))}
        </mesh>
      ))}
    </group>
  );
});
GarmentModel.displayName = 'GarmentModel';

const Viewer3D = memo(({ garment, garmentColor, designs, orbitRef }: any) => {
  return (
    <div className="relative w-full h-full border border-white/5 bg-[#080808] overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
      <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 40 }} gl={{ powerPreference: 'high-performance', antialias: false, stencil: false }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} intensity={6} castShadow />
          <Environment preset="studio" />
          <Center><GarmentModel type={garment} color={garmentColor} designs={designs} /></Center>
          <OrbitControls ref={orbitRef} enablePan={false} minDistance={1.5} maxDistance={4} rotateSpeed={0.5} />
          <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={10} blur={3} far={2} />
        </Suspense>
      </Canvas>
    </div>
  );
});
Viewer3D.displayName = 'Viewer3D';

const OrderForm = memo(({ onSubmit, isSending, designsCount }: any) => {
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', size: 'L' as any, honeypot: '' });

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, () => setFormData({ name: '', email: '', whatsapp: '', size: 'L', honeypot: '' }));
  };

  return (
    <form onSubmit={handleLocalSubmit} className="space-y-6 sm:space-y-8 pt-6 sm:pt-10 border-t border-white/10">
      <input type="text" name="website" className="hidden" value={formData.honeypot} onChange={e => setFormData({...formData, honeypot: e.target.value})} />
      <div className="space-y-4 sm:space-y-6">
        {[
          {id: 'name', label: 'ID_FORJADOR', ph: 'NOMBRE COMPLETO'},
          {id: 'email', label: 'ACCESO_MAIL', ph: 'CORREO ELECTRÓNICO', type: 'email'},
          {id: 'whatsapp', label: 'COMMS_WA', ph: '+57 300...'}
        ].map((f) => (
          <div key={f.id} className="relative group">
            <span className="absolute -top-2 left-4 bg-[#020202] px-2 text-[7px] sm:text-[8px] font-black text-urban-red tracking-widest uppercase italic z-10">{f.label}</span>
            <input type={f.type || 'text'} required className="w-full bg-white/5 border border-white/10 p-4 sm:p-5 text-xs sm:text-sm font-black uppercase outline-none focus:border-urban-red focus:bg-white/10 transition-all text-white" placeholder={f.ph} value={(formData as any)[f.id]} onChange={e => setFormData({...formData, [f.id]: e.target.value})} />
          </div>
        ))}
      </div>
      <div className="space-y-2 sm:space-y-3">
        <span className="text-[7px] sm:text-[8px] font-black text-[#00FF00] tracking-widest uppercase italic ml-2">Dimensión ADN (Talla)</span>
        <div className="flex gap-2">
          {['M', 'L', 'XL'].map((s) => (
            <button key={s} type="button" onClick={() => setFormData({...formData, size: s as any})} className={`flex-grow py-2.5 sm:py-3 text-[10px] sm:text-xs font-black border transition-all ${formData.size === s ? 'bg-urban-red border-urban-red text-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}>{s}</button>
          ))}
        </div>
      </div>
      <button type="submit" disabled={designsCount === 0 || isSending} className="w-full py-5 sm:py-6 bg-white text-black font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-xs sm:text-sm hover:bg-urban-red hover:text-white transition-all flex items-center justify-center gap-3 sm:gap-4 relative overflow-hidden group shadow-2xl">
        <span className="relative z-10">{isSending ? 'SELLANDO ADN...' : 'CERRAR FORJA'}</span>
        <Shield className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-urban-red translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
      </button>
    </form>
  );
});
OrderForm.displayName = 'OrderForm';

export default function Customizer() {
  const [garment, setGarment] = useState<GarmentType>('BUSO');
  const [garmentColor, setGarmentColor] = useState('#FFFFFF');
  const [designs, setDesigns] = useState<DesignInstance[]>([]);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<'front' | 'back' | 'sleeve-l' | 'sleeve-r'>('front');
  const [isSending, setIsSending] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const orbitRef = useRef<any>(null);

  const notify = useCallback((type: 'error' | 'success', message: string) => {
    setNotifications(prev => [...prev, { id: Date.now(), type, message }]);
    if (type === 'error') sounds.playStatic(); else sounds.playClick();
  }, []);

  const selectedDesign = useMemo(() => designs.find(d => d.id === selectedDesignId), [designs, selectedDesignId]);

  const updateSelectedDesign = useCallback((updates: Partial<DesignInstance>) => {
    if (!selectedDesignId) return;
    setDesigns(prev => prev.map(d => d.id === selectedDesignId ? { ...d, ...updates } : d));
  }, [selectedDesignId]);

  const focusZone = useCallback((zone: string) => {
    setActiveZone(zone as any);
    if (!orbitRef.current) return;
    const angles: any = { front: 0, back: Math.PI, 'sleeve-l': -Math.PI/2, 'sleeve-r': Math.PI/2 };
    orbitRef.current.setAzimuthalAngle(angles[zone] || 0);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.type !== 'image/png') { notify('error', 'PNG TRANSPARENTE REQUERIDO.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 500) { notify('error', 'CALIDAD INSUFICIENTE.'); return; }
        const newId = Math.random().toString(36).substr(2, 9);
        setDesigns(prev => [...prev, { id: newId, url: reader.result as string, zone: activeZone, position: [0,0,0], rotation: [0, activeZone === 'back' ? Math.PI : 0, 0], scale: [0.3, 0.3, 0.3] }]);
        setSelectedDesignId(newId);
        notify('success', 'ADN INYECTADO.');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onFormSubmit = async (formData: any, resetForm: () => void) => {
    if (Date.now() - lastSubmissionTime < 30000) { notify('error', 'SISTEMA SOBRECALENTADO.'); return; }
    try { OrderSchema.parse(formData); } catch (error) { notify('error', 'DATOS INVALIDOS.'); return; }
    setIsSending(true);
    try {
      const finalDesigns = await Promise.all(designs.map(async (d, i) => {
        if (d.url.startsWith('data:')) {
          const fd = new FormData();
          fd.append('file', d.url);
          fd.append('fileName', `dna_${i}_${formData.name}.png`);
          const publicUrl = await uploadDNA(fd);
          return { ...d, url: publicUrl };
        }
        return d;
      }));
      await submitOrder({ ...formData, garmentType: garment, garmentColor, designs: finalDesigns });
      setLastSubmissionTime(Date.now());
      notify('success', 'ADN RECIBIDO EN EL BUNKER.');
      
      const designSummary = finalDesigns.map((d, i) => 
        `ADN_0${i+1}: [${d.zone.toUpperCase()}] X:${d.position[0].toFixed(2)} Y:${d.position[1].toFixed(2)} S:${d.scale[0].toFixed(2)}`
      ).join('\n');

      const waMsg = `> *NUEVO_PEDIDO_FORJA_SYS_403*\n\n*CLIENTE:* ${formData.name}\n*EMAIL:* ${formData.email}\n*WHATSAPP:* ${formData.whatsapp}\n\n*ESPECIFICACIONES:*\n- Prenda: ${garment}\n- Talla: ${formData.size}\n- Color: ${garmentColor}\n\n*FRAGMENTOS_INYECTADOS:*\n${designSummary}\n\n_El ADN ha sido cargado al bunker. Esperando sellado final._`;
      const waUrl = `https://wa.me/573011138847?text=${encodeURIComponent(waMsg)}`;
      setTimeout(() => { window.open(waUrl, '_blank'); }, 2000);
      setDesigns([]); resetForm();
    } catch (error: any) { notify('error', `FALLA: ${error.message.toUpperCase()}`); } finally { setIsSending(false); }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen pt-20 bg-black lg:overflow-hidden text-white font-sans">
      <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-4 pointer-events-none w-[90%] max-w-[350px]">
        <AnimatePresence>{notifications.map(n => <SystemMessage key={n.id} notification={n} onClose={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} />)}</AnimatePresence>
      </div>
      <div className="flex-grow relative bg-[#050505] p-2 lg:p-8 flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] lg:min-h-0 overflow-hidden">
        <Viewer3D garment={garment} garmentColor={garmentColor} designs={designs} orbitRef={orbitRef} />
        
        {/* Type selector - Keep absolute but more subtle */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
           <div className="flex gap-1.5">
              {['BUSO', 'CAMISA'].map((type) => (
                <button key={type} onClick={() => setGarment(type as any)} className={`px-3 py-1.5 text-[8px] font-black border transition-all ${garment === type ? 'bg-urban-red border-urban-red text-white' : 'bg-black/60 border-white/10 text-white/40'}`}>{type}</button>
              ))}
           </div>
        </div>

        {/* Zone Selector - Hidden on mobile, moved to side panel */}
        <div className="hidden sm:flex absolute top-8 right-8 z-20 flex-col gap-3 bg-black/80 backdrop-blur-xl p-5 border border-white/10 shadow-2xl min-w-[180px]">
           <span className="text-[10px] font-black text-white/20 mb-2 text-center border-b border-white/5 pb-2 tracking-widest uppercase">Mapeo_ADN</span>
           <div className="grid grid-cols-2 gap-2">
              {['front', 'back', 'sleeve-l', 'sleeve-r'].map((z) => (
                <button key={z} onClick={() => focusZone(z)} className={`px-4 py-3 text-[9px] font-black uppercase transition-all border-2 ${activeZone === z ? 'bg-white text-black border-white' : 'border-white/10 text-white/30 hover:border-white/30'}`}>{z === 'front' ? 'Pecho' : z === 'back' ? 'Espalda' : z === 'sleeve-l' ? 'Manga L' : 'Manga R'}</button>
              ))}
           </div>
        </div>

        {/* Color Selector - Hidden on mobile, moved to side panel */}
        <div className="hidden sm:flex absolute bottom-8 left-8 z-20 gap-2 bg-black/40 p-2 border border-white/5 backdrop-blur-md">
           {['#000000', '#FFFFFF', '#F5F5F5', '#D2B48C'].map((c) => (
             <button key={c} onClick={() => setGarmentColor(c)} className={`w-8 h-8 border-2 ${garmentColor === c ? 'border-white scale-110 rotate-45' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c }} />
           ))}
        </div>
      </div>

      {/* Side Panel / Controls */}
      <div className="w-full lg:w-[480px] p-6 sm:p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-[#020202] z-30 flex flex-col border-t lg:border-t-0 lg:border-l border-white/5 shrink-0">
        <div className="space-y-8 sm:space-y-10">
          {/* Mobile Integration: Zones and Colors */}
          <div className="sm:hidden space-y-8 pb-8 border-b border-white/5">
             <div className="space-y-4">
                <span className="text-[10px] font-black text-[#00FF00] tracking-widest uppercase italic">ZONA_INTERVENCIÓN</span>
                <div className="grid grid-cols-2 gap-2">
                  {['front', 'back', 'sleeve-l', 'sleeve-r'].map((z) => (
                    <button key={z} onClick={() => focusZone(z)} className={`py-4 text-[10px] font-black uppercase transition-all border-2 ${activeZone === z ? 'bg-white text-black border-white' : 'border-white/10 text-white/40'}`}>{z === 'front' ? 'Frente' : z === 'back' ? 'Espalda' : z === 'sleeve-l' ? 'Manga L' : 'Manga R'}</button>
                  ))}
                </div>
             </div>
             <div className="space-y-4">
                <span className="text-[10px] font-black text-[#00FF00] tracking-widest uppercase italic">CROMA_BASE</span>
                <div className="flex justify-between bg-white/5 p-4 border border-white/10">
                  {['#000000', '#FFFFFF', '#F5F5F5', '#D2B48C'].map((c) => (
                    <button key={c} onClick={() => setGarmentColor(c)} className={`w-12 h-12 border-4 ${garmentColor === c ? 'border-urban-red scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <span className="text-[8px] sm:text-[10px] font-black text-urban-red tracking-[0.4em] sm:tracking-[0.5em] uppercase italic">Inyección de Código</span>
            <h3 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none text-white glitch-text" data-text="FORJAR TU ADN">FORJAR TU ADN</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {designs.map((d) => (
              <div key={d.id} onClick={() => { setSelectedDesignId(d.id); focusZone(d.zone); }} className={`relative aspect-square bg-black border-2 ${selectedDesignId === d.id ? 'border-urban-red shadow-[0_0_20px_rgba(255,0,0,0.2)]' : 'border-white/5'} cursor-pointer group`}>
                <img src={d.url} alt="ADN" className="w-full h-full object-contain p-2" />
                <button onClick={(e) => { e.stopPropagation(); setDesigns(prev => prev.filter(x => x.id !== d.id)); if(selectedDesignId === d.id) setSelectedDesignId(null); }} className="absolute inset-0 bg-urban-red/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Trash2 className="w-5 h-5 sm:w-6 sm:h-6" /></button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-white/5 flex items-center justify-center cursor-pointer hover:border-urban-red transition-all group relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white/20 group-hover:text-urban-red relative z-10" />
               <input type="file" className="hidden" accept="image/png" onChange={(e) => { handleFileUpload(e); e.target.value = ''; }} />
            </label>
          </div>
          <AnimatePresence>
            {selectedDesign && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-6 sm:p-8 bg-white/5 border border-white/10 space-y-6 sm:space-y-8 overflow-hidden">
                <div className="flex justify-between items-center"><span className="text-[8px] sm:text-[10px] font-black text-[#00FF00] tracking-widest uppercase">Calibración_Glitch</span><button onClick={() => setSelectedDesignId(null)} className="text-[8px] sm:text-[10px] text-urban-red font-bold hover:text-white uppercase tracking-widest">Abortar [X]</button></div>
                <div className="space-y-6 sm:space-y-8">
                  {[ 
                    {l:'Latitud X', v:selectedDesign.position[0], m:-1.5, mx:1.5, s:0.001, f:(v:any)=>updateSelectedDesign({position:[v,selectedDesign.position[1],selectedDesign.position[2]]}) },
                    {l:'Altitud Y', v:selectedDesign.position[1], m:-1.5, mx:1.5, s:0.001, f:(v:any)=>updateSelectedDesign({position:[selectedDesign.position[0],v,selectedDesign.position[2]]}) },
                    {l:'Densidad ADN', v:selectedDesign.scale[0], m:0.05, mx:1.2, s:0.01, f:(v:any)=>updateSelectedDesign({scale:[v,v,v]}) }
                  ].map((x, i) => (
                    <div key={i} className="space-y-2 sm:space-y-3">
                       <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                         <span>{x.l}</span>
                         <input type="number" step={x.s} value={x.v.toFixed(3)} onChange={(e)=>x.f(parseFloat(e.target.value)||0)} className="w-16 sm:w-24 bg-black border border-white/20 text-[#00FF00] font-mono text-center py-1 text-[10px] sm:text-xs outline-none focus:border-urban-red" />
                       </div>
                       <input type="range" min={x.m} max={x.mx} step={x.s} value={x.v} onChange={(e)=>x.f(parseFloat(e.target.value))} className="w-full accent-urban-red" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <OrderForm onSubmit={onFormSubmit} isSending={isSending} designsCount={designs.length} />
      </div>
    </div>
  );
}
