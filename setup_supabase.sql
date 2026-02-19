
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

-- 2. TABLA DE SERVICIOS (Definición completa para evitar fallos de upsert)
create table if not exists services (
  id text primary key, -- Usamos text para soportar IDs manuales como "1" o UUIDs
  name text not null,
  price numeric not null,
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

-- 4. POLÍTICAS RLS (Robustas para permitir todas las operaciones)
alter table config enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

-- Políticas para Configuración
create policy "Pública select config" on config for select using (true);
create policy "Pública update config" on config for update using (true) with check (true);

-- Políticas para Servicios (Crítico para que funcione el Admin)
create policy "Pública select servicios" on services for select using (true);
create policy "Pública insert servicios" on services for insert with check (true);
create policy "Pública update servicios" on services for update using (true) with check (true);
create policy "Pública delete servicios" on services for delete using (true);

-- Políticas para Citas
create policy "Pública select citas" on appointments for select using (true);
create policy "Pública insert citas" on appointments for insert with check (true);
create policy "Pública delete citas" on appointments for delete using (true);
