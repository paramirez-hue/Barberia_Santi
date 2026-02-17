
import React, { useState, useEffect } from 'react';
import { ViewState, ShopConfig, Appointment, Service } from './types';
import { StorageService } from './services/storage'; // Mantenemos como fallback o eliminamos
import { SupabaseService } from './services/supabase';
import { Menu, X, Scissors, Calendar, Settings, User, LogOut, ChevronRight, Bell, Trash2, Camera, Loader2 } from 'lucide-react';

// Components
import LandingView from './components/LandingView';
import ServicesView from './components/ServicesView';
import BookingView from './components/BookingView';
import AdminView from './components/AdminView';
import Sidebar from './components/Sidebar';
import { DEFAULT_CONFIG, INITIAL_SERVICES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_CONFIG);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial desde Supabase
  useEffect(() => {
    const initData = async () => {
      try {
        const [cloudConfig, cloudAppts] = await Promise.all([
          SupabaseService.getConfig(),
          SupabaseService.getAppointments()
        ]);
        if (cloudConfig) setConfig(cloudConfig);
        setAppointments(cloudAppts);
      } catch (err) {
        console.error("Error cargando datos de Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBookingComplete = async (newAppointment: Appointment) => {
    try {
      await SupabaseService.saveAppointment(newAppointment);
      // Actualizamos localmente después de éxito
      const updatedAppts = await SupabaseService.getAppointments();
      setAppointments(updatedAppts);
      showNotification("¡Cita agendada con éxito!", 'success');
      setView('services');
    } catch (err) {
      showNotification("Error al guardar en la nube", 'error');
    }
  };

  const handleUpdateConfig = async (newConfig: ShopConfig) => {
    try {
      setConfig(newConfig);
      await SupabaseService.updateConfig(newConfig);
    } catch (err) {
      showNotification("Error actualizando configuración", 'error');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await SupabaseService.deleteAppointment(id);
      setAppointments(appointments.filter(a => a.id !== id));
      showNotification("Cita eliminada", 'success');
    } catch (err) {
      showNotification("Error eliminando cita", 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#E2E8F0] animate-spin" />
        <p className="font-cinzel text-[#E2E8F0] tracking-widest animate-pulse">Sincronizando con Supabase...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingView config={config} onEnter={() => setView('services')} />;
      case 'services':
        return (
          <ServicesView 
            services={services} 
            onSelectService={(s) => {
              setSelectedService(s);
              setView('booking');
            }} 
          />
        );
      case 'booking':
        return (
          <BookingView 
            service={selectedService} 
            config={config} 
            existingAppointments={appointments}
            onComplete={handleBookingComplete}
            onBack={() => setView('services')}
          />
        );
      case 'admin':
        return (
          <AdminView 
            config={config} 
            setConfig={handleUpdateConfig} 
            appointments={appointments}
            onDeleteAppointment={handleDeleteAppointment}
            onExit={() => setView('services')}
            showNotification={showNotification}
          />
        );
      default:
        return <LandingView config={config} onEnter={() => setView('services')} />;
    }
  };

  if (view === 'landing') return renderView();

  return (
    <div className="min-h-screen bg-black text-white relative flex overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView={view}
        setView={setView}
        config={config}
      />

      <main className="flex-1 overflow-y-auto h-screen relative">
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center px-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-[#E2E8F0]" />
          </button>
          
          <h1 className="font-cinzel text-xl text-[#E2E8F0] font-bold tracking-widest uppercase">
            {config.name}
          </h1>

          <div className="w-10"></div>
        </header>

        <div className="pb-20">
          {renderView()}
        </div>

        {notification && (
          <div className={`fixed bottom-8 right-8 z-50 px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3 animate-bounce border ${
            notification.type === 'success' ? 'bg-zinc-700/90 border-zinc-500' : 'bg-red-900/90 border-red-500'
          }`}>
            <Bell className="w-5 h-5 text-[#E2E8F0]" />
            <span className="font-medium">{notification.message}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
