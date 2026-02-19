
import React, { useState } from 'react';
import { Search, Calendar, Clock, Trash2, Loader2, Scissors } from 'lucide-react';
import { Appointment } from '../types';
import { SupabaseService } from '../services/supabase';
import { format, isAfter, parseISO } from 'date-fns';

const MyAppointmentsView: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    
    setLoading(true);
    setError(null);
    try {
      const results = await SupabaseService.getAppointmentsByPhone(phone);
      setAppointments(results);
      if (results.length === 0) {
        setError("No se encontraron citas para este número.");
      }
    } catch (err) {
      setError("Error al buscar citas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="text-center space-y-2">
        <h2 className="font-cinzel text-3xl text-theme-accent font-bold uppercase tracking-widest">Mis Reservas</h2>
        <p className="text-gray-500">Consulta el estado de tus próximas citas</p>
      </div>

      <div className="bg-theme-secondary border border-white/5 p-8 rounded-3xl shadow-2xl">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="tel"
              placeholder="Ingresa tu celular (10 dígitos)"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-12 pr-4 outline-none focus:border-theme-accent transition-all text-xl font-medium tracking-widest"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || phone.length < 10}
            className="w-full gold-gradient py-4 rounded-xl text-black font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Buscar Citas"}
          </button>
        </form>

        {error && <p className="mt-6 text-center text-red-400 font-medium">{error}</p>}

        {appointments && appointments.length > 0 && (
          <div className="mt-10 space-y-4">
            {appointments.map((appt) => {
              const apptDate = parseISO(`${appt.date}T${appt.time}`);
              const isUpcoming = isAfter(apptDate, new Date());
              
              return (
                <div key={appt.id} className="bg-black/40 border border-white/5 p-6 rounded-2xl flex justify-between items-center group">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Scissors className="w-4 h-4 text-theme-accent" />
                      <span className="font-bold text-white uppercase text-sm">{appt.serviceName}</span>
                      {isUpcoming && (
                        <span className="text-[10px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Próxima</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-gray-400 text-xs">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {appt.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {appt.time}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentsView;
