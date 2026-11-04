-- SMROD schema RESET
-- 1) Open SQL Editor → click "New query" (blank)
-- 2) Paste ONLY this file
-- 3) Run
-- WARNING: deletes data in these tables

create extension if not exists pgcrypto with schema extensions;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.security_events cascade;
drop table if exists public.remote_commands cascade;
drop table if exists public.geofences cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.vehicles cascade;
drop table if exists public.devices cascade;
drop table if exists public.telemetry_records cascade;

create table public.vehicles (
  id text primary key,
  plate_number text unique not null,
  vin text,
  make text,
  model text,
  year int,
  color text,
  owner_name text,
  owner_email text,
  owner_phone text,
  device_id text,
  status text default 'active',
  security_status text default 'normal',
  is_immobilized boolean default false,
  current_speed double precision default 0,
  is_moving boolean default false,
  has_incident boolean default false,
  heading double precision default 0,
  latitude double precision,
  longitude double precision,
  last_location_time text,
  battery_voltage double precision,
  fuel_level double precision,
  odometer_km double precision,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_vehicles_plate on public.vehicles (plate_number);
create index idx_vehicles_status on public.vehicles (security_status);

create table public.security_events (
  id text primary key,
  timestamp text,
  vehicle_id text references public.vehicles (id) on delete set null,
  vehicle_plate text,
  device_id text,
  event_type text not null,
  severity text default 'moderate',
  risk_score int default 50,
  status text default 'new',
  latitude double precision,
  longitude double precision,
  location_name text,
  description text,
  assigned_operator text,
  resolution_notes text,
  telemetry_snapshot jsonb,
  created_at timestamptz default now()
);

create index idx_security_events_vehicle on public.security_events (vehicle_id);
create index idx_security_events_status on public.security_events (status);

create table public.remote_commands (
  id text primary key,
  idempotency_key text unique,
  timestamp text,
  vehicle_id text references public.vehicles (id) on delete set null,
  vehicle_plate text,
  device_id text,
  command_type text not null,
  issued_by text,
  operator_role text,
  status text default 'queued',
  safety_check_passed boolean default false,
  delivery_latency_ms int,
  execution_result text,
  created_at timestamptz default now()
);

create index idx_remote_commands_vehicle on public.remote_commands (vehicle_id);

create table public.geofences (
  id text primary key,
  name text not null,
  type text default 'circle',
  radius_meters double precision default 1500,
  center_lat double precision,
  center_lng double precision,
  status text default 'active',
  speed_limit_kmh double precision,
  assigned_vehicles_count int default 0,
  breach_count_24h int default 0,
  created_at text,
  updated_at timestamptz default now()
);

create table public.audit_logs (
  id text primary key,
  timestamp text,
  actor_email text,
  actor_role text,
  action text,
  target_resource text,
  ip_address text,
  status text default 'success',
  details text,
  created_at timestamptz default now()
);

create index idx_audit_logs_actor on public.audit_logs (actor_email);

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  supabase_uid uuid unique not null references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'viewer',
  department text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (supabase_uid, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'viewer')
  )
  on conflict (supabase_uid) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

do $$
begin
  begin
    alter publication supabase_realtime add table public.vehicles;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.security_events;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.remote_commands;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.geofences;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.audit_logs;
  exception when duplicate_object then null;
  end;
end $$;

alter table public.vehicles enable row level security;
alter table public.security_events enable row level security;
alter table public.remote_commands enable row level security;
alter table public.geofences enable row level security;
alter table public.audit_logs enable row level security;
alter table public.user_profiles enable row level security;

create policy "vehicles_authenticated_all" on public.vehicles
  for all to authenticated using (true) with check (true);
create policy "vehicles_anon_read" on public.vehicles
  for select to anon using (true);
create policy "vehicles_anon_write" on public.vehicles
  for insert to anon with check (true);
create policy "vehicles_anon_update" on public.vehicles
  for update to anon using (true) with check (true);

create policy "security_events_authenticated_all" on public.security_events
  for all to authenticated using (true) with check (true);
create policy "security_events_anon_read" on public.security_events
  for select to anon using (true);

create policy "remote_commands_authenticated_all" on public.remote_commands
  for all to authenticated using (true) with check (true);

create policy "geofences_authenticated_all" on public.geofences
  for all to authenticated using (true) with check (true);
create policy "geofences_anon_read" on public.geofences
  for select to anon using (true);

create policy "audit_logs_authenticated_all" on public.audit_logs
  for all to authenticated using (true) with check (true);

create policy "user_profiles_select_own" on public.user_profiles
  for select to authenticated using (auth.uid() = supabase_uid);
create policy "user_profiles_update_own" on public.user_profiles
  for update to authenticated using (auth.uid() = supabase_uid);
