-- Amigo Cargo — esquema inicial: perfiles, casilleros, envíos/trackings y tarifas
-- Ejecutar en Supabase SQL Editor (Project > SQL Editor > New query)

-- 1) Secuencia para números de casillero legibles (AC-0001, AC-0002, ...)
create sequence if not exists public.casillero_seq start 1;

-- 2) Perfiles (extiende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  casillero_code text unique not null default ('AC-' || lpad(nextval('public.casillero_seq')::text, 4, '0')),
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Función SECURITY DEFINER para evitar recursión de RLS al chequear rol admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 4) Trigger: crear fila de perfil automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Envíos / trackings
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tracking_code text unique not null default ('AC-ENV-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  description text,
  status text not null default 'compra_confirmada' check (status in (
    'compra_confirmada',
    'casillero_asignado',
    'recibido_bodega',
    'consolidado',
    'en_transito_maritimo',
    'en_aduana_venezuela',
    'listo_para_entrega',
    'entregado',
    'cancelado'
  )),
  weight_kg numeric(10,2),
  volume_m3 numeric(10,3),
  estimated_delivery date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6) Historial de estatus (línea de tiempo visible al cliente)
create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

-- 7) Tarifas (editable desde el panel admin, lectura pública para la calculadora)
create table if not exists public.tariffs (
  service_key text primary key,
  name text not null,
  description text,
  unit text not null check (unit in ('kg', 'fixed', 'percent', 'custom')),
  price numeric(10,2) not null default 0,
  min_charge numeric(10,2),
  extra jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Valores de referencia iniciales (tomados del brochure; editables en /admin/tarifas)
insert into public.tariffs (service_key, name, description, unit, price, min_charge, extra, active)
values
  ('envio_maritimo', 'Envío marítimo', 'Tarifa por kg, con peso volumétrico y mínimo de cobro.', 'kg', 4.50, 35, '{"volumetric_factor_kg_per_m3": 167}'::jsonb, true),
  ('busqueda_producto', 'Búsqueda de producto', 'Localización de producto y cotización estimada.', 'fixed', 25, null, '{}'::jsonb, true),
  ('inspeccion_muestra', 'Inspección de muestra', 'Recepción y validación de muestra antes de compra mayor.', 'fixed', 50, null, '{}'::jsonb, true),
  ('busqueda_proveedores', 'Búsqueda de proveedores', 'Comparación de fábricas según producto, volumen y calidad.', 'fixed', 300, null, '{}'::jsonb, true),
  ('auditoria_fabrica', 'Auditoría de fábrica', 'Visita, inspección e informe de la fábrica del proveedor.', 'fixed', 500, null, '{}'::jsonb, true),
  ('gestion_compra', 'Gestión de compra', 'Gestión de pago al proveedor con base en factura.', 'percent', 12, null, '{}'::jsonb, true),
  ('etiquetado', 'Etiquetado', 'Apoyo de etiquetado según requerimiento.', 'custom', 0, null, '{"nota": "Cotizar según requerimiento"}'::jsonb, true)
on conflict (service_key) do nothing;

-- 8) updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.shipments;
create trigger set_updated_at before update on public.shipments
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.tariffs;
create trigger set_updated_at before update on public.tariffs
  for each row execute function public.set_updated_at();

-- 9) Row Level Security
alter table public.profiles enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
alter table public.tariffs enable row level security;

-- profiles: el usuario ve/edita su propia fila; admin ve/edita todas
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- shipments: el cliente ve solo lo suyo; admin ve/gestiona todo
drop policy if exists "shipments_select_own_or_admin" on public.shipments;
create policy "shipments_select_own_or_admin" on public.shipments
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "shipments_write_admin" on public.shipments;
create policy "shipments_write_admin" on public.shipments
  for all using (public.is_admin()) with check (public.is_admin());

-- shipment_events: visible si puedes ver el envío padre; solo admin escribe
drop policy if exists "events_select_own_or_admin" on public.shipment_events;
create policy "events_select_own_or_admin" on public.shipment_events
  for select using (
    exists (select 1 from public.shipments s where s.id = shipment_id and (s.user_id = auth.uid() or public.is_admin()))
  );

drop policy if exists "events_write_admin" on public.shipment_events;
create policy "events_write_admin" on public.shipment_events
  for all using (public.is_admin()) with check (public.is_admin());

-- tariffs: lectura pública (para la calculadora, incluso sin sesión); solo admin escribe
drop policy if exists "tariffs_select_public" on public.tariffs;
create policy "tariffs_select_public" on public.tariffs
  for select using (true);

drop policy if exists "tariffs_write_admin" on public.tariffs;
create policy "tariffs_write_admin" on public.tariffs
  for all using (public.is_admin()) with check (public.is_admin());
