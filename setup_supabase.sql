
-- 1. LIMPIEZA PREVIA (Opcional, ten cuidado si ya tienes datos)
-- drop table if exists appointments;
-- drop table if exists config;
-- drop table if exists services;

-- 2. TABLA DE CONFIGURACIÓN
create table if not exists config (
  id int8 primary key default 1,
  name text not null default 'NEILS BARBER',
  logo text, -- Aquí se guardará el Base64 de la imagen
  opening_time text default '08:00',
  closing_time text default '20:00',
  working_days int[] default '{1,2,3,4,5,6}' -- Mon-Sat
);

-- Insertar configuración inicial
insert into config (id, name, opening_time, closing_time, working_days)
values (1, 'NEILS BARBER', '08:00', '20:00', '{1,2,3,4,5,6}')
on conflict (id) do nothing;

-- 3. TABLA DE SERVICIOS
create table if not exists services (
  id text primary key,
  name text not null,
  price numeric not null,
  description text,
  duration_minutes int default 30,
  category text
);

-- Insertar servicios iniciales
insert into services (id, name, price, description, duration_minutes, category)
values 
  ('1', 'Corte Clásico', 15.00, 'Corte tradicional con tijera o máquina.', 30, 'Corte'),
  ('2', 'Corte y Barba', 25.00, 'Servicio completo de corte y perfilado de barba.', 45, 'Combo'),
  ('3', 'Perfilado de Barba', 10.00, 'Mantenimiento y alineación de barba.', 20, 'Barba'),
  ('4', 'Tratamiento Capilar', 20.00, 'Hidratación y limpieza profunda.', 30, 'Tratamiento'),
  ('5', 'Corte Neils Special', 35.00, 'Corte premium con masaje capilar y vapor.', 60, 'Corte')
on conflict (id) do nothing;

-- 4. TABLA DE CITAS (APPOINTMENTS)
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  service_id text references services(id),
  service_name text,
  date date not null,
  time text not null,
  customer_name text not null,
  phone_number text not null,
  created_at timestamptz default now()
);

-- 5. POLÍTICAS DE SEGURIDAD (RLS)
-- Nota: Por defecto habilitamos acceso público para simplificar el desarrollo.
-- En producción deberías restringir 'insert' y 'delete' solo a usuarios autenticados.

alter table config enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

-- Permitir lectura pública de todo
create policy "Lectura pública de config" on config for select using (true);
create policy "Lectura pública de servicios" on services for select using (true);
create policy "Lectura pública de citas" on appointments for select using (true);

-- Permitir inserción pública de citas (para los clientes)
create policy "Inserción pública de citas" on appointments for insert with check (true);

-- Permitir edición de config y borrado de citas (para el admin)
-- (En un entorno real, esto se restringiría por auth.uid())
create policy "Edición pública de config" on config for update using (true);
create policy "Borrado público de citas" on appointments for delete using (true);
