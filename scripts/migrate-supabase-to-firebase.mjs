#!/usr/bin/env node
/**
 * Migra datos de Supabase a Firebase (proyecto elcontainer-ve).
 *
 * Uso:
 *   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/migrate-supabase-to-firebase.mjs
 *
 * Qué hace:
 *   1. Lee reservas, profiles y plans de Supabase (REST, service role).
 *   2. Lee usuarios de Supabase Auth (admin API) y fusiona su user_metadata en profiles.
 *   3. Escribe todo en Firestore conservando los UUID como IDs de documento.
 *   4. Genera scripts/auth-users-import.json para `firebase auth:import`.
 *      - Con contraseñas si existe scripts/auth_users.csv (export SQL: ver abajo).
 *      - Sin contraseñas si no existe (los usuarios harían "olvidé mi contraseña").
 *
 * Para conservar contraseñas, primero ejecuta en el SQL Editor de Supabase:
 *   select id, email, encrypted_password from auth.users;
 * y descarga el resultado como CSV en scripts/auth_users.csv
 *
 * Requiere haber hecho `firebase login` (usa el token del CLI, sin service account).
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT = 'elcontainer-ve';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

// ---------- token de firebase-tools (mismo login del CLI) ----------
async function firebaseAccessToken() {
  const cfgPath = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const body = new URLSearchParams({
    // OAuth client público del Firebase CLI
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    refresh_token: cfg.tokens.refresh_token,
    grant_type: 'refresh_token',
  });
  const res = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body })).json();
  if (!res.access_token) throw new Error('No se pudo obtener token: ' + JSON.stringify(res));
  return res.access_token;
}

// ---------- lectura desde Supabase ----------
async function supabaseRest(pathname) {
  const res = await fetch(`${SUPABASE_URL}${pathname}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) throw new Error(`${pathname}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchAuthUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const data = await supabaseRest(`/auth/v1/admin/users?page=${page}&per_page=1000`);
    const batch = data.users ?? data;
    if (!batch.length) break;
    users.push(...batch);
    if (batch.length < 1000) break;
  }
  return users;
}

// ---------- escritura en Firestore (REST) ----------
function toFsValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFsValue) } };
  if (typeof v === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toFsValue(x)])) } };
  }
  return { stringValue: String(v) };
}

async function writeCollection(token, collectionId, docs) {
  const base = `projects/${PROJECT}/databases/(default)/documents`;
  for (let i = 0; i < docs.length; i += 400) {
    const chunk = docs.slice(i, i + 400);
    const writes = chunk.map(({ id, data }) => ({
      update: {
        name: `${base}/${collectionId}/${id}`,
        fields: Object.fromEntries(
          Object.entries(data).filter(([k]) => k !== 'id').map(([k, v]) => [k, toFsValue(v)])
        ),
      },
    }));
    const res = await fetch(`https://firestore.googleapis.com/v1/${base}:batchWrite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes }),
    });
    if (!res.ok) throw new Error(`batchWrite ${collectionId}: ${res.status} ${await res.text()}`);
    console.log(`  ${collectionId}: ${Math.min(i + 400, docs.length)}/${docs.length}`);
  }
}

// ---------- CSV simple (id,email,encrypted_password) ----------
function parseHashCsv(file) {
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of lines.slice(1)) {
    const [id, , hash] = line.split(',').map((s) => s.replace(/^"|"$/g, ''));
    if (id && hash) map.set(id, hash);
  }
  return map;
}

// ---------- main ----------
const token = await firebaseAccessToken();

console.log('Leyendo Supabase...');
const [reservas, profiles, plans, authUsers] = await Promise.all([
  supabaseRest('/rest/v1/reservas?select=*'),
  supabaseRest('/rest/v1/profiles?select=*'),
  supabaseRest('/rest/v1/plans?select=*'),
  fetchAuthUsers(),
]);
console.log(`  reservas=${reservas.length} profiles=${profiles.length} plans=${plans.length} authUsers=${authUsers.length}`);

// profiles: fila de la tabla + metadata de auth fusionadas en un solo doc
const profileById = new Map(profiles.map((p) => [p.id, p]));
const profileDocs = authUsers.map((u) => {
  const row = profileById.get(u.id) ?? {};
  const meta = u.user_metadata ?? {};
  profileById.delete(u.id);
  return {
    id: u.id,
    data: {
      email: u.email ?? row.email ?? null,
      full_name: row.full_name ?? meta.full_name ?? null,
      nombre: meta.nombre ?? null,
      apellido: meta.apellido ?? null,
      phone: row.phone ?? meta.phone ?? meta.telefono ?? null,
      role: row.role ?? meta.rol ?? 'cliente',
      plan: row.plan ?? null,
      stamps: row.stamps ?? 0,
      bio: meta.bio ?? row.bio ?? null,
      location: row.location ?? null,
      avatar_icon: meta.avatar_icon ?? 'default',
      avatar_url: meta.avatar_url ?? null,
      avatar_path: meta.avatar_path ?? null,
      created_at: u.created_at ?? row.created_at ?? null,
      joined_at: row.joined_at ?? u.created_at ?? null,
    },
  };
});
// perfiles huérfanos (sin usuario auth)
for (const [id, row] of profileById) profileDocs.push({ id, data: { ...row, role: row.role ?? 'cliente' } });

console.log('Escribiendo en Firestore...');
await writeCollection(token, 'plans', plans.map((p) => ({ id: String(p.id), data: p })));
await writeCollection(token, 'profiles', profileDocs);
await writeCollection(token, 'reservas', reservas.map((r) => ({ id: String(r.id), data: r })));

// auth:import
const hashes = parseHashCsv(path.join('scripts', 'auth_users.csv'));
const importUsers = authUsers.map((u) => {
  const rec = {
    localId: u.id,
    email: u.email,
    emailVerified: Boolean(u.email_confirmed_at),
    displayName: u.user_metadata?.full_name ?? undefined,
    createdAt: u.created_at ? String(Date.parse(u.created_at)) : undefined,
  };
  const hash = hashes.get(u.id);
  if (hash) rec.passwordHash = Buffer.from(hash).toString('base64');
  return rec;
});
fs.writeFileSync(path.join('scripts', 'auth-users-import.json'), JSON.stringify({ users: importUsers }, null, 2));

const conHash = importUsers.filter((u) => u.passwordHash).length;
console.log(`\nListo. scripts/auth-users-import.json generado (${importUsers.length} usuarios, ${conHash} con contraseña).`);
console.log('Importa los usuarios con:');
console.log(conHash
  ? '  npx firebase-tools auth:import scripts/auth-users-import.json --hash-algo=BCRYPT --project elcontainer-ve'
  : '  npx firebase-tools auth:import scripts/auth-users-import.json --project elcontainer-ve   (sin contraseñas: usar "olvidé mi contraseña")');
