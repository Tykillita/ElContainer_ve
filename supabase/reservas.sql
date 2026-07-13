-- Esquema y policies para public.reservas
-- Flujo definido:
--   estado_reserva: por_aprobar | aprobada | desaprobada | cancelada
--   estado_lavado:  no_iniciado | en_proceso | carro_listo | completado

alter table if exists public.reservas enable row level security;

-- Asegura columna operativa
alter table if exists public.reservas
  add column if not exists estado_lavado text;

alter table if exists public.reservas
  alter column estado_reserva set default 'por_aprobar';

alter table if exists public.reservas
  alter column estado_lavado set default 'no_iniciado';

-- Normalizacion de data legacy
update public.reservas
set estado_reserva = case
  when estado_reserva = 'pendiente' then 'por_aprobar'
  when estado_reserva = 'en espera' then 'por_aprobar'
  when estado_reserva = 'cancelado' then 'cancelada'
  when estado_reserva = 'completado' then 'aprobada'
  when estado_reserva = 'en proceso' then 'aprobada'
  when estado_reserva = 'carro listo' then 'aprobada'
  else coalesce(estado_reserva, 'por_aprobar')
end;

update public.reservas
set estado_lavado = case
  when estado_lavado in ('no_iniciado', 'en_proceso', 'carro_listo', 'completado') then estado_lavado
  when estado_reserva = 'aprobada' and lower(coalesce(historial::text, '')) like '%carro listo%' then 'carro_listo'
  when estado_reserva = 'aprobada' and lower(coalesce(historial::text, '')) like '%en proceso%' then 'en_proceso'
  when estado_reserva = 'aprobada' and lower(coalesce(historial::text, '')) like '%completado%' then 'completado'
  else 'no_iniciado'
end;

-- Mapeo extra desde status legacy ya normalizados arriba
update public.reservas
set estado_lavado = 'completado'
where estado_lavado = 'no_iniciado'
  and estado_reserva = 'aprobada'
  and coalesce(comentario_postservicio, '') <> '';

-- Constraints de dominio
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reservas_estado_reserva_check'
      and conrelid = 'public.reservas'::regclass
  ) then
    alter table public.reservas
      add constraint reservas_estado_reserva_check
      check (estado_reserva in ('por_aprobar', 'aprobada', 'desaprobada', 'cancelada'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reservas_estado_lavado_check'
      and conrelid = 'public.reservas'::regclass
  ) then
    alter table public.reservas
      add constraint reservas_estado_lavado_check
      check (estado_lavado in ('no_iniciado', 'en_proceso', 'carro_listo', 'completado'));
  end if;
end
$$;

-- Policies
drop policy if exists "Reservas client select own" on public.reservas;
create policy "Reservas client select own"
on public.reservas
for select
to authenticated
using (auth.uid() = usuario_id);

drop policy if exists "Reservas client insert own" on public.reservas;
create policy "Reservas client insert own"
on public.reservas
for insert
to authenticated
with check (auth.uid() = usuario_id);

drop policy if exists "Reservas client cancel with anticipation" on public.reservas;
create policy "Reservas client cancel with anticipation"
on public.reservas
for update
to authenticated
using (
  auth.uid() = usuario_id
  and estado_reserva in ('por_aprobar', 'aprobada')
  and ((fecha::date - ((now() at time zone 'America/Caracas')::date)) >= 3)
)
with check (
  auth.uid() = usuario_id
  and estado_reserva = 'cancelada'
);

drop policy if exists "Reservas admin it select all" on public.reservas;
create policy "Reservas admin it select all"
on public.reservas
for select
to authenticated
using (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
);

drop policy if exists "Reservas admin it update all" on public.reservas;
create policy "Reservas admin it update all"
on public.reservas
for update
to authenticated
using (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
)
with check (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
);

drop policy if exists "Reservas admin it delete all" on public.reservas;
create policy "Reservas admin it delete all"
on public.reservas
for delete
to authenticated
using (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
);

-- Indices
create index if not exists idx_reservas_fecha on public.reservas (fecha);
create index if not exists idx_reservas_hora_inicio on public.reservas (hora_inicio);
create index if not exists idx_reservas_usuario on public.reservas (usuario_id);
create index if not exists idx_reservas_estado_reserva on public.reservas (estado_reserva);
create index if not exists idx_reservas_estado_lavado on public.reservas (estado_lavado);
