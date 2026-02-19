
-- 1. LIMPIEZA TOTAL (Para evitar el error de columnas inexistentes)
drop table if exists appointments;
drop table if exists services;
drop table if exists config;

-- 2. CREACIÓN DE TABLA DE CONFIGURACIÓN
create table config (
  id int8 primary key default 1,
  name text not null default 'NEILS BARBER',
  logo text, 
  opening_time text default '08:00',
  closing_time text default '20:00',
  working_days int[] default '{1,2,3,4,5,6}',
  theme_colors jsonb default '{"primary": "#000000", "secondary": "#18181b", "accent": "#E2E8F0"}'
);

-- Insertar configuración inicial
insert into config (id, name, opening_time, closing_time, working_days, theme_colors)
values (1, 'NEILS BARBER', '08:00', '20:00', '{1,2,3,4,5,6}', '{"primary": "#000000", "secondary": "#18181b", "accent": "#E2E8F0"}');

-- 3. CREACIÓN DE TABLA DE SERVICIOS
create table services (
  id text primary key,
  name text not null,
  price numeric not null default 0,
  description text,
  duration_minutes int4 default 30,
  category text default 'General',
  icon_name text default 'Scissors',
  created_at timestamptz default now()
);

-- 4. CREACIÓN DE TABLA DE CITAS
create table appointments (
  id uuid default gen_random_uuid() primary key,
  service_id text references services(id) on delete set null,
  service_name text,
  date date not null,
  time text not null,
  customer_name text not null,
  phone_number text not null,
  created_at timestamptz default now()
);

-- 5. POLÍTICAS DE SEGURIDAD (RLS)
alter table config enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

create policy "public_access_config" on config for all using (true) with check (true);
create policy "public_access_services" on services for all using (true) with check (true);
create policy "public_access_appointments" on appointments for all using (true) with check (true);
