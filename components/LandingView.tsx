
import React from 'react';
import { Scissors } from 'lucide-react';
import { ShopConfig } from '../types';

interface LandingViewProps {
  config: ShopConfig;
  onEnter: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ config, onEnter }) => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
      <div className="relative mb-12">
        {/* Efecto de resplandor plateado */}
        <div className="absolute inset-0 bg-[#E2E8F0]/10 rounded-full blur-3xl animate-pulse"></div>
        
        {config.logo ? (
          <img 
            src={config.logo} 
            alt="Logo" 
            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-[#E2E8F0] relative z-10 shadow-[0_0_40px_rgba(226,232,240,0.2)]" 
          />
        ) : (
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-[#94A3B8] to-[#F8FAFC] flex items-center justify-center relative z-10 border-4 border-[#E2E8F0] shadow-[0_0_40px_rgba(226,232,240,0.2)]">
            <Scissors className="w-24 h-24 text-black animate-bounce" />
          </div>
        )}
      </div>

      <h1 className="font-cinzel text-5xl md:text-7xl gold-text font-bold tracking-[0.2em] mb-4 drop-shadow-[0_2px_15px_rgba(226,232,240,0.3)]">
        {config.name}
      </h1>
      
      <p className="text-gray-500 font-light tracking-[0.5em] uppercase mb-12 text-sm md:text-base">
        Reserva tu Cita
      </p>

      <button 
        onClick={onEnter}
        className="group relative px-12 py-4 overflow-hidden rounded-full font-bold text-black text-xl transition-all hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 gold-gradient transition-all group-hover:brightness-110"></div>
        <span className="relative z-10 tracking-widest uppercase">Ingresar</span>
      </button>

      <div className="mt-20 flex space-x-2 text-[#E2E8F0]/30 text-xs tracking-widest uppercase font-cinzel">
        <div className="h-px w-8 bg-current self-center"></div>
        <span>Since 2024</span>
        <div className="h-px w-8 bg-current self-center"></div>
      </div>
    </div>
  );
};

export default LandingView;
