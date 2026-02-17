
export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  durationMinutes: number;
  category: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  phoneNumber: string;
  createdAt: string;
}

export interface ShopConfig {
  name: string;
  logo: string | null;
  openingTime: string; // HH:mm
  closingTime: string; // HH:mm
  workingDays: number[]; // 0-6 (Sun-Sat)
}

export type ViewState = 'landing' | 'services' | 'booking' | 'admin' | 'my-appointments';
