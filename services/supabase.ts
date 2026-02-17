
import { createClient } from '@supabase/supabase-js';
import { ShopConfig, Appointment } from '../types';

// Usamos variables de entorno para mayor seguridad en producción
// Fixed: Cast import.meta to any to bypass Property 'env' does not exist on type 'ImportMeta'
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://default.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SupabaseService = {
  async getConfig(): Promise<ShopConfig | null> {
    const { data, error } = await supabase.from('config').select('*').single();
    if (error) {
      console.error('Error fetching config:', error);
      return null;
    }
    return {
      name: data.name,
      logo: data.logo,
      openingTime: data.opening_time,
      closingTime: data.closing_time,
      workingDays: data.working_days
    };
  },

  async updateConfig(config: ShopConfig) {
    const { error } = await supabase
      .from('config')
      .update({
        name: config.name,
        logo: config.logo,
        opening_time: config.opening_time,
        closing_time: config.closingTime,
        working_days: config.workingDays
      })
      .eq('id', 1);
    if (error) throw error;
  },

  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
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
