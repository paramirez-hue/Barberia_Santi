
import React from 'react';
import { Service } from '../types';
import { Scissors, Clock, DollarSign, ChevronRight, User, Sparkles, Droplets, Zap, Camera, Star } from 'lucide-react';

interface ServicesViewProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

// Mapa de íconos disponibles
export const ICON_MAP: Record<string, any> = {
  Scissors,
  User,
  Sparkles,
  Droplets,
  Zap,
  Camera,
  Star,
  Clock
};

const ServicesView: React.FC<ServicesViewProps> = ({ services, onSelectService }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="text-center space-y-2">
        <h2 className="font-cinzel text-3xl gold-text font-bold uppercase tracking-widest">Servicios Premium</h2>
        <p className="text-gray-500">Selecciona el tratamiento con acabado de precisión</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => {
          const ServiceIcon = ICON_MAP[service.iconName || 'Scissors'] || Scissors;
          
          return (
            <div 
              key={service.id}
              onClick={() => onSelectService(service)}
              className="group bg-theme-secondary border border-white/5 hover:border-theme-accent/40 rounded-2xl p-6 transition-all cursor-pointer flex justify-between items-center hover:shadow-[0_0_25px_rgba(226,232,240,0.05)] overflow-hidden relative"
            >
              {/* Icono de fondo sutil */}
              <ServiceIcon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 rotate-12 group-hover:rotate-45 transition-transform text-theme-accent" />

              <div className="space-y-3 relative z-10">
                <span className="inline-block px-3 py-1 bg-black/40 text-theme-accent text-[10px] uppercase font-bold tracking-widest rounded-full border border-white/10">
                  {service.category}
                </span>
                <h3 className="text-xl font-bold group-hover:text-theme-accent transition-colors">{service.name}</h3>
                <p className="text-sm text-gray-500 font-light">{service.description}</p>
                
                <div className="flex items-center space-x-4 text-xs font-medium uppercase tracking-tighter">
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-1 opacity-60" />
                    {service.durationMinutes} min
                  </div>
                  <div className="flex items-center text-theme-accent">
                    <DollarSign className="w-4 h-4 mr-0.5" />
                    <span className="text-lg font-bold">{service.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-12 h-12 bg-white/5 group-hover:bg-theme-accent rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-xl border border-white/5">
                <ChevronRight className="w-6 h-6 group-hover:text-black text-theme-accent group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-12 text-center">
        <p className="text-gray-600 italic font-light text-sm">Tratamientos realizados con herramientas de alta gama.</p>
      </div>
    </div>
  );
};

export default ServicesView;
