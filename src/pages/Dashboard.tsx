import React from 'react';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import { TrendingUp, Tag, Gift, Zap, ShowerHead, Users, Banknote, CalendarClock, Sparkles, ShieldCheck } from 'lucide-react';
import { resolveAvatarUrl, DEFAULT_AVATAR_URL } from '../context/AuthContext';
import { UserRound } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const userMeta = (user?.user_metadata ?? null) as { nombre?: string; avatar_url?: string; picture?: string; avatar_icon?: string } | null;
  const nombre = userMeta?.nombre || user?.email || 'Cliente';
  const memberSince = user?.created_at ? new Date(user.created_at) : null;
  const avatarUrl = resolveAvatarUrl(userMeta ?? undefined);
  const isDefaultAvatar = avatarUrl === DEFAULT_AVATAR_URL;
  const role = (user?.user_metadata?.rol as 'admin' | 'it' | 'cliente' | undefined) ?? 'cliente';
  // Simulación de sellos; conectar con backend cuando esté disponible
  const sellosAcumulados = 4;
  const sellosParaPremio = 6;
  const sellosCiclo = sellosAcumulados % sellosParaPremio;
  const faltanSellos = sellosCiclo === 0 && sellosAcumulados > 0 ? 0 : sellosParaPremio - sellosCiclo;
  const porcentajeFaltante = Math.round((faltanSellos / sellosParaPremio) * 100);

  // Simulación de métricas del autolavado
  const metrics = [
    { label: 'Lavados realizados', value: 12, icon: <ShowerHead className="w-6 h-6 text-white" strokeWidth={2.4} /> },
    { label: 'Clientes atendidos', value: 8, icon: <Users className="w-6 h-6 text-white" strokeWidth={2.4} /> },
    { label: 'Ingresos hoy', value: '$120', icon: <Banknote className="w-6 h-6 text-white" strokeWidth={2.4} /> },
    { label: 'Reservas activas', value: 3, icon: <CalendarClock className="w-6 h-6 text-white" strokeWidth={2.4} /> },
  ];

  const adminQuickLinks = [
    { label: 'Lavados', to: '/lavados', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'Clientes', to: '/clientes', icon: <Users className="w-5 h-5" /> },
    { label: 'Admin Panel', to: '/admin-panel', icon: <ShieldCheck className="w-5 h-5" /> },
  ];
  return (
    <div className="min-h-screen relative">
      <main className="flex-1 p-5 sm:p-8">
        <section className="mb-8">
          <div
            className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-r from-[#050505] via-[#0f1115] to-[#1f2430] px-5 py-6 sm:px-8 sm:py-7 text-white shadow-[0_12px_50px_rgba(0,0,0,0.32)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_35%)]" aria-hidden />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Fecha en móvil en la esquina sup. derecha */}
              <span className="sm:hidden absolute top-2 right-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 shadow-sm">
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
                    <span>Sellos acumulados: {sellosAcumulados}</span>
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
                <span className="hidden sm:inline rounded-full bg-white/15 px-3 py-1 shadow-sm">
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {metrics.map(m => (
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
          <section className="bg-black/70 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">Tip del día</h2>
            <p className="text-white/80 text-sm sm:text-base">Ofrece un descuento especial a clientes que reserven en línea.</p>
          </section>
        </div>

        {role !== 'cliente' && (
          <section className="mt-6 block md:hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Accesos rápidos</h3>
              <span className="text-xs text-white/60">Solo admin/IT</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adminQuickLinks.map(link => (
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
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
