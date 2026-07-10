# Arquitectura

- `src/main.tsx` arranca React y monta el arbol de proveedores.
- `src/App.tsx` define el layout base (header, main, footer).
- `src/pages/` vistas principales y routing futuro.
- `src/components/` piezas de UI reutilizables.
- `src/context/` estado global con React Context y hooks.
- `src/lib/` servicios/abstracciones para datos y utilidades.
- `src/styles/` tema, tokens y CSS extra a Tailwind.
- `firestore.rules`, `storage.rules`, `firebase.json` configuran Firebase (Firestore, Storage, Hosting).
- `scripts/` script de migración de datos Supabase -> Firebase.
- `supabase/` legado: esquema previo en Postgres (referencia histórica).
