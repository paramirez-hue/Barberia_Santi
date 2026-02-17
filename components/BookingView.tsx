
import React, { useState, useMemo } from 'react';
import { Service, ShopConfig, Appointment } from '../types';
import { format, addDays, isBefore, startOfDay, parse, addHours, isAfter, setHours, setMinutes, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronLeft, User, Phone, CheckCircle } from 'lucide-react';

interface BookingViewProps {
  service: Service | null;
  config: ShopConfig;
  existingAppointments: Appointment[];
  onComplete: (appointment: Appointment) => void;
  onBack: () => void;
}

const BookingView: React.FC<BookingViewProps> = ({ service, config, existingAppointments, onComplete, onBack }) => {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const availableDates = useMemo(() => {
    const dates = [];
    let current = new Date();
    while (dates.length < 14) {
      if (config.workingDays.includes(current.getDay())) {
        dates.push(format(current, 'yyyy-MM-dd'));
      }
      current = addDays(current, 1);
    }
    return dates;
  }, [config.workingDays]);

  const availableTimes = useMemo(() => {
    if (!date) return [];
    
    const slots = [];
    const [openH, openM] = config.openingTime.split(':').map(Number);
    const [closeH, closeM] = config.closingTime.split(':').map(Number);
    
    let current = setMinutes(setHours(parse(date, 'yyyy-MM-dd', new Date()), openH), openM);
    const end = setMinutes(setHours(parse(date, 'yyyy-MM-dd', new Date()), closeH), closeM);

    const now = new Date();
    const leadTime = addHours(now, 3);

    while (isBefore(current, end)) {
      const timeStr = format(current, 'HH:mm');
      const isTooEarly = isBefore(current, leadTime);
      const isTaken = existingAppointments.some(a => a.date === date && a.time === timeStr);

      if (!isTooEarly && !isTaken) {
        slots.push(timeStr);
      }
      current = addHours(current, 1);
    }
    return slots;
  }, [date, config, existingAppointments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const dailyCount = existingAppointments.filter(a => a.phoneNumber === phone && a.date === date).length;
    if (dailyCount >= 2) {
      setError("Máximo 2 citas permitidas por día con este número.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("El celular debe tener 10 dígitos numéricos.");
      return;
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      setError("Nombre inválido (usa letras y números).");
      return;
    }

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: service?.id || '0',
      serviceName: service?.name || 'Servicio',
      date,
      time,
      customerName: name,
      phoneNumber: phone,
      createdAt: new Date().toISOString()
    };

    onComplete(newAppointment);
  };

  if (!service) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right duration-500">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-[#E2E8F0] transition-colors mb-6 group">
        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>

      <div className="bg-zinc-900 border border-[#E2E8F0]/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-[#E2E8F0]/5 rounded-2xl border border-[#E2E8F0]/20">
            <CalendarIcon className="w-8 h-8 text-[#E2E8F0]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-cinzel text-white">Reserva</h2>
            <p className="text-[#E2E8F0] font-medium opacity-80">{service.name} — ${service.price.toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-xs font-bold tracking-widest uppercase text-gray-600">Calendario</label>
            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
              {availableDates.map((d) => {
                const isSelected = date === d;
                const dateObj = parse(d, 'yyyy-MM-dd', new Date());
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setDate(d); setTime(''); }}
                    className={`flex-shrink-0 w-20 py-4 rounded-2xl border transition-all flex flex-col items-center justify-center ${
                      isSelected 
                      ? 'bg-[#E2E8F0] border-[#E2E8F0] text-black shadow-lg scale-105' 
                      : 'bg-zinc-800/50 border-white/5 text-gray-500 hover:border-[#E2E8F0]/30'
                    }`}
                  >
                    <span className="text-[10px] uppercase opacity-60 font-bold mb-1">{format(dateObj, 'EEE')}</span>
                    <span className="text-xl font-bold">{format(dateObj, 'd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {date && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-600">Horario</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {availableTimes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      time === t 
                      ? 'bg-[#E2E8F0] border-[#E2E8F0] text-black shadow-lg scale-105' 
                      : 'bg-zinc-800/50 border-white/5 text-gray-500 hover:border-[#E2E8F0]/30'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {time && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="h-px bg-white/5 w-full" />
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-600">Confirmación</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Nombre Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-4 px-4 focus:border-[#E2E8F0] outline-none transition-all"
                />

                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Celular"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-4 px-4 focus:border-[#E2E8F0] outline-none transition-all"
                />
              </div>

              {error && <div className="text-red-400 text-xs font-medium animate-pulse">{error}</div>}

              <button
                type="submit"
                className="w-full gold-gradient py-5 rounded-xl text-black font-bold text-lg uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-6 h-6" />
                <span>Confirmar</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingView;
