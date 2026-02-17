
import { createClient } from '@supabase/supabase-js';
import { ShopConfig, Appointment, Service } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

export const SupabaseService = {
  async getConfig(): Promise<ShopConfig | null> {
    try {
      const { data, error } = await supabase.from('config').select('*').single();
      if (error) throw error;
      return {
        name: data.name,
        logo: data.logo,
        openingTime: data.opening_time,
        closingTime: data.closing_time,
        workingDays: data.working_days
      };
    } catch (error) {
      console.error('Error fetching config:', error);
      return null;
    }
  },

  async updateConfig(config: ShopConfig) {
    const { error } = await supabase
      .from('config')
      .update({
        name: config.name,
        logo: config.logo,
        opening_time: config.openingTime,
        closing_time: config.closingTime,
        working_days: config.workingDays
      })
      .eq('id', 1);
    if (error) throw error;
  },

  async getServices(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data.map(s => ({
        id: s.id,
        name: s.name,
        price: Number(s.price),
        description: s.description || '',
        durationMinutes: s.duration_minutes || 30,
        category: s.category || 'General'
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  },

  async saveService(service: Service) {
    const { error } = await supabase.from('services').upsert({
      id: service.id,
      name: service.name,
      price: service.price,
      description: service.description,
      duration_minutes: service.durationMinutes,
      category: service.category
    });
    if (error) throw error;
  },

  async deleteService(id: string) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  async getAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        serviceId: d.service_id,
        serviceName: d.service_name,
        date: d.date,
        time: d.time,
        customerName: d.customer_name,
        phoneNumber: d.phone_number,
        createdAt: d.created_at
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  async saveAppointment(appt: Appointment) {
    const { error } = await supabase.from('appointments').insert({
      service_id: appt.serviceId,
      service_name: appt.serviceName,
      date: appt.date,
      time: appt.time,
      customer_name: appt.customerName,
      phone_number: appt.phoneNumber
    });
    if (error) throw error;
  },

  async deleteAppointment(id: string) {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  }
};
