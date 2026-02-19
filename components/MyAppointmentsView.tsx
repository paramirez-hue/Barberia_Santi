
import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Loader2, Scissors, History, CheckCircle2, MessageSquare } from 'lucide-react';
import { Appointment, ShopConfig } from '../types';
import { SupabaseService } from '../services/supabase';
// Removed parseISO as it is causing import errors; using native Date instead
import { isAfter } from 'date-fns';

const MyAppointmentsView: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ShopConfig | null>(null);

  useEffect(() => {
    SupabaseService.getConfig().then(setConfig);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Ingresa un número válido de 10 dígitos");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const results = await SupabaseService.getAppointmentsByPhone(phone);
      setAppointments(results);
      if (results.length === 0) {
        setError("No se encontraron citas vinculadas a este número.");
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (appt: Appointment) => {
    const barberPhone = config?.contactPhone || "573176376375";
    const message = `Hola! Soy ${appt.customerName}. Consulto por mi cita de ${appt.serviceName} el día ${appt.date} a las ${appt.time}.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${barberPhone.replace(/\D/g, '')}?text=${encoded}`, '_blank');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="text-center space-y-3">
        <div className="inline-block p-3 bg-theme-accent/5 rounded-full mb-2">
          <History className="w-8 h-8 text-theme-accent" />
        </div>
        <h2 className="font-cinzel text-4xl text-theme-accent font-bold uppercase tracking-tighter">Mis Reservas</h2>
        <p className="text-gray-500 text-sm tracking-wide">Gestiona y consulta el estado de tus citas</p>
      </div>

      <div className="bg-theme-secondary/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-theme-accent/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
        
        <form onSubmit={handleSearch} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600 ml-1">Tu Teléfono Móvil</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="tel"
                placeholder="0987654321"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setError(null);
                  setPhone(e.target.value.replace(/\D/g, ''));
                }}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-12 pr-4 outline-none focus:border-theme-accent transition-all text-2xl font-medium tracking-widest placeholder:text-gray-800"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || phone.length < 10}
            className="w-full gold-gradient py-5 rounded-2xl text-black font-black uppercase tracking-[0.2em] disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.01] active:scale-95 shadow-xl"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Consultar Agenda"}
          </button>
        </form>

        {error && (
          <div className="mt-8 p-4 bg-red-900/10 border border-red-900/20 rounded-xl text-center">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {appointments && appointments.length > 0 && (
          <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-600 border-b border-white/5 pb-2">Resultados Encontrados</h4>
            {appointments.map((appt) => {
              // Replaced parseISO with native Date construction for reliability and to fix the import error
              const [y, m, d] = appt.date.split('-').map(Number);
              const [hh, mm] = appt.time.split(':').map(Number);
              const apptDate = new Date(y, m - 1, d, hh, mm);
              const isUpcoming = isAfter(apptDate, new Date());
              
              return (
                <div key={appt.id} className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-theme-accent/30 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Scissors className="w-4 h-4 text-theme-accent" />
                      <span className="font-bold text-white uppercase text-sm tracking-tight">{appt.serviceName}</span>
                      {isUpcoming && (
                        <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-green-500/20">Confirmada</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-gray-500 text-xs font-medium">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                        {appt.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                        {appt.time}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => openWhatsApp(appt)}
                    className="flex items-center space-x-2 px-4 py-2 bg-theme-accent/5 hover:bg-theme-accent/10 border border-theme-accent/10 rounded-xl text-theme-accent text-[10px] font-bold uppercase tracking-widest transition-all w-full md:w-auto justify-center"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <p className="text-center text-gray-700 text-[10px] uppercase tracking-widest font-medium">
        Usa el botón de WhatsApp para cambios o cancelaciones.
      </p>
    </div>
  );
};

export default MyAppointmentsView;
