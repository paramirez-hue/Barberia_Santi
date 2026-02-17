
import React, { useState } from 'react';
import { ShopConfig, Appointment, Service } from '../types';
import { ADMIN_PASSWORD } from '../constants';
// Added Scissors to imports to fix line 239 error
import { Settings, Calendar, Clock, Lock, Trash2, Camera, LogOut, LayoutDashboard, ListChecks, Save, Plus, Edit3, X, Palette, Scissors } from 'lucide-react';
import { isToday } from 'date-fns';
import { ICON_MAP } from './ServicesView';

interface AdminViewProps {
  config: ShopConfig;
  setConfig: (config: ShopConfig) => void;
  appointments: Appointment[];
  services: Service[];
  onSaveService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onDeleteAppointment: (id: string) => void;
  onExit: () => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
}

const AdminView: React.FC<AdminViewProps> = ({ config, setConfig, appointments, services, onSaveService, onDeleteService, onDeleteAppointment, onExit, showNotification }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'services' | 'settings'>('dashboard');
  
  const [localConfig, setLocalConfig] = useState<ShopConfig>(config);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para gestión de servicios
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    price: '',
    description: '',
    durationMinutes: '30',
    category: 'Corte',
    iconName: 'Scissors'
  });

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
        setLocalConfig({ ...localConfig, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDay = (dayId: number) => {
    const currentDays = [...localConfig.workingDays];
    const index = currentDays.indexOf(dayId);
    if (index > -1) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(dayId);
    }
    setLocalConfig({ ...localConfig, workingDays: currentDays.sort() });
  };

  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceFormData({
        name: service.name,
        price: service.price.toString(),
        description: service.description,
        durationMinutes: service.durationMinutes.toString(),
        category: service.category,
        iconName: service.iconName || 'Scissors'
      });
    } else {
      setEditingService(null);
      setServiceFormData({
        name: '',
        price: '',
        description: '',
        durationMinutes: '30',
        category: 'Corte',
        iconName: 'Scissors'
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newService: Service = {
      id: editingService ? editingService.id : Math.random().toString(36).substr(2, 9),
      name: serviceFormData.name,
      price: parseFloat(serviceFormData.price),
      description: serviceFormData.description,
      durationMinutes: parseInt(serviceFormData.durationMinutes),
      category: serviceFormData.category,
      iconName: serviceFormData.iconName
    };
    onSaveService(newService);
    setIsServiceModalOpen(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await setConfig(localConfig);
      showNotification("Configuración guardada", "success");
    } catch (err) {
      showNotification("Error al guardar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const todayAppointments = appointments.filter(a => {
    const [y, m, d] = a.date.split('-').map(Number);
    return isToday(new Date(y, m - 1, d));
  }).sort((a,b) => a.time.localeCompare(b.time));

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-xl">
        <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Lock className="w-10 h-10 text-theme-accent" />
          </div>
          <h2 className="font-cinzel text-3xl text-white font-bold mb-2 uppercase tracking-tighter">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-6 mt-6">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl py-4 px-4 outline-none focus:border-theme-accent transition-all text-white text-center"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
            <button type="submit" className="w-full gold-gradient py-4 rounded-xl text-black font-bold uppercase tracking-widest">Entrar</button>
          </form>
          <button onClick={onExit} className="mt-6 text-gray-600 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-theme-secondary p-8 rounded-3xl border border-white/5">
        <div className="flex items-center space-x-6">
          <div className="relative group cursor-pointer">
            {localConfig.logo ? (
              <img src={localConfig.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border-2 border-theme-accent" />
            ) : (
              <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-700 group-hover:border-theme-accent transition-colors">
                <Camera className="w-8 h-8 text-zinc-600 group-hover:text-theme-accent" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Cambiar Logo" />
          </div>
          <div>
            <h2 className="text-3xl font-cinzel font-bold text-white uppercase tracking-tighter">{localConfig.name}</h2>
            <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-900/50 px-2 py-0.5 rounded font-bold uppercase">Online • Supabase</span>
          </div>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-gray-400 rounded-xl hover:bg-zinc-700 transition-colors flex items-center space-x-2 text-xs font-bold uppercase tracking-widest">
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-theme-secondary p-1 rounded-2xl border border-white/5">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'appointments', label: 'Agenda', icon: ListChecks },
          { id: 'services', label: 'Servicios', icon: Edit3 },
          { id: 'settings', label: 'Personalización', icon: Palette },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all font-bold text-[10px] uppercase tracking-widest ${
              activeTab === tab.id ? 'bg-theme-accent text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-theme-secondary border border-white/5 p-8 rounded-3xl">
              <p className="text-gray-600 uppercase text-[10px] font-bold tracking-widest mb-2">Citas Hoy</p>
              <p className="text-4xl font-cinzel font-bold text-white">{todayAppointments.length}</p>
            </div>
            <div className="bg-theme-secondary border border-white/5 p-8 rounded-3xl">
              <p className="text-gray-600 uppercase text-[10px] font-bold tracking-widest mb-2">Servicios Activos</p>
              <p className="text-4xl font-cinzel font-bold text-white">{services.length}</p>
            </div>
            <div className="bg-theme-secondary border border-white/5 p-8 rounded-3xl">
              <p className="text-gray-600 uppercase text-[10px] font-bold tracking-widest mb-2">Próxima Cita</p>
              <p className="text-xl font-cinzel font-bold text-theme-accent">{todayAppointments[0]?.time || '--:--'}</p>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-cinzel text-xl text-white font-bold uppercase tracking-widest">Servicios</h3>
              <button 
                onClick={() => openServiceModal()}
                className="gold-gradient px-6 py-2.5 rounded-xl text-black font-bold uppercase text-[10px] tracking-widest flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(s => {
                const Icon = ICON_MAP[s.iconName || 'Scissors'] || Scissors;
                return (
                  <div key={s.id} className="bg-theme-secondary border border-white/5 p-6 rounded-3xl flex flex-col justify-between hover:border-theme-accent/30 transition-all group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                           <Icon className="w-5 h-5 text-theme-accent" />
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openServiceModal(s)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => confirm("Eliminar?") && onDeleteService(s.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">{s.name}</h4>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{s.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-theme-accent font-bold text-xl">${s.price.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">{s.durationMinutes} MIN</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Paleta de Colores */}
              <div className="bg-theme-secondary border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
                <h3 className="font-cinzel text-lg text-white font-bold flex items-center space-x-2 border-b border-white/5 pb-4 uppercase tracking-widest">
                  <Palette className="w-4 h-4 text-theme-accent" />
                  <span>Temas de Color</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Tono Base (Fondo)</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localConfig.themeColors.primary} 
                        onChange={(e) => setLocalConfig({
                          ...localConfig, 
                          themeColors: { ...localConfig.themeColors, primary: e.target.value }
                        })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono opacity-50 uppercase">{localConfig.themeColors.primary}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Superficie (Tarjetas)</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localConfig.themeColors.secondary} 
                        onChange={(e) => setLocalConfig({
                          ...localConfig, 
                          themeColors: { ...localConfig.themeColors, secondary: e.target.value }
                        })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono opacity-50 uppercase">{localConfig.themeColors.secondary}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Acento (Detalle)</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={localConfig.themeColors.accent} 
                        onChange={(e) => setLocalConfig({
                          ...localConfig, 
                          themeColors: { ...localConfig.themeColors, accent: e.target.value }
                        })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono opacity-50 uppercase">{localConfig.themeColors.accent}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-500 italic">Previsualización: El cambio se aplicará a toda la App al guardar.</p>
                </div>
              </div>

              {/* Ajustes Identidad */}
              <div className="bg-theme-secondary border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
                <h3 className="font-cinzel text-lg text-white font-bold flex items-center space-x-2 border-b border-white/5 pb-4 uppercase tracking-widest">
                  <Settings className="w-4 h-4 text-theme-accent" />
                  <span>Identidad</span>
                </h3>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Nombre del Negocio</label>
                  <input
                    type="text"
                    value={localConfig.name}
                    onChange={(e) => setLocalConfig({ ...localConfig, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl p-4 outline-none focus:border-theme-accent transition-all text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Logo</label>
                  <div className="flex items-center space-x-4 p-4 bg-zinc-800/50 rounded-xl border border-white/5">
                     {localConfig.logo ? (
                       <img src={localConfig.logo} className="w-12 h-12 rounded-lg object-cover border border-theme-accent" alt="Preview" />
                     ) : (
                       <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center"><Camera className="w-5 h-5" /></div>
                     )}
                     <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-theme-accent file:text-black cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Horarios */}
              <div className="bg-theme-secondary border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
                <h3 className="font-cinzel text-lg text-white font-bold flex items-center space-x-2 border-b border-white/5 pb-4 uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-theme-accent" />
                  <span>Horarios</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Apertura</label>
                    <input type="time" value={localConfig.openingTime} onChange={(e) => setLocalConfig({ ...localConfig, openingTime: e.target.value })} className="w-full bg-zinc-800 border border-white/5 rounded-xl p-4 text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">Cierre</label>
                    <input type="time" value={localConfig.closingTime} onChange={(e) => setLocalConfig({ ...localConfig, closingTime: e.target.value })} className="w-full bg-zinc-800 border border-white/5 rounded-xl p-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Días */}
              <div className="bg-theme-secondary border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
                <h3 className="font-cinzel text-lg text-white font-bold flex items-center space-x-2 border-b border-white/5 pb-4 uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-theme-accent" />
                  <span>Días</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['D','L','M','X','J','V','S'].map((label, id) => {
                    const isActive = localConfig.workingDays.includes(id);
                    return (
                      <button 
                        key={id} 
                        onClick={() => toggleDay(id)}
                        className={`w-10 h-10 rounded-full font-bold text-xs border transition-all ${
                          isActive ? 'bg-theme-accent text-black border-theme-accent' : 'bg-zinc-800/50 border-white/5 text-gray-500'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleSaveSettings} disabled={isSaving} className="gold-gradient px-12 py-4 rounded-xl text-black font-bold uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                {isSaving ? 'Aplicando cambios...' : 'Guardar Nueva Configuración'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-theme-secondary border border-white/5 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-zinc-800/50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Fecha/Hora</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block">{appt.date}</span>
                      <span className="text-theme-accent text-xs font-bold">{appt.time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-300">{appt.customerName}</p>
                      <p className="text-gray-600 text-xs">{appt.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold text-gray-400 border border-white/5 uppercase tracking-tighter">{appt.serviceName}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => confirm("Eliminar?") && onDeleteAppointment(appt.id)} className="p-2 text-gray-700 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Servicio */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-theme-secondary border border-white/10 w-full max-w-xl rounded-3xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-cinzel font-bold text-white uppercase tracking-tighter">{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Nombre</label>
                  <input required type="text" value={serviceFormData.name} onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})} className="w-full bg-zinc-800 border border-white/5 rounded-xl p-4 text-white outline-none focus:border-theme-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Precio ($)</label>
                  <input required type="number" step="0.01" value={serviceFormData.price} onChange={e => setServiceFormData({...serviceFormData, price: e.target.value})} className="w-full bg-zinc-800 border border-white/5 rounded-xl p-4 text-white outline-none focus:border-theme-accent" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Elegir Ícono</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-4 bg-black/40 rounded-xl border border-white/5">
                  {Object.keys(ICON_MAP).map(iconName => {
                    const IconComp = ICON_MAP[iconName];
                    const isSelected = serviceFormData.iconName === iconName;
                    return (
                      <button 
                        key={iconName}
                        type="button" 
                        onClick={() => setServiceFormData({...serviceFormData, iconName})}
                        className={`p-3 rounded-lg border transition-all flex items-center justify-center ${
                          isSelected ? 'bg-theme-accent border-theme-accent text-black' : 'bg-zinc-800/50 border-white/5 text-gray-500 hover:border-theme-accent/30'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Descripción</label>
                <textarea rows={3} value={serviceFormData.description} onChange={e => setServiceFormData({...serviceFormData, description: e.target.value})} className="w-full bg-zinc-800 border border-white/5 rounded-xl p-4 text-white outline-none focus:border-theme-accent" />
              </div>

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="flex-1 bg-zinc-800 text-gray-400 font-bold uppercase py-4 rounded-xl text-xs tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] gold-gradient text-black font-bold uppercase py-4 rounded-xl text-xs tracking-widest shadow-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
