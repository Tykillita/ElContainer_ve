import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/useAuth';
import { CalendarDays, Award, EyeOff, Users } from 'lucide-react';

// Mock data for demo
const mockStamps = [
  { id: 1, date: '2025-12-01', revealed: true },
  { id: 2, date: '2025-12-10', revealed: true },
  { id: 3, date: '2025-12-20', revealed: false },
  { id: 4, date: null, revealed: false },
  { id: 5, date: null, revealed: false },
  { id: 6, date: null, revealed: false },
];

const mockCalendar = [
  '2025-12-01',
  '2025-12-10',
];

export default function Progreso() {
  const { user } = useAuth?.() ?? { user: null };
  const role = user?.user_metadata?.rol ?? 'cliente';
  const [stamps, setStamps] = useState(mockStamps);

  // Rasca y descubre: simulado con click/tap
  const revealStamp = (idx: number) => {
    setStamps((prev) => prev.map((s, i) => i === idx ? { ...s, revealed: true } : s));
  };

  // Vista cliente
  if (role === 'cliente') {
    return (
      <main className="min-h-screen px-4 py-8 text-white">
        <div className="max-w-md mx-auto space-y-6">
          <header className="flex flex-col gap-1 items-center">
            <h1 className="text-2xl font-bold">Progreso de Recompensas</h1>
            <p className="text-white/70 text-sm">¡Lava tu carro y rasca para descubrir tus sellos!</p>
          </header>

          {/* Tarjeta de sellos */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col items-center gap-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-400" />
              <span className="font-semibold text-orange-300">Colecciona 6 sellos y gana una recompensa</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {stamps.map((stamp, idx) => (
                <button
                  key={stamp.id}
                  className={`relative w-20 h-20 rounded-xl border border-white/10 bg-black/60 flex items-center justify-center shadow-md overflow-hidden group ${stamp.revealed ? '' : 'cursor-pointer active:scale-95 transition-transform'}`}
                  onClick={() => !stamp.revealed && revealStamp(idx)}
                  disabled={stamp.revealed}
                  aria-label={stamp.revealed ? 'Sello descubierto' : 'Rascar para descubrir'}
                >
                  {/* Sello descubierto */}
                  {stamp.revealed ? (
                    <img
                      src="/public/resources/img/logo.png"
                      alt="Sello Autolavado"
                      className="w-12 h-12 object-contain drop-shadow-lg"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-400/80 to-zinc-700/90 flex flex-col items-center justify-center">
                      <EyeOff className="w-8 h-8 text-zinc-200/80 mb-1" />
                      <span className="text-xs text-zinc-100/80">Rascar</span>
                    </div>
                  )}
                  {/* Overlay animación de rasca (simulada) */}
                  {!stamp.revealed && (
                    <div className="absolute inset-0 group-active:opacity-60 transition-opacity bg-zinc-400/60 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
            <div className="text-xs text-white/60 mt-2">Sello desbloqueado cada vez que lavas tu carro</div>
          </section>

          {/* Calendario de sellos */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-white/80 text-sm">Días con sello obtenido</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mockCalendar.length === 0 ? (
                <span className="text-xs text-white/50">Aún no has obtenido sellos.</span>
              ) : (
                mockCalendar.map((date) => (
                  <span key={date} className="rounded-full bg-orange-500/20 text-orange-300 px-3 py-1 text-xs font-semibold">
                    {new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Vista admin/IT
  // Obtener clientes reales desde Supabase
  const [clientes, setClientes] = useState<any[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [stampsByClient, setStampsByClient] = useState<Record<string, number>>({});
  const [errorClientes, setErrorClientes] = useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetchClientes() {
      setLoadingClientes(true);
      setErrorClientes(null);
      try {
        // Consulta clientes desde profiles y cruza con auth.users para obtener email
          const { data: profiles, error: errorProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, role, stamps');
        if (errorProfiles) throw errorProfiles;
        // Obtén emails de auth.users
        const ids = (profiles ?? []).map((p: any) => p.id);
        let emailsById: Record<string, string> = {};
        if (ids.length > 0) {
          const { data: users, error: errorUsers } = await supabase
            .from('users')
            .select('id, email')
            .in('id', ids);
          if (!errorUsers && users) {
            users.forEach((u: any) => { emailsById[u.id] = u.email; });
          }
        }
        // Une profiles con emails
          const clientesFinal = (profiles ?? []).filter((p: any) => p.role === 'cliente').map((p: any) => ({ ...p, email: emailsById[p.id] ?? '' }));
        if (mounted) setClientes(clientesFinal);
      } catch (e: any) {
        if (mounted) setErrorClientes(e?.message || 'Error al cargar clientes');
      } finally {
        if (mounted) setLoadingClientes(false);
      }
    }
    fetchClientes();
    return () => { mounted = false; };
  }, []);

  // Los sellos ya vienen en profiles.stamps
  React.useEffect(() => {
    if (!clientes || clientes.length === 0) return;
    const map: Record<string, number> = {};
    clientes.forEach((c: any) => {
      map[c.id] = typeof c.stamps === 'number' ? c.stamps : 0;
    });
    setStampsByClient(map);
  }, [clientes]);

  const otorgarSello = async (id: string) => {
    const cliente = clientes.find((c: any) => c.id === id);
    if (!cliente) return;
    const nuevo = Math.min((stampsByClient[id] || 0) + 1, 6);
    await supabase.from('profiles').update({ stamps: nuevo }).eq('id', id);
    setStampsByClient((prev) => ({ ...prev, [id]: nuevo }));
  };
  const quitarSello = async (id: string) => {
    const cliente = clientes.find((c: any) => c.id === id);
    if (!cliente) return;
    const nuevo = Math.max((stampsByClient[id] || 0) - 1, 0);
    await supabase.from('profiles').update({ stamps: nuevo }).eq('id', id);
    setStampsByClient((prev) => ({ ...prev, [id]: nuevo }));
  };

  return (
    <main className="min-h-screen px-4 py-8 text-white">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">Panel de Sellos</h1>
          <p className="text-white/70 text-sm">Otorga y administra sellos de clientes</p>
        </header>
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-orange-400" />
            <span className="font-semibold text-orange-300">Clientes con sellos</span>
          </div>
          {errorClientes ? (
            <div className="text-red-400 text-sm">{errorClientes}</div>
          ) : loadingClientes ? (
            <div className="text-white/60 text-sm">Cargando clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="text-white/60 text-sm">No hay clientes registrados.</div>
          ) : clientes.map((cliente) => (
            <div key={cliente.id} className="rounded-xl bg-black/40 border border-white/10 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{cliente.full_name ?? cliente.email ?? cliente.id}</span>
                <div className="flex flex-col gap-2">
                  <button
                    className="rounded-full bg-orange-500 text-white px-3 py-1 text-xs font-semibold hover:bg-orange-400 transition"
                    onClick={() => otorgarSello(cliente.id)}
                  >Otorgar sello</button>
                  <button
                    className="rounded-full bg-zinc-700 text-white px-3 py-1 text-xs font-semibold hover:bg-zinc-600 transition"
                    onClick={() => quitarSello(cliente.id)}
                  >Quitar sello</button>
                </div>
              </div>
              <div className="flex gap-1 mt-1">
                {[...Array(6)].map((_, i) => (
                  <span key={i} className={`w-6 h-6 rounded-full border ${i < (stampsByClient[cliente.id] || 0) ? 'bg-orange-400 border-orange-400' : 'bg-zinc-700 border-zinc-500'}`}></span>
                ))}
              </div>
              {cliente.email && (
                <div className="text-xs text-white/40 mt-1">{cliente.email}</div>
              )}
            </div>
          ))}
          {/* Idea extra: filtro por cliente, historial de sellos, exportar datos, estadísticas */}
          <div className="mt-4 text-xs text-white/50">
            <span className="block mb-1">Ideas extra:</span>
            <ul className="list-disc pl-5 space-y-1">
              <li>Buscar cliente por nombre/correo</li>
              <li>Ver historial de sellos otorgados</li>
              <li>Exportar datos de sellos</li>
              <li>Estadísticas de uso y recompensas</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
