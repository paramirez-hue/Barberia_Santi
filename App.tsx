
import React, { useState, useEffect } from 'react';
import { ViewState, ShopConfig, Appointment, Service } from './types';
import { SupabaseService } from './services/supabase';
import { Menu, Loader2, Bell } from 'lucide-react';

import LandingView from './components/LandingView';
import ServicesView from './components/ServicesView';
import BookingView from './components/BookingView';
import AdminView from './components/AdminView';
import MyAppointmentsView from './components/MyAppointmentsView';
import Sidebar from './components/Sidebar';
import { DEFAULT_CONFIG, INITIAL_SERVICES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_CONFIG);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cloudConfig, cloudAppts, cloudServices] = await Promise.all([
        SupabaseService.getConfig(),
        SupabaseService.getAppointments(),
        SupabaseService.getServices()
      ]);
      
      if (cloudConfig) setConfig(cloudConfig);
      setAppointments(cloudAppts || []);
      
      if (!cloudServices || cloudServices.length === 0) {
        for (const s of INITIAL_SERVICES) {
          await SupabaseService.saveService(s);
        }
        const refreshedServices = await SupabaseService.getServices();
        setServices(refreshedServices);
      } else {
        setServices(cloudServices);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', config.themeColors.primary);
    root.style.setProperty('--color-secondary', config.themeColors.secondary);
    root.style.setProperty('--color-accent', config.themeColors.accent);
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '226, 232, 240';
    };
    root.style.setProperty('--color-accent-rgb', hexToRgb(config.themeColors.accent));
  }, [config.themeColors]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBookingComplete = async (newAppointment: Appointment) => {
    try {
      await SupabaseService.saveAppointment(newAppointment);
      await fetchData(); 
      showNotification("¡Cita agendada con éxito!", 'success');
      
      // Notificación automática al barbero
      const barberPhone = config.contactPhone || "593987654321";
      const whatsappMsg = `*NUEVA CITA AGENDADA* 💈\n\n` +
                          `👤 *Cliente:* ${newAppointment.customerName}\n` +
                          `✂️ *Servicio:* ${newAppointment.serviceName}\n` +
                          `📅 *Fecha:* ${newAppointment.date}\n` +
                          `⏰ *Hora:* ${newAppointment.time}\n` +
                          `📞 *Celular:* ${newAppointment.phoneNumber}\n\n` +
                          `_Enviado desde el sistema de reservas._`;
      
      const encodedMsg = encodeURIComponent(whatsappMsg);
      window.open(`https://wa.me/${barberPhone.replace(/\D/g, '')}?text=${encodedMsg}`, '_blank');

      setView('my-appointments'); // Llevar al usuario a ver sus citas
    } catch (err) {
      showNotification("Error al agendar cita", 'error');
    }
  };

  const handleUpdateConfig = async (newConfig: ShopConfig) => {
    try {
      await SupabaseService.updateConfig(newConfig);
      setConfig(newConfig);
      showNotification("Configuración actualizada", 'success');
    } catch (err) {
      showNotification("Error actualizando configuración", 'error');
    }
  };

  const handleSaveService = async (service: Service) => {
    try {
      await SupabaseService.saveService(service);
      await fetchData();
      showNotification("Servicio guardado correctamente", 'success');
    } catch (err) {
      console.error(err);
      showNotification("Error al guardar servicio", 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await SupabaseService.deleteService(id);
      await fetchData();
      showNotification("Servicio eliminado", 'success');
    } catch (err) {
      showNotification("Error al eliminar servicio", 'error');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await SupabaseService.deleteAppointment(id);
      await fetchData();
      showNotification("Cita eliminada", 'success');
    } catch (err) {
      showNotification("Error eliminando cita", 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-white animate-spin opacity-20" />
        <p className="font-cinzel text-white/40 tracking-[0.3em] uppercase text-[10px]">Cargando Sistema...</p>
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
      case 'my-appointments':
        return <MyAppointmentsView />;
      case 'admin':
        return (
          <AdminView 
            config={config} 
            setConfig={handleUpdateConfig} 
            appointments={appointments}
            services={services}
            onSaveService={handleSaveService}
            onDeleteService={handleDeleteService}
            onDeleteAppointment={handleDeleteAppointment}
            onExit={() => setView('services')}
            showNotification={showNotification}
          />
        );
      default:
        return <LandingView config={config} onEnter={() => setView('services')} />;
    }
  };

  const dynamicStyles = `
    :root {
      --color-primary: ${config.themeColors.primary};
      --color-secondary: ${config.themeColors.secondary};
      --color-accent: ${config.themeColors.accent};
    }
    body { background-color: var(--color-primary); }
    .bg-theme-primary { background-color: var(--color-primary); }
    .bg-theme-secondary { background-color: var(--color-secondary); }
    .text-theme-accent { color: var(--color-accent); }
    .border-theme-accent { border-color: var(--color-accent); }
    .gold-gradient { 
      background: linear-gradient(135deg, var(--color-accent), #ffffff, var(--color-accent)); 
    }
    .gold-text { 
      color: var(--color-accent); 
      text-shadow: 0 0 12px rgba(var(--color-accent-rgb), 0.4); 
    }
  `;

  return (
    <div className="min-h-screen text-white relative flex overflow-hidden font-inter" style={{ backgroundColor: 'var(--color-primary)' }}>
      <style>{dynamicStyles}</style>
      
      {view !== 'landing' && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          currentView={view}
          setView={setView}
          config={config}
        />
      )}

      <main className="flex-1 overflow-y-auto h-screen relative no-scrollbar">
        {view !== 'landing' && (
          <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center px-6 bg-black/40">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 shadow-xl"
            >
              <Menu className="w-5 h-5 text-theme-accent" />
            </button>
            
            <h1 className="font-cinzel text-lg text-theme-accent font-black tracking-[0.2em] uppercase text-center flex-1">
              {config.name}
            </h1>

            <div className="w-12 h-12"></div>
          </header>
        )}

        <div className={view === 'landing' ? '' : 'pb-24'}>
          {renderView()}
        </div>

        {notification && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 border backdrop-blur-md ${
            notification.type === 'success' ? 'bg-zinc-900/90 border-theme-accent text-white' : 'bg-red-900/90 border-red-500 text-white'
          }`}>
            <Bell className="w-5 h-5 text-theme-accent" />
            <span className="font-bold text-sm tracking-tight">{notification.message}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
