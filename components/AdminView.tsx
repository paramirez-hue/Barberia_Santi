
import React, { useState } from 'react';
import { ShopConfig, Appointment, Service } from '../types';
import { ADMIN_PASSWORD } from '../constants';
import { Settings, Calendar, Clock, Lock, Trash2, Camera, LogOut, LayoutDashboard, ListChecks, Scissors } from 'lucide-react';
// Fixed: Removed missing export parseISO
import { format, isToday } from 'date-fns';

interface AdminViewProps {
  config: ShopConfig;
  setConfig: (config: ShopConfig) => void;
  appointments: Appointment[];
  onDeleteAppointment: (id: string) => void;
  onExit: () => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
}

const AdminView: React.FC<AdminViewProps> = ({ config, setConfig, appointments, onDeleteAppointment, onExit, showNotification }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'settings'>('dashboard');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logo: reader.result as string });
        showNotification("Logo actualizado en Supabase");
      };
      reader.readAsDataURL(file);
    }
  };

  // Fixed: Using native Date parsing instead of parseISO
  const todayAppointments = appointments.filter(a => {
    const [y, m, d] = a.date.split('-').map(Number);
    return isToday(new Date(y, m - 1, d));
  }).sort((a,b) => a.time.localeCompare(b.time));

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-xl">
        <div className="max-w-md w-full bg-zinc-900 border border-[#E2E8F0]/20 rounded-3xl p-10 shadow-[0_0_50px_rgba(226,232,240,0.1)] text-center">
          <div className="w-20 h-20 bg-[#E2E8F0]/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#E2E8F0]/20">
            <Lock className="w-10 h-10 text-[#E2E8F0]" />
          </div>
          <h2 className="font-cinzel text-3xl text-white font-bold mb-2 uppercase tracking-tighter">Acceso Admin</h2>
          <form onSubmit={handleLogin} className="space-y-6 mt-6">
            <input
              type="password"
              placeholder="123456"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl py-4 px-4 outline-none focus:border-[#E2E8F0] transition-all text-white text-center"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
            <button type="submit" className="w-full gold-gradient py-4 rounded-xl text-black font-bold uppercase tracking-widest shadow-xl">Entrar</button>
          </form>
          <button onClick={onExit} className="mt-6 text-gray-600 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex items-center space-x-6">
          <div className="relative group cursor-pointer">
            {config.logo ? (
              <img src={config.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E2E8F0]" />
            ) : (
              <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-700 group-hover:border-[#E2E8F0]">
                <Camera className="w-8 h-8 text-zinc-600 group-hover:text-[#E2E8F0]" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <div>
            <h2 className="text-3xl font-cinzel font-bold text-white uppercase tracking-tighter">{config.name}</h2>
            <span className="text-[10px] bg-zinc-800 text-[#E2E8F0] border border-zinc-700 px-2 py-0.5 rounded font-bold uppercase mt-2 inline-block">Sincronizado con Supabase Cloud</span>
          </div>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-gray-400 rounded-xl hover:bg-zinc-700 transition-colors flex items-center space-x-2 text-xs font-bold uppercase">
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>

      <div className="flex space-x-1 bg-zinc-900 p-1 rounded-2xl border border-white/5">
        {[
          { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
          { id: 'appointments', label: 'Agenda', icon: ListChecks },
          { id: 'settings', label: 'Negocio', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all font-bold text-[10px] uppercase tracking-widest ${
              activeTab === tab.id ? 'bg-[#E2E8F0] text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-in slide-in-from-bottom-4">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl shadow-xl">
              <p className="text-gray-600 uppercase text-[10px] font-bold tracking-widest mb-2">Hoy</p>
              <p className="text-4xl font-cinzel font-bold text-[#E2E8F0]">{todayAppointments.length}</p>
            </div>
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl shadow-xl">
              <p className="text-gray-600 uppercase text-[10px] font-bold tracking-widest mb-2">Nube</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-500 text-xs font-bold uppercase">Conectado</span>
              </div>
            </div>
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl shadow-xl">
              <p className="text-gray-600 uppercase text-[10px] font-bold tracking-widest mb-2">Total Citas</p>
              <p className="text-4xl font-cinzel font-bold text-[#E2E8F0]">{appointments.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block">{appt.date}</span>
                      <span className="text-[#E2E8F0] text-xs font-bold">{appt.time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-300">{appt.customerName}</p>
                      <p className="text-gray-600 text-xs">{appt.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onDeleteAppointment(appt.id)} className="p-2 text-gray-700 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="font-cinzel text-lg text-white font-bold flex items-center space-x-2 border-b border-white/5 pb-4 uppercase tracking-widest">
                <Settings className="w-4 h-4 text-[#E2E8F0]" />
                <span>Perfil del Negocio</span>
              </h3>
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Nombre de la Barbería</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/5 rounded-xl p-4 outline-none focus:border-[#E2E8F0] transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
