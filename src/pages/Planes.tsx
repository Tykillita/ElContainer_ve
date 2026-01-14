import React, { useEffect, useMemo, useRef, useState } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { Link } from 'react-router-dom';
import PricingPlans from '../components/PricingPlans';
import { useAuth } from '../context/useAuth';
import { usePlans, Plan } from '../context/PlanContext';
import { Pencil, Filter, Users, Wallet, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type UserRole = 'admin' | 'it' | 'cliente';
type CreateItemType = 'benefit' | 'contra';
type CreateItem = { type: CreateItemType; text: string };
type CreateFormState = {
  name: string;
  description: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  items: CreateItem[];
};

export default function Planes() {
  const { user } = useAuth();
  const role = (user?.user_metadata?.rol as UserRole | undefined) ?? 'cliente';
  const { plans, addPlan, deletePlan, updatePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const [draftById, setDraftById] = useState<Record<string, Partial<Plan>>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    name: '',
    description: '',
    monthlyPrice: 0,
    quarterlyPrice: 0,
    items: [{ type: 'benefit', text: '' }],
  });

  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscribersError, setSubscribersError] = useState<string | null>(null);
  const [subscribersByPlan, setSubscribersByPlan] = useState<Record<string, { id: string; name: string; since: string }[]>>({});

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

  const setDraft = (id: string, patch: Partial<Plan>) => {
    setDraftById((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }));
  };

  const clearDraft = (id: string) => {
    setDraftById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const getDraftField = <K extends keyof Plan>(plan: Plan, field: K): Plan[K] => {
    const draft = draftById[plan.id];
    if (!draft) return plan[field];
    if (Object.prototype.hasOwnProperty.call(draft, field)) {
      return draft[field] as Plan[K];
    }
    return plan[field];
  };

  const handleSave = (planId: string) => {
    const patch = draftById[planId];
    if (!patch) return;
    updatePlan(planId, patch);
    clearDraft(planId);
  };

  const handleDelete = async (planId: string, planName: string) => {
    const ok = window.confirm(`¿Eliminar el plan "${planName}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    await deletePlan(planId);
    if (selectedPlanId === planId) setSelectedPlanId('all');
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      description: '',
      monthlyPrice: 0,
      quarterlyPrice: 0,
      items: [{ type: 'benefit', text: '' }],
    });
  };

  const handleCreate = async () => {
    setCreateError(null);
    setCreateSuccess(null);

    const name = createForm.name.trim();
    const description = createForm.description.trim();
    const monthlyPrice = Number(createForm.monthlyPrice);
    const quarterlyPrice = Number(createForm.quarterlyPrice);
    const items = createForm.items
      .map((i) => ({ ...i, text: i.text.trim() }))
      .filter((i) => i.text.length > 0);

    if (!name) return setCreateError('El nombre del plan es obligatorio.');
    if (!description) return setCreateError('La descripción del plan es obligatoria.');
    if (!Number.isFinite(monthlyPrice) || monthlyPrice <= 0) return setCreateError('El precio mensual debe ser mayor a 0.');
    if (!Number.isFinite(quarterlyPrice) || quarterlyPrice <= 0) return setCreateError('El precio trimestral debe ser mayor a 0.');

    const features = items.filter((i) => i.type === 'benefit').map((i) => i.text);
    const unavailable = items.filter((i) => i.type === 'contra').map((i) => i.text);

    const created = await addPlan({
      name,
      description,
      monthlyPrice,
      quarterlyPrice,
      features,
      unavailable,
    });

    if (!created) {
      setCreateError('No se pudo crear el plan. Revisa tu conexión y políticas (RLS) de Supabase.');
      return;
    }

    setCreateSuccess('Plan creado. Puedes crear otro.');
    resetCreateForm();
    setSelectedPlanId('all');
  };

  const isAdminView = role === 'admin' || role === 'it';

  useEffect(() => {
    const loadSubscribers = async () => {
      if (!isAdminView) return;
      setSubscribersLoading(true);
      setSubscribersError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, plan, joined_at, created_at, role')
          .eq('role', 'cliente')
          .not('plan', 'is', null);

        if (error) throw error;

        const grouped: Record<string, { id: string; name: string; since: string }[]> = {};
        (data ?? []).forEach((row: any) => {
          const planId = row.plan as string | null;
          if (!planId) return;
          const since = (row.joined_at || row.created_at || new Date().toISOString()) as string;
          const name = (row.full_name || 'Sin nombre') as string;
          (grouped[planId] ||= []).push({ id: row.id as string, name, since });
        });

        // Ordenar por fecha (más recientes primero)
        Object.keys(grouped).forEach((planId) => {
          grouped[planId].sort((a, b) => b.since.localeCompare(a.since));
        });

        setSubscribersByPlan(grouped);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'No se pudieron cargar los clientes por plan.';
        console.warn('[Planes] loadSubscribers failed:', msg);
        setSubscribersError(msg);
        setSubscribersByPlan({});
      } finally {
        setSubscribersLoading(false);
      }
    };

    void loadSubscribers();
  }, [isAdminView]);

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

        {/* Vista admin/IT: planes de afiliación */}
        {isAdminView && (
          <section className="space-y-4">
            <PricingPlans />
          </section>
        )}

        {/* Vista admin/IT: gestión */}
        {isAdminView && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl font-semibold">Gestión de planes</h2>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold shadow shadow-orange-500/30 transition-colors"
                onClick={() => { setCreateError(null); setCreateSuccess(null); setIsCreateOpen(true); }}
              >
                <span>+ Nuevo plan</span>
              </button>
            </div>

            {isCreateOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/70"
                  onClick={() => setIsCreateOpen(false)}
                />
                <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-black/80 backdrop-blur p-5 shadow-xl shadow-black/40">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">Crear nuevo plan</h3>
                    <button
                      className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/80 hover:text-white"
                      onClick={() => setIsCreateOpen(false)}
                      aria-label="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                    <label className="flex flex-col gap-1">
                      <span className="text-white/60 text-xs">Nombre del plan</span>
                      <input
                        className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                        value={createForm.name}
                        onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-white/60 text-xs">Descripción</span>
                      <textarea
                        className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white min-h-[72px]"
                        value={createForm.description}
                        onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-white/60 text-xs">Precio mensual</span>
                        <input
                          type="number"
                          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                          value={createForm.monthlyPrice}
                          onChange={(e) => setCreateForm((p) => ({ ...p, monthlyPrice: Number(e.target.value) }))}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-white/60 text-xs">Precio trimestral</span>
                        <input
                          type="number"
                          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                          value={createForm.quarterlyPrice}
                          onChange={(e) => setCreateForm((p) => ({ ...p, quarterlyPrice: Number(e.target.value) }))}
                        />
                      </label>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Beneficios / Contras</p>
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80 hover:text-white"
                            onClick={() => setCreateForm((p) => ({ ...p, items: [...p.items, { type: 'benefit', text: '' }] }))}
                            type="button"
                          >
                            + Beneficio
                          </button>
                          <button
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80 hover:text-white"
                            onClick={() => setCreateForm((p) => ({ ...p, items: [...p.items, { type: 'contra', text: '' }] }))}
                            type="button"
                          >
                            + Contra
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {createForm.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              className="rounded-lg bg-black/40 border border-white/10 px-2 py-2 text-white text-xs"
                              value={item.type}
                              onChange={(e) => setCreateForm((p) => ({
                                ...p,
                                items: p.items.map((it, i) => (i === idx ? { ...it, type: e.target.value as 'benefit' | 'contra' } : it)),
                              }))}
                            >
                              <option value="benefit">Beneficio</option>
                              <option value="contra">Contra</option>
                            </select>
                            <input
                              className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                              placeholder={item.type === 'benefit' ? 'Ej: Prioridad en reservas' : 'Ej: No incluye lavado interior'}
                              value={item.text}
                              onChange={(e) => setCreateForm((p) => ({
                                ...p,
                                items: p.items.map((it, i) => (i === idx ? { ...it, text: e.target.value } : it)),
                              }))}
                            />
                            <button
                              className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-white/70 hover:text-white"
                              onClick={() => setCreateForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))}
                              type="button"
                              aria-label="Eliminar item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {createError && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        {createError}
                      </div>
                    )}
                    {createSuccess && (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                        {createSuccess}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:text-white"
                        onClick={() => { resetCreateForm(); setIsCreateOpen(false); }}
                        type="button"
                      >
                        Cancelar
                      </button>
                      <button
                        className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow shadow-orange-500/30"
                        onClick={handleCreate}
                        type="button"
                      >
                        Crear plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-white/70 flex-wrap gap-2">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.65)]" />
                  <span>
                    {selectedPlanId === 'all'
                      ? 'Mostrando todos los planes'
                      : `Filtrando por: ${filteredPlans[0]?.name ?? '—'}`}
                  </span>
                </div>
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
                      <h3 className="text-lg font-bold">{getDraftField(plan, 'name')}</h3>
                    </div>
                    <span className="rounded-full bg-orange-500/15 text-orange-300 px-3 py-1 text-xs font-semibold">
                      ${getDraftField(plan, 'monthlyPrice')}/mes · ${getDraftField(plan, 'quarterlyPrice') ?? getDraftField(plan, 'monthlyPrice') * 3}/trim
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <label className="flex flex-col gap-1">
                      <span className="text-white/60 text-xs">Nombre</span>
                      <input
                        className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                        value={getDraftField(plan, 'name')}
                        onChange={(e) => setDraft(plan.id, { name: e.target.value })}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-white/60 text-xs">Descripción</span>
                      <textarea
                        className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white min-h-[72px]"
                        value={getDraftField(plan, 'description')}
                        onChange={(e) => setDraft(plan.id, { description: e.target.value })}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-white/60 text-xs">Precio mensual</span>
                        <input
                          type="number"
                          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                          value={getDraftField(plan, 'monthlyPrice')}
                          onChange={(e) => setDraft(plan.id, { monthlyPrice: Number(e.target.value) })}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-white/60 text-xs">Precio trimestral</span>
                        <input
                          type="number"
                          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white"
                          value={getDraftField(plan, 'quarterlyPrice') ?? getDraftField(plan, 'monthlyPrice') * 3}
                          onChange={(e) => setDraft(plan.id, { quarterlyPrice: Number(e.target.value) })}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-black/25 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-white/80">Beneficios</p>
                          <button
                            className="text-xs text-orange-300 hover:text-orange-200"
                            type="button"
                            onClick={() => {
                              const current = (getDraftField(plan, 'features') ?? []) as string[];
                              setDraft(plan.id, { features: [...current, ''] });
                            }}
                          >
                            + Agregar
                          </button>
                        </div>
                        {((getDraftField(plan, 'features') ?? []) as string[]).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-green-400">✔</span>
                            <input
                              className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm"
                              value={item}
                              onChange={(e) => {
                                const current = ((getDraftField(plan, 'features') ?? []) as string[]).slice();
                                current[idx] = e.target.value;
                                setDraft(plan.id, { features: current });
                              }}
                            />
                            <button
                              className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-white/70 hover:text-white"
                              type="button"
                              onClick={() => {
                                const current = ((getDraftField(plan, 'features') ?? []) as string[]).filter((_, i) => i !== idx);
                                setDraft(plan.id, { features: current });
                              }}
                              aria-label="Quitar beneficio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/25 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-white/80">Contras</p>
                          <button
                            className="text-xs text-orange-300 hover:text-orange-200"
                            type="button"
                            onClick={() => {
                              const current = (getDraftField(plan, 'unavailable') ?? []) as string[];
                              setDraft(plan.id, { unavailable: [...current, ''] });
                            }}
                          >
                            + Agregar
                          </button>
                        </div>
                        {((getDraftField(plan, 'unavailable') ?? []) as string[]).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-white/50">✖</span>
                            <input
                              className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm"
                              value={item}
                              onChange={(e) => {
                                const current = ((getDraftField(plan, 'unavailable') ?? []) as string[]).slice();
                                current[idx] = e.target.value;
                                setDraft(plan.id, { unavailable: current });
                              }}
                            />
                            <button
                              className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-white/70 hover:text-white"
                              type="button"
                              onClick={() => {
                                const current = ((getDraftField(plan, 'unavailable') ?? []) as string[]).filter((_, i) => i !== idx);
                                setDraft(plan.id, { unavailable: current });
                              }}
                              aria-label="Quitar contra"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span className="inline-flex items-center gap-2">
                      <Users className="w-4 h-4" /> Suscriptores
                    </span>
                    <div className="flex items-center gap-2">
                      {draftById[plan.id] && (
                        <>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg bg-orange-500/15 px-3 py-2 text-orange-200 hover:bg-orange-500/25"
                            type="button"
                            onClick={() => handleSave(plan.id)}
                          >
                            Guardar
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:text-white"
                            type="button"
                            onClick={() => clearDraft(plan.id)}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      <button
                        className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-200"
                        onClick={() => setSelectedPlanId(plan.id)}
                        type="button"
                      >
                        <Pencil className="w-4 h-4" /> Ver/filtrar
                      </button>
                      <button
                        className="inline-flex items-center gap-1 text-red-300 hover:text-red-200"
                        onClick={() => void handleDelete(plan.id, plan.name)}
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm bg-black/30 rounded-xl border border-white/5 p-3">
                    {subscribersLoading && (
                      <div className="text-white/60 text-sm">Cargando suscriptores…</div>
                    )}
                    {!subscribersLoading && subscribersError && (
                      <div className="text-red-200 text-sm">No se pudieron cargar suscriptores: {subscribersError}</div>
                    )}
                    {!subscribersLoading && !subscribersError && (subscribersByPlan[plan.id]?.length ?? 0) === 0 && (
                      <div className="text-white/60 text-sm">Sin suscriptores en este plan.</div>
                    )}
                    {!subscribersLoading && !subscribersError && (subscribersByPlan[plan.id] ?? []).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{sub.name}</p>
                          <p className="text-white/60 text-xs">ID: {sub.id.slice(0, 8)}…</p>
                        </div>
                        <span className="text-xs text-white/60">Desde {new Date(sub.since).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Se eliminó PricingPlans de aquí, ahora está arriba */}
          </section>
        )}
        </div>
      </main>
    </MobileScaleWrapper>
  );
}
