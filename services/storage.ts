
import { Appointment, ShopConfig, Service } from '../types';
import { DEFAULT_CONFIG, INITIAL_SERVICES } from '../constants';

const KEYS = {
  CONFIG: 'neils_barber_config',
  APPOINTMENTS: 'neils_barber_appointments',
  SERVICES: 'neils_barber_services'
};

export const StorageService = {
  getConfig: (): ShopConfig => {
    const saved = localStorage.getItem(KEYS.CONFIG);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  },
  saveConfig: (config: ShopConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },
  getAppointments: (): Appointment[] => {
    const saved = localStorage.getItem(KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : [];
  },
  saveAppointments: (appointments: Appointment[]) => {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },
  getServices: (): Service[] => {
    const saved = localStorage.getItem(KEYS.SERVICES);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  },
  saveServices: (services: Service[]) => {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  }
};
