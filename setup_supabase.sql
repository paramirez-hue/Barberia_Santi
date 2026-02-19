
-- 1. DESACTIVAR RLS TEMPORALMENTE PARA LIMPIEZA
alter table if exists config disable row level security;
alter table if exists services disable row level security;
alter table if exists appointments disable row level security;

-- 2. TABLA DE CONFIGURACIÓN (Asegurar existencia e ID)
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

-- 3. TABLA DE SERVICIOS (Crucial: ID como TEXT para evitar errores de tipo)
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

-- 4. TABLA DE CITAS
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

-- 5. RE-ACTIVAR RLS Y DEFINIR POLÍTICAS ABIERTAS
alter table config enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

-- Limpieza total de políticas previas
do $$ 
declare
    pol record;
begin
    for pol in (select policyname, tablename from pg_policies where schemaname = 'public') loop
        execute format('drop policy if exists %I on %I', pol.policyname, pol.tablename);
    end loop;
end $$;

-- Nuevas políticas universales (Todo permitido para pruebas)
create policy "permit_all_config" on config for all using (true) with check (true);
create policy "permit_all_services" on services for all using (true) with check (true);
create policy "permit_all_appointments" on appointments for all using (true) with check (true);
