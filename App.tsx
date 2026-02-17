
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, ShopConfig, Appointment, Service } from './types';
import { StorageService } from './services/storage';
import { Menu, X, Scissors, Calendar, Settings, User, LogOut, ChevronRight, Bell, Trash2, Camera } from 'lucide-react';

// Components
import LandingView from './components/LandingView';
import ServicesView from './components/ServicesView';
import BookingView from './components/BookingView';
import AdminView from './components/AdminView';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [config, setConfig] = useState<ShopConfig>(StorageService.getConfig());
  const [appointments, setAppointments] = useState<Appointment[]>(StorageService.getAppointments());
  const [services, setServices] = useState<Service[]>(StorageService.getServices());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    StorageService.saveConfig(config);
  }, [config]);

  useEffect(() => {
    StorageService.saveAppointments(appointments);
  }, [appointments]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBookingComplete = (newAppointment: Appointment) => {
    setAppointments([...appointments, newAppointment]);
    showNotification("¡Cita agendada con éxito!", 'success');
    setView('services');
  };

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
            setConfig={setConfig} 
            appointments={appointments}
            setAppointments={setAppointments}
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
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView={view}
        setView={setView}
        config={config}
      />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        {/* Top Navbar for Mobile/Desktop */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center px-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-[#E2E8F0]" />
          </button>
          
          <h1 className="font-cinzel text-xl text-[#E2E8F0] font-bold tracking-widest uppercase">
            {config.name}
          </h1>

          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        {/* Dynamic View */}
        <div className="pb-20">
          {renderView()}
        </div>

        {/* Notification Toast */}
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
