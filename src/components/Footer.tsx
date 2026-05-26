'use client';

import { sounds } from '@/lib/sounds';

export default function Footer() {
  return (
    <footer className="py-12 px-8 border-t border-white/5 bg-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none matrix-bg opacity-5"></div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div>
          <h3 className="text-xl font-bold tracking-tighter text-white glitch-text" data-text=">SYS_403">
            &gt;SYS<span className="text-[#00FF00]">_</span><span className="font-light">403</span>
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mt-2 italic">
            © {new Date().getFullYear()} - System Overwrite // Urban DNA Protocol.
          </p>
        </div>
        
        <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold">
          <a href="https://www.instagram.com/sys403.med?igsh=MWc3MzYwM2ZuaG84NQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" onMouseEnter={() => sounds.playHover()} className="text-white/40 hover:text-urban-red transition-colors italic">Instagram</a>
          <a href="#" onMouseEnter={() => sounds.playHover()} className="text-white/40 hover:text-urban-red transition-colors italic">TikTok</a>
          <a 
            href={`https://wa.me/573011138847?text=${encodeURIComponent("> *PROTOCOLO_DE_CONTACTO_SYS_403*\n\nEy, solicito apertura del bunker. He visto el archivo en la web y quiero inyectar ADN real a mi estilo.\n\n_WEB_INTERCEPT_BY_USER_")}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            onMouseEnter={() => sounds.playHover()} 
            className="text-white/40 hover:text-urban-red transition-colors italic"
          >
            WhatsApp
          </a>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-white/20 italic font-mono">&gt; Node_Location: Medellin_CO // Status: Restricted</p>
        </div>
      </div>
    </footer>
  );
}
