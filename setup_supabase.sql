
-- 1. TABLA DE CONFIGURACIÓN (Actualizada)
create table if not exists config (
  id int8 primary key default 1,
  name text not null default 'NEILS BARBER',
  logo text, 
  opening_time text default '08:00',
  closing_time text default '20:00',
  working_days int[] default '{1,2,3,4,5,6}',
  theme_colors jsonb default '{"primary": "#000000", "secondary": "#18181b", "accent": "#E2E8F0"}'
);

-- Asegurar que la configuración inicial existe
insert into config (id, name, opening_time, closing_time, working_days, theme_colors)
values (1, 'NEILS BARBER', '08:00', '20:00', '{1,2,3,4,5,6}', '{"primary": "#000000", "secondary": "#18181b", "accent": "#E2E8F0"}')
on conflict (id) do update set 
  theme_colors = EXCLUDED.theme_colors 
  where config.theme_colors is null;

-- 2. TABLA DE SERVICIOS (Actualizada)
alter table services add column if not exists icon_name text default 'Scissors';

-- 3. TABLA DE CITAS
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

-- 4. POLÍTICAS RLS (Actualizadas)
alter table config enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

create policy "Lectura pública de config" on config for select using (true);
create policy "Lectura pública de servicios" on services for select using (true);
create policy "Lectura pública de citas" on appointments for select using (true);
create policy "Inserción pública de citas" on appointments for insert with check (true);
create policy "Edición pública de config" on config for update using (true);
create policy "Edición pública de servicios" on services for all using (true);
create policy "Borrado público de citas" on appointments for delete using (true);
