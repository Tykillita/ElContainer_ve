-- Tabla para planes de afiliación
-- Nota: este esquema asume Postgres (Supabase).

create table if not exists public.plans (
  id text primary key,
  name text not null,
  description text not null,
  monthly_price numeric not null,
  quarterly_price numeric,
  highlight boolean default false,
  features text[] not null default '{}',
  unavailable text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_plans_updated_at on public.plans;
create trigger trg_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

-- RLS
alter table public.plans enable row level security;

-- Políticas mínimas (ajusta según tu app):
-- 1) Lectura pública (para mostrar tarjetas a visitantes)
drop policy if exists "plans_select_public" on public.plans;
create policy "plans_select_public"
on public.plans
for select
to anon, authenticated
using (true);

-- 2) Escritura solo autenticados (recomendado endurecer a solo admin)
drop policy if exists "plans_write_authenticated" on public.plans;
create policy "plans_write_authenticated"
on public.plans
for insert
to authenticated
with check (true);

drop policy if exists "plans_update_authenticated" on public.plans;
create policy "plans_update_authenticated"
on public.plans
for update
to authenticated
using (true)
with check (true);

drop policy if exists "plans_delete_authenticated" on public.plans;
create policy "plans_delete_authenticated"
on public.plans
for delete
to authenticated
using (true);

-- Seed inicial: planes que usa la web (Silver y Black)
-- Ejecuta este bloque en el SQL Editor de Supabase para crear/actualizar los planes.
insert into public.plans (
  id,
  name,
  description,
  monthly_price,
  quarterly_price,
  highlight,
  features,
  unavailable
)
values
(
  'silver',
  'Silver',
  'Ideal para clientes ocasionales que quieren mantener su auto limpio.',
  9,
  25,
  false,
  array[
    '1 lavado exterior al mes',
    'Descuento en servicios adicionales',
    'Acceso a promociones exclusivas',
    'Sin permanencia',
    'Soporte estándar'
  ]::text[],
  array[
    'Lavado interior',
    'Prioridad en reservas'
  ]::text[]
),
(
  'black',
  'Black',
  'Para quienes buscan un auto impecable todo el mes.',
  19,
  54,
  true,
  array[
    '4 lavados completos al mes',
    'Lavado interior y exterior',
    'Prioridad en reservas',
    'Acceso a promociones exclusivas',
    'Soporte premium'
  ]::text[],
  array[]::text[]
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  monthly_price = excluded.monthly_price,
  quarterly_price = excluded.quarterly_price,
  highlight = excluded.highlight,
  features = excluded.features,
  unavailable = excluded.unavailable;
