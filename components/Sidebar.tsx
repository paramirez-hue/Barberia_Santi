
import React from 'react';
import { X, Scissors, Calendar, Settings, LogOut, Home, UserCheck, CheckCircle2 } from 'lucide-react';
import { ViewState, ShopConfig } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  config: ShopConfig;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentView, setView, config }) => {
  const menuItems = [
    { id: 'services', label: 'Servicios', icon: Scissors },
    { id: 'my-appointments', label: 'Mis Citas', icon: UserCheck },
    { id: 'admin', label: 'Administración', icon: Settings },
  ];

  const handleNav = (v: ViewState) => {
    setView(v);
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#0a0a0a] border-r border-white/10 z-50 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center space-x-3">
              {config.logo ? (
                <img src={config.logo} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#94A3B8] to-[#F8FAFC] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-black" />
                </div>
              )}
              <span className="font-cinzel text-lg gold-text font-bold uppercase tracking-tight">Menú</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-6 h-6 gold-text" />
            </button>
          </div>

          <nav className="flex-1 space-y-4">
            <button 
              onClick={() => handleNav('landing')}
              className="w-full flex items-center space-x-4 p-4 rounded-xl transition-all hover:bg-white/5 group border border-transparent hover:border-[#E2E8F0]/30"
            >
              <Home className="w-6 h-6 text-gray-500 group-hover:text-[#E2E8F0]" />
              <span className="text-lg font-medium text-gray-300 group-hover:text-white">Inicio</span>
            </button>

            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as ViewState)}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all group border ${
                  currentView === item.id 
                  ? 'bg-zinc-800/50 border-[#E2E8F0]/50 text-white shadow-[0_0_15px_rgba(226,232,240,0.1)]' 
                  : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:border-[#E2E8F0]/30'
                }`}
              >
                <item.icon className={`w-6 h-6 ${currentView === item.id ? 'text-[#E2E8F0]' : 'text-gray-500 group-hover:text-[#E2E8F0]'}`} />
                <span className={`text-lg font-medium ${currentView === item.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 mt-auto space-y-2">
            <div className="flex items-center justify-center space-x-2 text-[10px] text-green-500 font-bold uppercase tracking-widest opacity-60">
              <CheckCircle2 className="w-3 h-3" />
              <span>v1.2.0 LIVE</span>
            </div>
            <p className="text-[10px] text-center text-gray-600 font-cinzel tracking-widest">
              &copy; 2024 NEILS BARBER<br/>PRECISIÓN Y ESTILO
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
