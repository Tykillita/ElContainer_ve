import React, { useEffect, useMemo, useRef, useState } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { Link } from 'react-router-dom';
import PricingPlans from '../components/PricingPlans';
import { useAuth } from '../context/useAuth';
import { usePlans, Plan } from '../context/PlanContext';
import { Pencil, Filter, Users, Wallet } from 'lucide-react';

type UserRole = 'admin' | 'it' | 'cliente';

export default function Planes() {
  const { user } = useAuth();
  const role = (user?.user_metadata?.rol as UserRole | undefined) ?? 'cliente';
  const { plans, updatePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const subscribersByPlan: Record<string, { name: string; email: string; since: string }[]> = {
    silver: [
      { name: 'Ana Torres', email: 'ana@example.com', since: '2024-11-02' },
      { name: 'Luis Díaz', email: 'luis@example.com', since: '2024-12-10' },
    ],
    black: [
      { name: 'Carlos Méndez', email: 'carlos@example.com', since: '2024-10-15' },
      { name: 'María Ruiz', email: 'maria@example.com', since: '2024-12-28' },
    ],
  };

  const planList = useMemo(() => plans ?? [], [plans]);

  const filteredPlans = useMemo(() => {
    if (selectedPlanId === 'all') return planList;
    return planList.filter((p) => p.id === selectedPlanId);
  }, [planList, selectedPlanId]);

  const selectedPlanName = selectedPlanId === 'all'
    ? 'Todos'
    : planList.find((p) => p.id === selectedPlanId)?.name ?? '—';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFilterOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleEdit = (plan: Plan, field: keyof Plan, value: string | number) => {
    updatePlan(plan.id, { [field]: value } as Partial<Plan>);
  };

  const isAdminView = role === 'admin' || role === 'it';

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Planes</h1>
            <Link to="/dashboard" className="text-sm text-white/70 underline">Volver</Link>
          </div>
          <p className="text-white/70">
            {isAdminView
              ? 'Administra los planes, sus precios y beneficios. Cambios aplican a toda la experiencia (Home y Planes).'
              : 'Elige el plan que más te convenga, cámbialo cuando quieras y administra tu suscripción.'}
          </p>
        </header>

        {/* Vista cliente: planes + CTA */}
        {!isAdminView && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Wallet className="w-4 h-4" />
                Administración de plan
              </div>
              <p className="text-white/80 text-sm">
                Cambia entre mensual o trimestral y afíliate al plan que más te convenga. Podrás gestionarlo desde tu cuenta.
              </p>
              <Link
                to="/cuenta"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow shadow-orange-500/30"
              >
                Administrar mi plan
              </Link>
            </div>
            <PricingPlans />
          </section>
        )}

        {/* Vista admin/IT: gestión */}
        {isAdminView && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl font-semibold">Gestión de planes</h2>
              <div className="flex items-center gap-2" ref={filterRef}>
                <label className="text-xs text-white/60">Filtrar plan</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-white/10 px-4 py-2 text-sm text-white shadow-sm transition-all hover:border-orange-400/60 hover:shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                  >
                    <span className="truncate max-w-[120px] text-left">{selectedPlanName}</span>
                    <div className="flex items-center gap-1 text-white/70">
                      <Filter className="h-4 w-4" />
                      <span className={`h-1.5 w-1.5 rounded-full transition-opacity ${isFilterOpen ? 'bg-orange-400 opacity-100 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-white/50 opacity-60'}`} />
                    </div>
                  </button>

                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-black/90 via-black/85 to-black/90 backdrop-blur shadow-xl shadow-black/40 z-20">
                      <ul className="divide-y divide-white/5">
                        <li>
                          <button
                            className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors ${selectedPlanId === 'all' ? 'bg-white/5 text-white' : 'text-white/80 hover:bg-white/5'}`}
                            onClick={() => { setSelectedPlanId('all'); setIsFilterOpen(false); }}
                          >
                            <span>Todos</span>
                            <span className="text-[11px] text-white/50">{planList.length}</span>
                          </button>
                        </li>
                        {planList.map((p) => (
                          <li key={p.id}>
                            <button
                              className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors ${selectedPlanId === p.id ? 'bg-white/5 text-white' : 'text-white/80 hover:bg-white/5'}`}
                              onClick={() => { setSelectedPlanId(p.id); setIsFilterOpen(false); }}
                            >
                              <span className="truncate pr-2">{p.name}</span>
                              <span className="text-[11px] text-white/50">${p.monthlyPrice}/mes</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/70 flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.65)]" />
                <span>
                  {selectedPlanId === 'all'
                    ? 'Mostrando todos los planes'
                    : `Filtrando por: ${filteredPlans[0]?.name ?? '—'}`}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredPlans.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">Sin planes para mostrar.</div>
              )}
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/60">Plan</p>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                    </div>
                    <span className="rounded-full bg-orange-500/15 text-orange-300 px-3 py-1 text-xs font-semibold">
                      ${plan.monthlyPrice}/mes · ${plan.quarterlyPrice ?? plan.monthlyPrice * 3}/trim
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <label className="flex flex-col gap-1">
                      <span className="text-white/60 text-xs">Nombre</span>
                      <input
                        className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                        value={plan.name}
                        onChange={(e) => handleEdit(plan, 'name', e.target.value)}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-white/60 text-xs">Descripción</span>
                      <textarea
                        className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white min-h-[72px]"
                        value={plan.description}
                        onChange={(e) => handleEdit(plan, 'description', e.target.value)}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-white/60 text-xs">Precio mensual</span>
                        <input
                          type="number"
                          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                          value={plan.monthlyPrice}
                          onChange={(e) => handleEdit(plan, 'monthlyPrice', Number(e.target.value))}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-white/60 text-xs">Precio trimestral</span>
                        <input
                          type="number"
                          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                          value={plan.quarterlyPrice ?? plan.monthlyPrice * 3}
                          onChange={(e) => handleEdit(plan, 'quarterlyPrice', Number(e.target.value))}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span className="inline-flex items-center gap-2">
                      <Users className="w-4 h-4" /> Suscriptores
                    </span>
                    <button
                      className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-200"
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      <Pencil className="w-4 h-4" /> Ver/filtrar
                    </button>
                  </div>
                  <div className="space-y-2 text-sm bg-black/30 rounded-xl border border-white/5 p-3">
                    {(subscribersByPlan[plan.id] ?? []).map((sub) => (
                      <div key={sub.email} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{sub.name}</p>
                          <p className="text-white/60 text-xs">{sub.email}</p>
                        </div>
                        <span className="text-xs text-white/60">Desde {new Date(sub.since).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <PricingPlans />
          </section>
        )}
        </div>
      </main>
    </MobileScaleWrapper>
  );
}
