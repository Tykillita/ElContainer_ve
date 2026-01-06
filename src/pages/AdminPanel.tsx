import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Award,
  Trash2,
  MoreVertical,
  Plus,
  Minus,
  MapPin,
  X,
  Sparkles
} from 'lucide-react';
import { resolveAvatarUrl, DEFAULT_AVATAR_URL } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'admin' | 'it' | 'cliente';

type DbUserRow = {
  id: string;
  full_name?: string | null;
  name?: string | null;
  user_email?: string | null;
  email?: string | null;
  role?: string | null;
  rol?: string | null;
  plan?: string | null;
  plan_name?: string | null;
  stamps?: number | null;
  phone?: string | null;
  avatar_url?: string | null;
  user_avatar?: string | null;
  joined_at?: string | null;
  created_at?: string | null;
  inserted_at?: string | null;
  bio?: string | null;
  location?: string | null;
};

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: string;
  stamps: number;
  joined: string;
  avatar?: string | null;
  phone?: string;
  location?: string;
  bio?: string;
}

const roleStyles: Record<UserRole, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' },
  it: { label: 'IT', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  cliente: { label: 'Cliente', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
};

export default function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stampInputs, setStampInputs] = useState<Record<string, string>>({});
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [stampUser, setStampUser] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'cliente' as UserRole,
    phone: ''
  });

  const mapRow = useCallback((row: DbUserRow): AdminUser => {
    const fullName = row.full_name || row.name || 'Sin nombre';
    const joined = row.joined_at || row.created_at || row.inserted_at || null;
    const role = (row.role || row.rol || 'cliente') as UserRole;
    return {
      id: row.id,
      name: fullName,
      email: row.email || row.user_email || 'Sin email',
      role,
      plan: row.plan || row.plan_name || 'N/A',
      stamps: typeof row.stamps === 'number' ? row.stamps : 0,
      joined: joined ? joined : new Date().toISOString(),
      avatar: row.avatar_url || row.user_avatar || null,
      phone: row.phone || undefined,
      location: row.location || undefined,
      bio: row.bio || undefined
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Primero intentamos vía RPC para cruzar con auth.users
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_list_users');
    if (!rpcError && rpcData) {
      setUsers((rpcData as DbUserRow[]).map(mapRow));
      setLoading(false);
      return;
    }

    // Fallback: leer profiles directo
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, plan, stamps, phone, joined_at, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const mapped = (data || []).map(mapRow);
    setUsers(mapped);
    setLoading(false);
  }, [mapRow]);

  const createUser = async () => {
    setCreateError(null);
    if (!createForm.email || !createForm.password || !createForm.fullName) {
      setCreateError('Completa email, contraseña y nombre.');
      return;
    }
    setCreating(true);
    const { data, error } = await supabase.auth.signUp({
      email: createForm.email,
      password: createForm.password,
      options: {
        data: {
          full_name: createForm.fullName,
          rol: createForm.role,
          phone: createForm.phone,
          avatar_url: null
        }
      }
    });
    if (error) {
      setCreateError(error.message);
      setCreating(false);
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: createForm.fullName,
        role: createForm.role,
        plan: 'N/A',
        stamps: 0,
        phone: createForm.phone,
        joined_at: new Date().toISOString()
      });
    }
    setCreating(false);
    setCreateOpen(false);
    setCreateForm({ email: '', password: '', fullName: '', role: 'cliente', phone: '' });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const rows = useMemo(() => users, [users]);

  const adjustStamps = async (id: string, delta: number) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, stamps: Math.max(0, u.stamps + delta) } : u)));
    const current = users.find(u => u.id === id)?.stamps || 0;
    const { error } = await supabase.from('profiles').update({ stamps: Math.max(0, current + delta) }).eq('id', id);
    if (error) setError(error.message);
  };

  const setStamps = async (id: string, value: number) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, stamps: Math.max(0, value) } : u)));
    const { error } = await supabase.from('profiles').update({ stamps: Math.max(0, value) }).eq('id', id);
    if (error) setError(error.message);
  };

  const removeUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const confirmed = window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    if (selectedUser?.id === id) setSelectedUser(null);
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) setError(error.message);
  };

  const handleManualStamp = (id: string) => {
    const value = parseInt(stampInputs[id] ?? '', 10);
    if (Number.isNaN(value)) return;
    setStamps(id, value);
    setStampUser(null);
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('es-PA', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/30 px-3 py-1 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="text-xs uppercase tracking-[0.15em] text-emerald-100">Admin Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">Control de usuarios</h1>
            <p className="text-white/70">Gestiona roles, planes y sellos con datos reales de Supabase.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 self-start rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            Crear usuario
          </button>
        </header>

        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur p-6 shadow-2xl">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-10 text-center text-white/70">Cargando usuarios...</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/90 relative overflow-visible">
              <thead>
                <tr className="text-white/60 uppercase text-xs">
                  <th className="pb-3 font-semibold">Nombre</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Rol</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Sellos totales</th>
                  <th className="pb-3 font-semibold">Se unió</th>
                  <th className="pb-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 overflow-visible">
                {rows.map(user => {
                  const avatar = resolveAvatarUrl({ avatar_url: user.avatar ?? undefined }) || DEFAULT_AVATAR_URL;
                  const roleInfo = roleStyles[user.role];
                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors overflow-visible">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="relative inline-flex items-center justify-center w-10 h-10 min-w-10 min-h-10 aspect-square rounded-full overflow-hidden border border-white/20 shadow-lg hover:shadow-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black/30"
                            title="Ver detalles"
                          >
                            <img src={avatar} alt={user.name} className="w-full h-full object-cover object-center avatar-img" />
                            <span className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity" />
                          </button>
                          <div>
                            <p className="font-semibold text-base">{user.name}</p>
                            <p className="text-xs text-white/50">ID {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-white/80">{user.email}</td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 border text-xs font-semibold ${roleInfo.className}`}>
                          {roleStyles[user.role].label}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-900/30 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-100">
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base">{user.stamps}</span>
                          <button
                            onClick={() => setStampUser(user)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Editar sellos"
                          >
                            <MoreVertical className="w-4 h-4 text-white/70" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-white/70">{formatDate(user.joined)}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => removeUser(user.id)}
                            className="inline-flex items-center justify-center rounded-full border border-rose-400/60 bg-rose-500/20 p-2 text-rose-100 hover:bg-rose-500/30 hover:border-rose-300 transition-colors"
                            aria-label="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/70"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start gap-3">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-400 shadow-lg bg-black/30">
                  {(() => {
                    const detailAvatar = resolveAvatarUrl({ avatar_url: selectedUser.avatar ?? undefined }) || DEFAULT_AVATAR_URL;
                    return (
                      <img
                        src={detailAvatar}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover object-center avatar-img"
                      />
                    );
                  })()}
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h2 className="text-2xl font-extrabold">{selectedUser.name}</h2>
                  <p className="text-white/70 text-sm">{selectedUser.bio}</p>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 border text-xs font-semibold ${roleStyles[selectedUser.role].className}`}>
                    <ShieldCheck className="w-4 h-4" />
                    {roleStyles[selectedUser.role].label}
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoCard icon={<Mail className="w-4 h-4" />} label="Email" value={selectedUser.email} />
                <InfoCard icon={<Phone className="w-4 h-4" />} label="Teléfono" value={selectedUser.phone ?? 'N/D'} />
                <InfoCard icon={<Calendar className="w-4 h-4" />} label="Alta" value={formatDate(selectedUser.joined)} />
                <InfoCard icon={<Award className="w-4 h-4" />} label="Sellos" value={`${selectedUser.stamps} totales`} />
                <InfoCard icon={<MapPin className="w-4 h-4" />} label="Ubicación" value={selectedUser.location ?? 'N/D'} />
                <InfoCard icon={<Sparkles className="w-4 h-4" />} label="Plan" value={selectedUser.plan} />
              </div>
            </div>
          </div>
        </div>
      )}

      {stampUser && (
        <div className="fixed inset-0 z-[92] flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="relative w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl">
            <button
              onClick={() => setStampUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/70"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-5">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Sellos</p>
                <p className="text-lg font-semibold">{stampUser.name || 'Usuario'}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Sellos actuales</span>
                <span className="text-2xl font-extrabold">{stampUser.stamps}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => adjustStamps(stampUser.id, 1)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-3 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Otorgar
                </button>
                <button
                  onClick={() => adjustStamps(stampUser.id, -1)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-3 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                  Quitar
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={stampInputs[stampUser.id] ?? ''}
                  onChange={(e) => setStampInputs(prev => ({ ...prev, [stampUser.id]: e.target.value }))}
                  placeholder="Asignar manual"
                  className="flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={() => handleManualStamp(stampUser.id)}
                  className="rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500/80 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="relative w-full max-w-lg rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/70"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Crear usuario</h3>
            {createError && (
              <div className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {createError}
              </div>
            )}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-white/70">Nombre completo</label>
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={createForm.fullName}
                  onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nombre y apellido"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-white/70">Email</label>
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={createForm.email}
                  onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="correo@dominio.com"
                  type="email"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-white/70">Contraseña</label>
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={createForm.password}
                  onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  type="password"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-white/70">Rol</label>
                <select
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={createForm.role}
                  onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as UserRole }))}
                >
                  <option value="admin">Admin</option>
                  <option value="it">IT</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-white/70">Teléfono (opcional)</label>
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={createForm.phone}
                  onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Ej: +507 ..."
                  type="tel"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={createUser}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-400 disabled:opacity-60"
                >
                  {creating ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
        <p className="font-semibold text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
