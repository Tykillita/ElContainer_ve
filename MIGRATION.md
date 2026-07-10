# Migración Supabase → Firebase

Proyecto Firebase: **elcontainer-ve** · Hosting: https://elcontainer-ve.web.app

## Qué cambió

| Antes (Supabase) | Ahora (Firebase) |
|---|---|
| Postgres: `reservas`, `profiles`, `plans` | Firestore: colecciones con los mismos campos e IDs |
| Auth email/password + `user_metadata.rol` | Firebase Auth; el rol y perfil viven en `profiles/{uid}` |
| RLS policies | `firestore.rules` (cliente: solo sus reservas, cancelar con ≥3 días; staff: todo) |
| RPC `admin_list_users` | Lectura directa de la colección `profiles` (rules de staff) |
| Storage `avatars` + signed URLs | Firebase Storage `avatars/{uid}/` + `getDownloadURL` |
| Hosting Vercel | Firebase Hosting (`npm run build` + `firebase deploy --only hosting`) |

`src/lib/supabaseClient.ts` fue reemplazado por `src/lib/firebaseClient.ts`. El shape
`user.user_metadata.*` se conserva (hidratado desde Firestore), por lo que las vistas no cambiaron.

## Pasos pendientes (manuales, una sola vez)

1. **Habilitar Auth**: Firebase Console → Authentication → Get started → Sign-in method → Email/Password → Enable.
   (La API está habilitada; falta este clic, no se puede por CLI.)
2. **Storage (avatares)**: requiere plan Blaze desde oct-2024. Console → Storage → Get started (elegir Blaze).
   Luego: `npx firebase-tools deploy --only storage`. Mientras tanto los avatares usan el ícono por defecto.
3. **Migrar datos**:
   ```bash
   # (opcional, para conservar contraseñas) en el SQL Editor de Supabase:
   #   select id, email, encrypted_password from auth.users;
   # descargar como scripts/auth_users.csv
   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key> \
     node scripts/migrate-supabase-to-firebase.mjs
   npx firebase-tools auth:import scripts/auth-users-import.json --hash-algo=BCRYPT --project elcontainer-ve
   ```
   Los UUID de Supabase se conservan como uid/doc id, así que `usuario_id` sigue válido.
4. **Dominio propio** (si aplica): Console → Hosting → Add custom domain.

## Deploy diario

```bash
npm run build
npx firebase-tools deploy --only hosting
# rules/índices solo cuando cambien:
npx firebase-tools deploy --only firestore
```

## Notas

- La regla de cancelación usa 72h UTC como aproximación de "3 días en America/Caracas";
  la validación exacta de zona horaria sigue en el cliente (`canClienteCancelarReserva`).
- Firestore no filtra queries como RLS: las deniega. Por eso `useReservas` restringe las
  queries de clientes a `usuario_id == uid` (misma visibilidad que tenían con RLS).
- Índices compuestos en `firestore.indexes.json`; si una query nueva falla, el error de
  Firestore trae el enlace para crear el índice.
