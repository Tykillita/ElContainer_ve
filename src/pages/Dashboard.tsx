import React, { useState, useEffect } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import { ShowerHead, Users, Banknote, CalendarClock, Sparkles, ShieldCheck } from 'lucide-react';
import { UserRound } from 'lucide-react';

import { db } from '../lib/firebaseClient';
import { collection, getCountFromServer, getDocs, query, where } from 'firebase/firestore';

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
        const startStr = start.toISOString().slice(0, 10);
        const endStr = end.toISOString().slice(0, 10);
        const inactivos = ['cancelada', 'desaprobada', 'cancelado', 'completado'];

        // Reservas del rango una sola vez; métricas se computan en memoria
        // ponytail: volumen pequeño (negocio local); si crece, mover a agregaciones por métrica
        const snap = await getDocs(query(
          collection(db, 'reservas'),
          where('fecha', '>=', startStr),
          where('fecha', '<', endStr)
        ));
        const enRango = snap.docs.map((d) => d.data() as { estado_reserva?: string; estado_pago?: string; monto_pago?: number; fecha?: string; hora_inicio?: string });

        const lavados = enRango.filter((r) => r.estado_reserva === 'completado').length;
        const ingresos = enRango.filter((r) => r.estado_pago === 'pagado').reduce((sum, r) => sum + (r.monto_pago || 0), 0);

        // Clientes registrados
        const clientesSnap = await getCountFromServer(query(
          collection(db, 'profiles'),
          where('created_at', '>=', start.toISOString()),
          where('created_at', '<', end.toISOString())
        ));
        const clientes = clientesSnap.data().count;

        // Reservas activas para la hora actual (solo para filtro 'hour', si no, todas activas en rango)
        let reservasActivas = 0;
        if (timeFilter === 'hour') {
          const now = new Date();
          const hourStr = now.toTimeString().slice(0, 2); // 'HH'
          const nextHour = `${('0' + (parseInt(hourStr) + 1)).slice(-2)}:00`;
          const hoy = now.toISOString().slice(0, 10);
          reservasActivas = enRango.filter((r) =>
            r.fecha === hoy &&
            (r.hora_inicio || '') >= `${hourStr}:00` &&
            (r.hora_inicio || '') < nextHour &&
            !inactivos.includes(r.estado_reserva || '')
          ).length;
        } else {
          reservasActivas = enRango.filter((r) => !inactivos.includes(r.estado_reserva || '')).length;
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

  const role = (user?.user_metadata?.rol as 'admin' | 'it' | 'cliente' | undefined) ?? 'cliente';

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
