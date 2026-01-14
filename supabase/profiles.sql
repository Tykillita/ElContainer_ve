-- Policies para permitir que cada usuario actualice su propio perfil
-- y que admins/it puedan gestionar todos los perfiles.
--
-- Tabla esperada: public.profiles
-- Columnas usadas por la app: id (uuid), full_name (text), role (text), plan (text), phone (text), joined_at, created_at

-- Asegura RLS
alter table public.profiles enable row level security;

-- Helper: ¿el usuario actual es admin/it?
-- Nota: NO consultamos public.profiles dentro de policies de public.profiles,
-- porque eso puede causar "infinite recursion detected in policy".
-- En su lugar usamos el rol en el JWT (user_metadata.rol), que la app setea.

-- Admin/IT según JWT (ajusta la ruta si tu proyecto guarda el rol en app_metadata)
-- Ej: coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
-- Aquí usamos: auth.jwt()->'user_metadata'->>'rol'

-- SELECT

drop policy if exists "Profiles can select own" on public.profiles;
create policy "Profiles can select own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles admins can select all" on public.profiles;
create policy "Profiles admins can select all"
on public.profiles
for select
to authenticated
using (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
);

-- INSERT

drop policy if exists "Profiles can insert own" on public.profiles;
create policy "Profiles can insert own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles admins can insert any" on public.profiles;
create policy "Profiles admins can insert any"
on public.profiles
for insert
to authenticated
with check (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
);

-- UPDATE

drop policy if exists "Profiles can update own" on public.profiles;
create policy "Profiles can update own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Profiles admins can update any" on public.profiles;
create policy "Profiles admins can update any"
on public.profiles
for update
to authenticated
using (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
)
with check (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
);

-- DELETE (solo admins/it)

drop policy if exists "Profiles admins can delete" on public.profiles;
create policy "Profiles admins can delete"
on public.profiles
for delete
to authenticated
using (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'it')
);
