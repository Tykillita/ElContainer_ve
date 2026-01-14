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
