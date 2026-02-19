
import React, { useState, useEffect } from 'react';
import { ViewState, ShopConfig, Appointment, Service } from './types';
import { SupabaseService } from './services/supabase';
import { Menu, Loader2, Bell } from 'lucide-react';

import LandingView from './components/LandingView';
import ServicesView from './components/ServicesView';
import BookingView from './components/BookingView';
import AdminView from './components/AdminView';
import MyAppointmentsView from './components/MyAppointmentsView';
import Sidebar from './components/Sidebar';
import { DEFAULT_CONFIG, INITIAL_SERVICES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_CONFIG);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cloudConfig, cloudAppts, cloudServices] = await Promise.all([
        SupabaseService.getConfig(),
        SupabaseService.getAppointments(),
        SupabaseService.getServices()
      ]);
      
      if (cloudConfig) setConfig(cloudConfig);
      setAppointments(cloudAppts);
      
      if (cloudServices.length === 0) {
        