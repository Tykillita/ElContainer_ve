import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/useAuth';
import { resolveAvatarUrl, DEFAULT_AVATAR_URL } from '../context/AuthContext';
import { CalendarDays, Users } from 'lucide-react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import ReservasFilter from '../components/ReservasFilter';

// Tipos globales para debug
declare global {
  interface Window {
    _debugProfiles?: unknown;
    _debugSoloClientes?: unknown;
  }
}

type DbUserRow = {
  full_name?: string;
  email?: string;
  stamps?: number;
  role?: string;
};

type AdminUser = {
  name: string;
  email: string;
  stamps: number;
};

function mapRow(row: DbUserRow): AdminUser {
  return {
    name: row.full_name || 'Sin nombre',
    email: row.email || 'Sin email',
    stamps: typeof row.stamps === 'number' ? row.stamps : 0,
  };
}

const Progreso: React.FC = () => {
    // Estado para ordenamiento de columnas
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { user } = useAuth();
  const [clientes, setClientes] = useState<AdminUser[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [stampsByClient, setStampsByClient] = useState<Record<string, number>>({});

  // Para vista cliente
  const [revealed, setRevealed] = useState<number[]>([]);

  // Filtros para la tabla de clientes
  const [filtroEstado, setFiltroEstado] = useState('todos');
  // Filtrado de clientes
  const clientesFiltrados = clientes.filter(cliente => {
      // ...existing code...
    let estadoMatch = true;
    if (filtroEstado !== 'todos') {
      switch (filtroEstado) {
        case 'sin sellos':
          estadoMatch = cliente.stamps === 0;
          break;
        case '1 sello':
          estadoMatch = cliente.stamps === 1;
          break;
        case '2 sellos':
          estadoMatch = cliente.stamps === 2;
          break;
        case '3 sellos':
          estadoMatch = cliente.stamps === 3;
          break;
        case '4 sellos':
          estadoMatch = cliente.stamps === 4;
          break;
        case '5 sellos':
          estadoMatch = cliente.stamps === 5;
          break;
        case '6 sellos':
          estadoMatch = cliente.stamps === 6;
          break;
        default:
          estadoMatch = true;
      }
    }
    return estadoMatch;
  });

  // Cargar clientes para admin
  // Solo cargar clientes si el usuario autenticado es admin o it (según metadata, no profiles)
  useEffect(() => {
    const meta = user?.user_metadata || {};
    const userRole = meta.rol || meta.role;
    console.log('[Progreso] useEffect ejecutado. user:', user, 'userRole:', userRole);
    if (!user || (userRole !== 'admin' && userRole !== 'it')) return;
    let mounted = true;
    async function fetchClientes() {
      setLoadingClientes(true);
      setErrorClientes(null);
      try {
        console.log('[Progreso] Consultando supabase...');
        const query = 'full_name, email, stamps, role';
        console.log('[Progreso] Ejecutando consulta:', query);
        const { data: profiles, error: errorProfiles } = await supabase
          .from('profiles')
          .select(query);
        if (errorProfiles) throw errorProfiles;
        console.log('[Progreso] Resultado crudo:', profiles);
        if (!profiles || profiles.length === 0) {
          console.warn('[Progreso] La consulta no devolvió ningún registro.');
        }
        if (mounted) {
          const soloClientes = (profiles ?? []).filter((p: DbUserRow) => p.role === 'cliente');
          console.log('[Progreso] soloClientes:', soloClientes);
          const mapped = soloClientes.map((row: DbUserRow) => mapRow(row));
          window._debugProfiles = profiles;
          window._debugSoloClientes = mapped;
          setClientes(mapped);
        }
      } catch (e: unknown) {
        let msg = 'Error al cargar clientes';
        if (typeof e === 'object' && e && 'message' in e && typeof (e as { message?: string }).message === 'string') {
          msg = (e as { message?: string }).message!;
        }
        setErrorClientes(msg);
        console.error('[Progreso] Error al cargar clientes:', e);
      } finally {
        if (mounted) setLoadingClientes(false);
      }
    }
    fetchClientes();
    return () => { mounted = false; };
  }, [user]);

  // Actualizar stampsByClient cuando cambian los clientes
  useEffect(() => {
    if (!clientes || clientes.length === 0) return;
    const map: Record<string, number> = {};
    clientes.forEach((c: AdminUser) => {
      map[c.email] = typeof c.stamps === 'number' ? c.stamps : 0;
    });
    setStampsByClient(map);
  }, [clientes]);

  // Otorgar/Quitar sello
  const otorgarSello = async (email: string) => {
    const cliente = clientes.find((c: AdminUser) => c.email === email);
    if (!cliente) return;
    const nuevo = Math.min((stampsByClient[email] || 0) + 1, 6);
    await supabase.from('profiles').update({ stamps: nuevo }).eq('email', email);
    setStampsByClient((prev) => ({ ...prev, [email]: nuevo }));
  };
  const quitarSello = async (email: string) => {
    const cliente = clientes.find((c: AdminUser) => c.email === email);
    if (!cliente) return;
    const nuevo = Math.max((stampsByClient[email] || 0) - 1, 0);
    await supabase.from('profiles').update({ stamps: nuevo }).eq('email', email);
    setStampsByClient((prev) => ({ ...prev, [email]: nuevo }));
  };

  // Vista cliente: mostrar sellos obtenidos
  useEffect(() => {
    const meta = user?.user_metadata || {};
    const userRole = meta.rol || meta.role;
    if (!user || userRole !== 'cliente') return;
    async function fetchStamps() {
      const userId = user?.id;
      if (!userId) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('stamps')
        .eq('id', userId)
        .single();
      if (!error && data && typeof data.stamps === 'number') {
        setRevealed(Array.from({ length: data.stamps }, (_, i) => i));
      } else {
        setRevealed([]);
      }
    }
    fetchStamps();
  }, [user]);

  // Vista cliente
  const meta = user?.user_metadata || {};
  const userRole = meta.rol || meta.role;
  if (user && userRole === 'cliente') {
    return (
      <MobileScaleWrapper>
        <main className="min-h-screen px-4 py-8 text-white">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-white/80 text-sm">Días con sello obtenido</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {revealed.length === 0 ? (
                <span className="text-xs text-white/50">Aún no has obtenido sellos.</span>
              ) : (
                revealed.map((idx) => (
                  <span key={idx} className="rounded-full bg-orange-500/20 text-orange-300 px-3 py-1 text-xs font-semibold">
                    Sello #{idx + 1}
                  </span>
                ))
              )}
            </div>
          </section>
        </main>
      </MobileScaleWrapper>
    );
  }
  // Vista admin/IT solo si el usuario autenticado es admin/it (según metadata)
  if (user && (userRole === 'admin' || userRole === 'it')) {
        // Ordenamiento por columna
        const sortedClientes = [...clientesFiltrados].sort((a, b) => {
          if (sortBy === 'name') {
            return sortOrder === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
          if (sortBy === 'email') {
            return sortOrder === 'asc'
              ? a.email.localeCompare(b.email)
              : b.email.localeCompare(a.email);
          }
          if (sortBy === 'stamps') {
            return sortOrder === 'asc'
              ? (a.stamps ?? 0) - (b.stamps ?? 0)
              : (b.stamps ?? 0) - (a.stamps ?? 0);
          }
          return 0;
        });
    return (
      <MobileScaleWrapper>
        <main className="min-h-screen px-4 py-10 text-white">
          <div className="max-w-5xl mx-auto space-y-4">
            <h1 className="text-3xl font-bold">Progreso</h1>
            <p className="text-white/70">Aquí podrás ver y gestionar los sellos de clientes registrados.</p>
            {/* Ordenamiento por click en encabezado de tabla. */}
            <ReservasFilter
              value={filtroEstado}
              options={['todos','sin sellos','1 sello','2 sellos','3 sellos','4 sellos','5 sellos','6 sellos']}
              onChange={setFiltroEstado}
            />
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 min-h-[400px] w-full overflow-x-auto">
              {errorClientes ? (
                <div className="text-red-400 text-sm">{errorClientes}</div>
              ) : loadingClientes ? (
                <div className="text-white/60 text-sm">Cargando clientes...</div>
              ) : (
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-white/70 text-sm select-none">
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                        Nombre
                      </th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => {
                        setSortBy('email');
                        setSortOrder(sortBy === 'email' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                        Correo
                      </th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => {
                        setSortBy('stamps');
                        setSortOrder(sortBy === 'stamps' && sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                        Sellos
                      </th>
                      <th className="px-6 py-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedClientes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-6 text-center text-white/80">No hay clientes registrados.</td>
                      </tr>
                    ) : (
                      sortedClientes.map(cliente => (
                        <tr key={cliente.email} className="border-t border-white/10 hover:bg-white/5 transition">
                          <td className="px-6 py-4 font-semibold flex items-center gap-2">
                            <img src={resolveAvatarUrl() || DEFAULT_AVATAR_URL} alt={cliente.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                            {cliente.name}
                          </td>
                          <td className="px-6 py-4">{cliente.email}</td>
                          <td className="px-6 py-4">
                            {[...Array(6)].map((_, i) => (
                              <span key={i} className={`inline-block w-5 h-5 rounded-full border mx-0.5 ${i < (stampsByClient[cliente.email] || cliente.stamps || 0) ? 'bg-orange-400 border-orange-400' : 'bg-zinc-700 border-zinc-500'}`}></span>
                            ))}
                          </td>
                          <td className="px-6 py-4">
                            <button className="rounded-full bg-orange-500 text-white px-3 py-1 text-xs font-semibold hover:bg-orange-400 transition mr-2" onClick={() => otorgarSello(cliente.email)}>Otorgar</button>
                            <button className="rounded-full bg-zinc-700 text-white px-3 py-1 text-xs font-semibold hover:bg-zinc-600 transition" onClick={() => quitarSello(cliente.email)}>Quitar</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </MobileScaleWrapper>
    );
  }
  // Si no es admin/it ni cliente, mostrar mensaje amigable
  return (
    <MobileScaleWrapper>
      <main className="min-h-screen flex items-center justify-center px-4 py-8 text-white">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Acceso restringido</h2>
          <p className="text-white/70 mb-2">No tienes permisos para ver esta página.</p>
          <p className="text-white/50 text-sm">Si crees que esto es un error, contacta al administrador.</p>
        </section>
      </main>
    </MobileScaleWrapper>
  );
};

export default Progreso;
