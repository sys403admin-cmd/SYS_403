'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [lines, setLines] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const sequence = [
    "> INITIALIZING SYSTEM_BREACH_V4.0.3...",
    "> CONNECTING TO BARRIO_NETWORK_NODE...",
    "> BYPASSING SECURITY_LAYER_01: [SUCCESS]",
    "> ACCESSING RESTRICTED_ARCHIVES...",
    "> LOADING_URBAN_DNA_CORES...",
    "> INJECTING_MATRIX_OVERLAY...",
    "> SYSTEM READY. ENJOY THE BREACH."
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < sequence.length) {
        setLines(prev => [...prev, sequence[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsVisible(false), 800);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 1, ease: "circIn" }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-8 font-mono"
        >
          <div className="max-w-xl w-full">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-3 h-3 bg-urban-red animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">SYS_403 Boot Sequence</span>
            </div>
            
            <div className="space-y-3">
              {lines.map((line, i) => (
                <motion.p 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs md:text-sm uppercase tracking-widest ${i === lines.length - 1 ? 'text-[#00FF00]' : 'text-white/70'}`}
                >
                  {line}
                </motion.p>
              ))}
              <div className="w-2 h-4 bg-[#00FF00] animate-pulse inline-block align-middle ml-2"></div>
            </div>
          </div>
          
          <div className="absolute bottom-8 right-8 text-[8px] text-white/20 uppercase tracking-[1em]">
             System Overwrite Active
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
