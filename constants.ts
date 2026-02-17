
import { Service, ShopConfig } from './types';

export const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Corte Clásico', price: 15.00, description: 'Corte tradicional con tijera o máquina.', durationMinutes: 30, category: 'Corte' },
  { id: '2', name: 'Corte y Barba', price: 25.00, description: 'Servicio completo de corte y perfilado de barba.', durationMinutes: 45, category: 'Combo' },
  { id: '3', name: 'Perfilado de Barba', price: 10.00, description: 'Mantenimiento y alineación de barba.', durationMinutes: 20, category: 'Barba' },
  { id: '4', name: 'Tratamiento Capilar', price: 20.00, description: 'Hidratación y limpieza profunda.', durationMinutes: 30, category: 'Tratamiento' },
  { id: '5', name: 'Corte Neils Special', price: 35.00, description: 'Corte premium con masaje capilar y vapor.', durationMinutes: 60, category: 'Corte' },
];

export const DEFAULT_CONFIG: ShopConfig = {
  name: "NEILS BARBER",
  logo: null,
  openingTime: "08:00",
  closingTime: "20:00",
  workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
};

export const ADMIN_PASSWORD = "123456";
