
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
      if (error) return null;
      return {
        name: data.name,
        logo: data.logo,
        openingTime: data.opening_time,
        closingTime: data.closing_time,
        workingDays: data.working_days,
        themeColors: data.theme_colors || {
          primary: "#000000",
          secondary: "#18181b",
          accent: "#E2E8F0"
        }
      };
    } catch (error) {
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
        // Fix: Use config.workingDays instead of config.working_days to match ShopConfig type
        working_days: config.workingDays,
        theme_colors: config.themeColors
      })
      .eq('id', 1);
    if (error) throw error;
  },

  async getServices(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(s => ({
        id: s.id.toString(),
        name: s.name,
        price: Number(s.price),
        description: s.description || '',
        durationMinutes: s.duration_minutes || 30,
        category: s.category || 'General',
        iconName: s.icon_name || 'Scissors'
      }));
    } catch (error) {
      return [];
    }
  },

  async saveService(service: Service) {
    // Usamos upsert que requiere una Primary Key definida en el SQL para funcionar como UPDATE
    const { error } = await supabase.from('services').upsert({
      id: service.id,
      name: service.name,
      price: service.price,
      description: service.description,
      duration_minutes: service.durationMinutes,
      category: service.category,
      icon_name: service.iconName
    }, { onConflict: 'id' });
    
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
