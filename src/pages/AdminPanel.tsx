import React, { useMemo, useState, useEffect, useCallback } from 'react';
import AdminPanelFilter from '../components/AdminPanelFilter';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import SecurePasswordGenerator from '../components/SecurePasswordGenerator';
import PhoneNumberInput from '../components/PhoneNumberInput';
import { usePlans } from '../context/PlanContext';
import {
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Trash2,
  MapPin,
  X,
  Sparkles,
  User,
  BadgeInfo
} from 'lucide-react';
import { resolveAvatarUrl, DEFAULT_AVATAR_URL, useAuth } from '../context/AuthContext';
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
  joined: string;
  avatar?: string | null;
  phone?: string;
  location?: string;
  bio?: string;
}

export default AdminPanel;

const roleStyles: Record<UserRole, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' },
  it: { label: 'IT', className: 'bg-white/10 text-white border border-white/30 rounded-full px-3 py-1 flex gap-2 items-center uppercase tracking-wide text-xs' },
  cliente: { label: 'Cliente', className: 'bg-orange-900/30 text-orange-100 border-orange-500/30 rounded-full px-3 py-1 flex gap-2 items-center uppercase tracking-wide text-xs' }
};

function AdminPanel() {
  const { plans } = usePlans();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('joined');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  // (Eliminado: declaración duplicada de plans)
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'cliente' as UserRole,
    phone: '',
    plan: '',
  });

  // Si el usuario es admin, forzar el rol a cliente al abrir el modal
  useEffect(() => {
    if (createOpen && user?.user_metadata?.rol === 'admin') {
      setCreateForm(f => ({ ...f, role: 'cliente' }));
    }
  }, [createOpen, user]);

  // Nota: el plan es opcional; no auto-asignar por defecto.

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
      .select('id, full_name, role, plan, phone, joined_at, created_at')
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

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('es-PA', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const createUser = async () => {
    setCreateError(null);
    if (!createForm.email || !createForm.password || !createForm.fullName || !createForm.phone) {
      setCreateError('Completa email, contraseña, nombre y teléfono.');
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
        plan: createForm.plan || null,
        phone: createForm.phone,
        joined_at: new Date().toISOString()
      });
    }
    setCreating(false);
    setCreateOpen(false);
    setShowCreatePassword(false);
    setShowRoleMenu(false);
    setShowPlanMenu(false);
    setCreateForm({
      email: '',
      password: '',
      fullName: '',
      role: 'cliente',
      phone: '',
      plan: ''
    });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const rows = useMemo(() => {
    let filtered = users;
    if (user?.user_metadata?.rol === 'admin') {
      filtered = filtered.filter(u => u.role === 'cliente');
    } else if (roleFilter !== 'todos') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    const sorted = [...filtered];
    if (sortBy === 'name') {
      sorted.sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sortBy === 'email') {
      sorted.sort((a, b) => sortOrder === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email));
    } else if (sortBy === 'role') {
      sorted.sort((a, b) => sortOrder === 'asc' ? a.role.localeCompare(b.role) : b.role.localeCompare(a.role));
    } else if (sortBy === 'plan') {
      sorted.sort((a, b) => sortOrder === 'asc' ? a.plan.localeCompare(b.plan) : b.plan.localeCompare(a.plan));
    } else if (sortBy === 'joined') {
      sorted.sort((a, b) => sortOrder === 'asc' ? a.joined.localeCompare(b.joined) : b.joined.localeCompare(a.joined));
    }
    return sorted;
  }, [users, roleFilter, sortBy, sortOrder, user]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  return (
    <MobileScaleWrapper>
      <div className="min-h-screen text-white py-10">
        <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-900/30 px-3 py-1 border border-orange-500/30">
              <ShieldCheck className="w-4 h-4 text-orange-300" />
              <span className="text-xs uppercase tracking-[0.15em] text-orange-100">Admin Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight mt-10">Control de usuarios</h1>
            <p className="text-white/70">Gestiona roles y planes con datos reales de Supabase.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 self-start rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-400 transition-colors"
            type="button"
            onClick={() => {
              setShowCreatePassword(false);
              setCreateOpen(true);
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            Crear usuario
          </button>
        </header>

        {user?.user_metadata?.rol === 'it' && (
          <AdminPanelFilter
            value={roleFilter}
            options={['todos', 'admin', 'it', 'cliente']}
            onChange={setRoleFilter}
          />
        )}
        <div className="rounded-3xl bg-black/60 border border-white/10 backdrop-blur p-6 shadow-2xl">
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
                  <th className="pb-3 font-semibold cursor-pointer hover:text-orange-400 transition" onClick={() => handleSort('name')}>
                    Nombre
                  </th>
                  <th className="pb-3 font-semibold cursor-pointer hover:text-orange-400 transition" onClick={() => handleSort('email')}>
                    Email
                  </th>
                  <th className="pb-3 font-semibold cursor-pointer hover:text-orange-400 transition" onClick={() => handleSort('role')}>
                    Rol
                  </th>
                  <th className="pb-3 font-semibold cursor-pointer hover:text-orange-400 transition" onClick={() => handleSort('plan')}>
                    Plan
                  </th>
                  <th className="pb-3 font-semibold cursor-pointer hover:text-orange-400 transition" onClick={() => handleSort('joined')}>
                    Se unió
                  </th>
                  <th className="pb-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 overflow-visible">
                {rows.map(user => {
                  const avatar = resolveAvatarUrl({ avatar_url: user.avatar ?? undefined }) || DEFAULT_AVATAR_URL;
                  const roleInfo = roleStyles[user.role];
                  return (
                    <tr key={user.id} className="transition-colors overflow-visible">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="relative inline-flex items-center justify-center w-10 h-10 min-w-10 min-h-10 aspect-square rounded-full overflow-hidden border border-white/20 shadow-lg hover:shadow-orange-400/30 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-black/30"
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
                        <span className={
                          user.role === 'cliente'
                            ? 'inline-flex items-center rounded-full bg-orange-900/30 border border-orange-500/30 text-orange-100 px-3 py-1 gap-2 uppercase tracking-wide text-xs font-semibold'
                            : `inline-flex items-center ${roleInfo.className}`
                        }>
                          {user.role === 'cliente' ? (
                            <User className="w-4 h-4 mr-1 text-orange-100" />
                          ) : user.role === 'it' ? (
                            <ShieldCheck  className="w-4 h-4 mr-1 text-white" />
                          ) : user.role === 'admin' ? (
                            <BadgeInfo className="w-4 h-4 mr-1 text-orange-300" />
                          ) : null}
                          {roleStyles[user.role].label}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center rounded-full bg-orange-900/30 border border-orange-500/40 px-3 py-1 text-xs font-semibold text-orange-100">
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-white/70">{formatDate(user.joined)}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => removeUser(user.id)}
                            className="hover:text-red-500 transition-colors"
                            aria-label="Eliminar usuario"
                          >
                            <Trash2 className="w-5 h-5 text-white/70" />
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
    </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-black/95 border border-white/10 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/70"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start gap-3">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange-400 shadow-lg bg-black/30">
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
                    {selectedUser.role === 'cliente' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    {roleStyles[selectedUser.role].label}
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-100 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">Email</p>
                    <p className="font-semibold text-sm text-white">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-100 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">Teléfono</p>
                    <p className="font-semibold text-sm text-white">{selectedUser.phone ?? 'N/D'}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">Alta</p>
                    <p className="font-semibold text-sm text-white">{formatDate(selectedUser.joined)}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">Ubicación</p>
                    <p className="font-semibold text-sm text-white">{selectedUser.location ?? 'N/D'}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">Plan</p>
                    <p className="font-semibold text-sm text-white">{selectedUser.plan}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {createOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center pointer-events-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-black/95 border border-white/10 p-6 shadow-2xl">
            <button
              onClick={() => {
                setShowCreatePassword(false);
                setCreateOpen(false);
              }}
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
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={createForm.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nombre y apellido"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-white/70">Plan</label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex justify-between items-center rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 hover:bg-orange-500/10 transition"
                    onClick={() => setShowPlanMenu(v => !v)}
                  >
                    <span>{createForm.plan ? (plans.find(p => p.id === createForm.plan)?.name || 'Selecciona un plan') : 'Sin plan'}</span>
                    <svg className={`w-4 h-4 ml-2 transition-transform ${showPlanMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showPlanMenu && (
                    <ul className="absolute left-0 mt-2 w-full rounded-xl bg-black/95 border border-white/10 shadow-lg z-20 overflow-hidden animate-fade-in">
                      <li>
                        <button
                          type="button"
                          className={`w-full text-left px-4 py-2 hover:bg-orange-500/10 ${!createForm.plan ? 'font-bold bg-white/10 text-orange-400' : 'text-white'}`}
                          onClick={() => { setCreateForm(f => ({ ...f, plan: '' })); setShowPlanMenu(false); }}
                        >
                          Sin plan
                        </button>
                      </li>
                      {plans.map(plan => (
                        <li key={plan.id}>
                          <button
                            type="button"
                            className={`w-full text-left px-4 py-2 hover:bg-orange-500/10 ${createForm.plan === plan.id ? 'font-bold bg-white/10 text-orange-400' : 'text-white'}`}
                            onClick={() => { setCreateForm(f => ({ ...f, plan: plan.id })); setShowPlanMenu(false); }}
                          >
                            {plan.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Solo los IT pueden elegir el rol, los admin solo pueden crear clientes */}
              {user?.user_metadata?.rol === 'it' ? (
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Rol</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full flex justify-between items-center rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 hover:bg-orange-500/10 transition"
                      onClick={() => setShowRoleMenu(v => !v)}
                    >
                      <span className="capitalize">{createForm.role}</span>
                      <svg className={`w-4 h-4 ml-2 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showRoleMenu && (
                      <ul className="absolute left-0 mt-2 w-full rounded-xl bg-black/95 border border-white/10 shadow-lg z-20 overflow-hidden animate-fade-in">
                        {[
                          { value: 'admin', label: 'Admin', color: 'text-[#eab308]' },
                          { value: 'it', label: 'IT', color: 'text-white' },
                          { value: 'cliente', label: 'Cliente', color: 'text-orange-400' },
                        ].map(opt => (
                          <li key={opt.value}>
                            <button
                              type="button"
                              className={`w-full text-left px-4 py-2 hover:bg-orange-500/10 ${opt.color} ${createForm.role === opt.value ? 'font-bold bg-white/10' : ''}`}
                              onClick={() => { setCreateForm(f => ({ ...f, role: opt.value as UserRole })); setShowRoleMenu(false); }}
                            >
                              {opt.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Rol</label>
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white cursor-not-allowed opacity-60"
                    value="cliente"
                    disabled
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-white/70">Email</label>
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={createForm.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  type="email"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-white/70">Contraseña</label>
                <div className="relative">
                  <input
                    className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-12"
                    value={createForm.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    type={showCreatePassword ? 'text' : 'password'}
                  />
                  <button
                    type="button"
                    aria-label={showCreatePassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-500 focus:outline-none"
                    tabIndex={0}
                    onClick={() => setShowCreatePassword(v => !v)}
                  >
                    {showCreatePassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.938 4.675A9.956 9.956 0 012 15c0-5.523 4.477-10 10-10 1.657 0 3.236.336 4.675.938" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="pt-1">
                  <SecurePasswordGenerator
                    disabled={creating}
                    fullName={createForm.fullName}
                    onGenerate={(password) => setCreateForm(f => ({ ...f, password }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-white/70">Teléfono</label>
                <PhoneNumberInput
                  value={createForm.phone}
                  onChange={(value) => setCreateForm(f => ({ ...f, phone: value }))}
                  defaultCountry="ve"
                  placeholder="Número de teléfono"
                  required
                  heightPx={40}
                  fontSizePx={16}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15"
                  onClick={() => {
                    setShowCreatePassword(false);
                    setCreateOpen(false);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={createUser}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-400 disabled:opacity-60"
                >
                  {creating ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileScaleWrapper>
  );
}





