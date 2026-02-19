
-- 1. TABLA DE CONFIGURACIÓN
create table if not exists config (
  id int8 primary key default 1,
  name text not null default 'NEILS BARBER',
  logo text, 
  opening_time text default '08:00',
  closing_time text default '20:00',
  working_days int[] default '{1,2,3,4,5,6}',
  theme_colors jsonb default '{"primary": "#000000", "secondary": "#18181b", "accent": "#E2E8F0"}'
);

insert into config (id, name, opening_time, closing_time, working_days, theme_colors)
values (1, 'NEILS BARBER', '08:00', '20:00', '{1,2,3,4,5,6}', '{"primary": "#000000", "secondary": "#18181b", "accent": "#E2E8F0"}')
on conflict (id) do nothing;

-- 2. TABLA DE SERVICIOS
-- Aseguramos que el ID sea TEXT para soportar IDs manuales y generados.
create table if not exists services (
  id text primary key,
  name text not null,
  price numeric not null default 0,
  description text,
  duration_minutes int4 default 30,
  category text default 'General',
  icon_name text default 'Scissors',
  created_at timestamptz default now()
);

-- 3. TABLA DE CITAS
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  service_id text references services(id) on delete set null,
  service_name text,
  date date not null,
  time text not null,
  customer_name text not null,
  phone_number text not null,
  created_at timestamptz default now()
);

-- 4. POLÍTICAS RLS (Limpias y potentes)
alter table config enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

-- Borramos políticas anteriores para evitar conflictos si ya existían
drop policy if exists "Pública select config" on config;
drop policy if exists "Pública update config" on config;
drop policy if exists "Pública select servicios" on services;
drop policy if exists "Pública insert servicios" on services;
drop policy if exists "Pública update servicios" on services;
drop policy if exists "Pública delete servicios" on services;
drop policy if exists "Pública select citas" on appointments;
drop policy if exists "Pública insert citas" on appointments;
drop policy if exists "Pública delete citas" on appointments;

-- Re-creación de políticas
create policy "Permitir todo config" on config for all using (true) with check (true);
create policy "Permitir todo servicios" on services for all using (true) with check (true);
create policy "Permitir todo citas" on appointments for all using (true) with check (true);
