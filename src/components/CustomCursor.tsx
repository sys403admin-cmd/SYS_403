'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  // Usamos variables de referencia para el mouse para evitar re-renders constantes
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!(
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') ||
        target.classList.contains('cursor-pointer')
      ));
    };

    let requestRef: number;
    const animate = () => {
      // Lerp Calibrado (0.5): Balance perfecto entre velocidad y suavidad
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.5;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.5;

      if (cursorRef.current) {
        // Usamos setProperty para actualizar una variable CSS directamente, 
        // evitando que React tenga que procesar el estilo en cada frame.
        cursorRef.current.style.setProperty('--cursor-x', `${currentPos.current.x}px`);
        cursorRef.current.style.setProperty('--cursor-y', `${currentPos.current.y}px`);
      }
      requestRef = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    requestRef = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(requestRef);
    };
  }, []);

  return (
    <div 
      ref={cursorRef}
      className="fixed top-0 left-0 w-12 h-12 pointer-events-none z-[99999] will-change-transform hidden md:block"
      style={{ 
        transform: 'translate3d(var(--cursor-x), var(--cursor-y), 0) translate(-50%, -50%)',
        '--cursor-x': '-100px',
        '--cursor-y': '-100px'
      } as any}
    >
      {/* Central Point */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-urban-red transition-all duration-300 ${isHovering ? 'scale-[200%] shadow-[0_0_15px_#FF0000]' : 'shadow-[0_0_5px_rgba(255,0,0,0.5)]'}`}></div>
      
      {/* Outer Tactical Reticle */}
      <div className={`absolute top-0 left-0 w-full h-full border border-urban-red/40 rounded-full transition-all duration-500 ${isHovering ? 'scale-110 border-urban-red rotate-180' : 'scale-75'}`}></div>
      
      {/* Reticle Crosshair Lines */}
      <div className={`absolute top-1/2 left-0 w-full h-[1px] bg-urban-red/30 transition-all duration-500 ${isHovering ? 'scale-x-125 opacity-100' : 'scale-x-50 opacity-0'}`}></div>
      <div className={`absolute left-1/2 top-0 h-full w-[1px] bg-urban-red/30 transition-all duration-500 ${isHovering ? 'scale-y-125 opacity-100' : 'scale-y-50 opacity-0'}`}></div>

      {/* Micro Text: Status */}
      <AnimatePresence>
        {isHovering && (
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 text-[6px] font-mono text-[#00FF00] whitespace-nowrap uppercase tracking-[0.4em] bg-black/90 px-3 py-1 border border-[#00FF00]/30 shadow-2xl"
          >
            &gt; TARGET_LOCKED
          </motion.span>
        )}
      </AnimatePresence>

      {/* Corner Tactical Brackets */}
      <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-urban-red transition-all duration-500 ${isHovering ? 'translate-x-[-6px] translate-y-[-6px]' : 'opacity-0 scale-50'}`}></div>
      <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-urban-red transition-all duration-500 ${isHovering ? 'translate-x-[6px] translate-y-[-6px]' : 'opacity-0 scale-50'}`}></div>
      <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-urban-red transition-all duration-500 ${isHovering ? 'translate-x-[-6px] translate-y-[6px]' : 'opacity-0 scale-50'}`}></div>
      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-urban-red transition-all duration-500 ${isHovering ? 'translate-x-[6px] translate-y-[6px]' : 'opacity-0 scale-50'}`}></div>
    </div>
  );
}
