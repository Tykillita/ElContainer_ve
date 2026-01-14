# Supabase

Coloca aqui schemas, seeds y scripts de la base.
Ejemplo de variables esperadas:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Instala `@supabase/supabase-js` y crea un cliente en `src/lib` cuando lo necesites.

## Planes de afiliación

- Esquema sugerido: [supabase/plans.sql](supabase/plans.sql)
- Tabla: `public.plans`
- Campos usados por la app: `id`, `name`, `description`, `monthly_price`, `quarterly_price`, `highlight`, `features`, `unavailable`

Notas:
- La app intenta leer/escribir en `plans` desde el contexto `PlanContext`.
- Si RLS bloquea escrituras, revisa/ajusta las policies del SQL.

### Seed (planes por defecto)

Si migraste la lógica a Supabase y la tabla `public.plans` está vacía, la UI mostrará "Sin planes disponibles".
Para crear los 2 planes base (Silver y Black):

- Abre Supabase → **SQL Editor**
- Ejecuta el script [supabase/plans.sql](supabase/plans.sql) (incluye un `INSERT ... ON CONFLICT` al final)

Esto crea/actualiza los planes con ids `silver` y `black`.

## Perfiles (profiles)

Si al guardar datos en la página de Cuenta ves un error como:
`new row violates row-level security policy for table "profiles"`, aplica estas policies:

- Script sugerido: [supabase/profiles.sql](supabase/profiles.sql)

Qué habilita:
- Cada usuario autenticado puede `select/insert/update` su propia fila (`id = auth.uid()`).
- Usuarios con `role` en `('admin','it')` pueden `select/insert/update/delete` cualquier perfil (para que funcionen el panel admin y la gestión de clientes).
