
import React, { useState, useEffect } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabaseClient';
import { TrendingUp, Tag, Gift } from 'lucide-react';
import { resolveAvatarUrl, DEFAULT_AVATAR_URL } from '../context/AuthContext';

const DashboardCliente: React.FC = () => {
  const { user } = useAuth();
  const [stamps, setStamps] = useState<number>(0);
  const [loadingStamps, setLoadingStamps] = useState(true);
  useEffect(() => {
    async function fetchStamps() {
      if (!user?.id) return;
      setLoadingStamps(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('stamps')
        .eq('id', user.id)
        .maybeSingle();
      setStamps(data?.stamps ?? 0);
      setLoadingStamps(false);
    }
    fetchStamps();
  }, [user?.id]);

  const nombre = (user?.user_metadata?.nombre || user?.email || 'Cliente');
  const memberSince = user?.created_at ? new Date(user.created_at) : null;
  const avatarUrl = resolveAvatarUrl(user?.user_metadata ?? undefined);
  const isDefaultAvatar = avatarUrl === DEFAULT_AVATAR_URL;
  const sellosParaPremio = 6;
  const sellosCiclo = stamps % sellosParaPremio;
  const faltanSellos = sellosCiclo === 0 && stamps > 0 ? 0 : sellosParaPremio - sellosCiclo;
  const porcentajeFaltante = Math.round((faltanSellos / sellosParaPremio) * 100);

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
                <span className="sm:hidden absolute top-2 right-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 shadow-sm whitespace-nowrap z-20">
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <div className="flex flex-col gap-2 max-w-3xl">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-white/90">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                      {/* Icono de miembro activo */}
                      <TrendingUp className="h-4 w-4" strokeWidth={2.4} />
                      Miembro activo
                    </span>
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
                      <span>Sellos acumulados: {loadingStamps ? '—' : stamps}</span>
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
                          <span className="text-3xl">👤</span>
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
        </main>
      </div>
    </MobileScaleWrapper>
  );
};

export default DashboardCliente;
