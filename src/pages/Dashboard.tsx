import React, { useState, useEffect } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import { TrendingUp, Tag, Gift, Zap, ShowerHead, Users, Banknote, CalendarClock, Sparkles, ShieldCheck } from 'lucide-react';
import { resolveAvatarUrl, DEFAULT_AVATAR_URL } from '../context/AuthContext';
import { UserRound } from 'lucide-react';

import { supabase } from '../lib/supabaseClient';

import DashboardTimeFilter from '../components/DashboardTimeFilter';

export default function Dashboard() {
  // Opciones de filtro de tiempo
  const timeOptions = [
    'hour',
    'today',
    'yesterday',
    'tomorrow',
    'dayAfterTomorrow',
    'thisWeek',
    'lastWeek',
    'nextWeek',
    'lastMonth',
    'nextMonth',
    'totals',
  ];
  const [timeFilter, setTimeFilter] = useState('hour');

  const { user } = useAuth();

  // Estado para métricas reales
  const [metricsData, setMetricsData] = useState({
    lavados: 0,
    clientes: 0,
    ingresos: 0,
    reservasActivas: 0,
    loading: true,
    error: null as string | null,
  });

  // Sellos reales (profiles.stamps)
  const [stampsState, setStampsState] = useState({
    stamps: 0,
    loading: true,
    error: null as string | null,
  });

  // Utilidad para obtener rangos de fechas/horas según filtro
  function getTimeRange(filter: string) {
    const now = new Date();
    let start: Date, end: Date;
    switch (filter) {
      case 'hour':
        start = new Date(now);
        start.setMinutes(0, 0, 0);
        end = new Date(start);
        end.setHours(start.getHours() + 1);
        break;
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        break;
      case 'thisWeek':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;
      case 'lastWeek':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 7);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;
      case 'nextWeek':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 7);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'nextMonth':
        start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 2, 1);
        break;
      case 'tomorrow':
        start = new Date(now);
        start.setDate(now.getDate() + 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        break;
      case 'yesterday':
        start = new Date(now);
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        break;
      case 'dayAfterTomorrow':
        start = new Date(now);
        start.setDate(now.getDate() + 2);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        break;
      case 'totals':
      default:
        start = new Date(2000, 0, 1);
        end = new Date(2100, 0, 1);
        break;
    }
    return { start, end };
  }

  // Hook para cargar métricas reales
  useEffect(() => {
    async function fetchMetrics() {
      setMetricsData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const { start, end } = getTimeRange(timeFilter);
        // Lavados realizados (reservas completadas)
        const { count: lavados } = await supabase
          .from('reservas')
          .select('id', { count: 'exact', head: true })
          .gte('fecha', start.toISOString().slice(0, 10))
          .lt('fecha', end.toISOString().slice(0, 10))
          .eq('estado_reserva', 'completado');

        // Clientes registrados
        const { count: clientes } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', start.toISOString())
          .lt('created_at', end.toISOString());

        // Ingresos (sumar monto_pago de reservas pagadas)
        const { data: reservasPagadas } = await supabase
          .from('reservas')
          .select('monto_pago, fecha')
          .gte('fecha', start.toISOString().slice(0, 10))
          .lt('fecha', end.toISOString().slice(0, 10))
          .eq('estado_pago', 'pagado');
        const ingresos = (reservasPagadas || []).reduce((sum, r) => sum + (r.monto_pago || 0), 0);

        // Reservas activas para la hora actual (solo para filtro 'hour', si no, mostrar todas activas en rango)
        let reservasActivas = 0;
        if (timeFilter === 'hour') {
          const now = new Date();
          const hourStr = now.toTimeString().slice(0, 2); // 'HH'
          const { data: activas } = await supabase
            .from('reservas')
            .select('id, hora_inicio')
            .eq('fecha', now.toISOString().slice(0, 10))
            .gte('hora_inicio', `${hourStr}:00`)
            .lt('hora_inicio', `${('0' + (parseInt(hourStr) + 1)).slice(-2)}:00`)
            .not('estado_reserva', 'in', ['cancelado', 'completado']);
          reservasActivas = (activas || []).length;
        } else {
          const { count: activasCount } = await supabase
            .from('reservas')
            .select('id', { count: 'exact', head: true })
            .gte('fecha', start.toISOString().slice(0, 10))
            .lt('fecha', end.toISOString().slice(0, 10))
            .not('estado_reserva', 'in', ['cancelado', 'completado']);
          reservasActivas = activasCount || 0;
        }

        setMetricsData({
          lavados: lavados || 0,
          clientes: clientes || 0,
          ingresos: ingresos || 0,
          reservasActivas: reservasActivas || 0,
          loading: false,
          error: null,
        });
      } catch (e) {
        setMetricsData(prev => ({ ...prev, loading: false, error: (e instanceof Error ? e.message : 'Error al cargar métricas') }));
      }
    }
    fetchMetrics();
  }, [timeFilter]);

  // Hook para cargar sellos reales del usuario
  useEffect(() => {
    let cancelled = false;
    async function fetchStamps() {
      if (!user?.id) {
        setStampsState({ stamps: 0, loading: false, error: null });
        return;
      }
      setStampsState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('stamps')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        const stamps = typeof data?.stamps === 'number' ? data.stamps : 0;
        if (!cancelled) setStampsState({ stamps, loading: false, error: null });
      } catch (e) {
        if (!cancelled) {
          setStampsState({
            stamps: 0,
            loading: false,
            error: e instanceof Error ? e.message : 'Error al cargar sellos',
          });
        }
      }
    }
    fetchStamps();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const userMeta = (user?.user_metadata ?? null) as { nombre?: string; avatar_url?: string; picture?: string; avatar_icon?: string } | null;
  const nombre = userMeta?.nombre || user?.email || 'Cliente';
  const memberSince = user?.created_at ? new Date(user.created_at) : null;
  const avatarUrl = resolveAvatarUrl(userMeta ?? undefined);
  const isDefaultAvatar = avatarUrl === DEFAULT_AVATAR_URL;
  const role = (user?.user_metadata?.rol as 'admin' | 'it' | 'cliente' | undefined) ?? 'cliente';

  const sellosAcumulados = stampsState.stamps;
  const sellosParaPremio = 6;
  const sellosCiclo = sellosAcumulados % sellosParaPremio;
  const faltanSellos = sellosCiclo === 0 && sellosAcumulados > 0 ? 0 : sellosParaPremio - sellosCiclo;
  const porcentajeFaltante = Math.round((faltanSellos / sellosParaPremio) * 100);

  // Simulación de métricas del autolavado
  const metrics = [
    { label: 'Lavados realizados', value: metricsData.lavados, icon: <ShowerHead className="w-6 h-6 text-white" strokeWidth={2.4} /> },
    { label: 'Clientes registrados', value: metricsData.clientes, icon: <Users className="w-6 h-6 text-white" strokeWidth={2.4} /> },
    { label: `Ingresos`, value: `$${metricsData.ingresos}`, icon: <Banknote className="w-6 h-6 text-white" strokeWidth={2.4} /> },
    { label: 'Reservas activas', value: metricsData.reservasActivas, icon: <CalendarClock className="w-6 h-6 text-white" strokeWidth={2.4} /> },
  ];

  const adminQuickLinks = [
    { label: 'Lavados', to: '/lavados', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'Clientes', to: '/clientes', icon: <Users className="w-5 h-5" /> },
    { label: 'Admin Panel', to: '/admin-panel', icon: <ShieldCheck className="w-5 h-5" /> },
  ];
  return (
    <MobileScaleWrapper>
      <div className="min-h-screen relative">
        <main className="flex-1 p-5 sm:p-8">
        <section className="mb-8">
          <div
            className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-r from-[#050505] via-[#0f1115] to-[#1f2430] px-5 py-6 sm:px-8 sm:py-7 text-white shadow-[0_12px_50px_rgba(0,0,0,0.32)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_35%)]" aria-hidden />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Fecha actual: en móvil va absoluta; en desktop va en flujo normal (para no superponerse con el avatar) */}
              <span className="sm:hidden absolute top-2 right-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 shadow-sm whitespace-nowrap z-20">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <div className="flex flex-col gap-2 max-w-3xl">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-white/90">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                    <Zap className="h-4 w-4" strokeWidth={2.4} />
                    Miembro activo
                  </span>
                  {memberSince && (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">Miembro desde {memberSince.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-2xl sm:text-4xl font-extrabold leading-tight drop-shadow-sm">
                  <span>¡Hola, {nombre}!</span>
                  <span className="text-white/90">👋</span>
                </div>
                <p className="text-white/90 text-sm sm:text-lg">Gracias por seguir lavando con nosotros. Cada visita suma sellos para tu próximo lavado gratis.</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/95 font-semibold">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 shadow-sm">
                    <TrendingUp className="h-4 w-4" strokeWidth={2.4} />
                    <span>Progreso: {100 - porcentajeFaltante}%</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 shadow-sm">
                    <Tag className="h-4 w-4" strokeWidth={2.4} />
                    <span>Sellos acumulados: {stampsState.loading ? '—' : sellosAcumulados}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 shadow-sm">
                    <Gift className="h-4 w-4" strokeWidth={2.4} />
                    <span>Cada 6 sellos = 1 lavado gratis</span>
                  </span>
                </div>
                <div className="w-full max-w-xl mt-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-white/90 mb-1">
                    <span>Rumbo al próximo gratis</span>
                    <span>Faltan {faltanSellos} sello{faltanSellos === 1 ? '' : 's'} ({porcentajeFaltante}%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/90 transition-all duration-500"
                      style={{ width: `${100 - porcentajeFaltante}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 text-right text-sm text-white/90">
                <span className="hidden sm:inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 shadow-sm whitespace-nowrap">
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' })}
                </span>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-white/90 text-right">
                    <div className="uppercase font-semibold tracking-[0.08em]">Miembro desde</div>
                    <div className="text-base font-bold leading-tight">
                      {memberSince ? memberSince.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                  {avatarUrl ? (
                    <div className="h-14 w-14 rounded-full shadow-lg ring-2 ring-white/70 bg-transparent flex items-center justify-center overflow-hidden">
                      {isDefaultAvatar ? (
                        <UserRound size={28} color="#fff" strokeWidth={2.2} />
                      ) : (
                        <img src={avatarUrl} alt="Perfil" className="object-cover w-full h-full" />
                      )}
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-white/90 text-orange-600 font-black text-lg flex items-center justify-center shadow-lg">
                      {nombre?.charAt(0)?.toUpperCase() || '•'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filtro de tiempo debajo de la tarjeta de presentación */}
        <div className="mb-6">
          <DashboardTimeFilter
            value={timeFilter}
            options={timeOptions}
            onChange={setTimeFilter}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {metricsData.loading ? (
            <div className="col-span-4 text-center text-white/70 py-10">Cargando métricas...</div>
          ) : metricsData.error ? (
            <div className="col-span-4 text-center text-rose-300 py-10">{metricsData.error}</div>
          ) : metrics.map(m => (
            <div key={m.label} className="bg-black/80 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col items-start gap-2 shadow-lg">
              <span className="text-3xl sm:text-4xl text-white/95">{m.icon}</span>
              <div className="text-xl sm:text-2xl font-bold text-orange-400">{m.value}</div>
              <div className="text-white/80 text-sm sm:text-base leading-snug">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <section className="bg-black/70 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">Panel rápido</h2>
            <ul className="text-white/80 space-y-2 text-sm sm:text-base">
              <li>Lavado más reciente: <span className="font-bold text-orange-400">Toyota Corolla</span> (hace 2h)</li>
              <li>Cliente frecuente: <span className="font-bold text-orange-400">Juan Pérez</span></li>
              <li>Reservas para mañana: <span className="font-bold text-orange-400">2</span></li>
            </ul>
          </section>
        </div>

        <section className="mt-6 block md:hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Accesos rápidos</h3>
            {role !== 'cliente' && <span className="text-xs text-white/60">Solo admin/IT</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {role !== 'cliente' && adminQuickLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white shadow hover:border-orange-400/60 hover:bg-white/10 transition-colors"
              >
                <span className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
                  {link.icon}
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{link.label}</span>
                  <span className="text-xs text-white/60">Ir a {link.label}</span>
                </div>
              </Link>
            ))}
            {role === 'cliente' && (
              <button
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white shadow hover:border-orange-400/60 hover:bg-white/10 transition-colors w-full"
                onClick={() => window.location.href = '/logout'}
              >
                <span className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
                  <UserRound className="w-5 h-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Cerrar sesión</span>
                  <span className="text-xs text-white/60">Salir de la cuenta</span>
                </div>
              </button>
            )}
          </div>
        </section>
        </main>
      </div>
    </MobileScaleWrapper>
  );
}
