/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  quarterlyPrice?: number; // opcional si se quiere precio custom
  highlight?: boolean;
  features: string[];
  unavailable?: string[];
};

type DbPlanRow = {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  quarterly_price: number | null;
  highlight: boolean | null;
  features: string[] | null;
  unavailable: string[] | null;
};

type PlanContextState = {
  plans: Plan[];
  isLoading: boolean;
  error: string | null;
  refreshPlans: () => Promise<void>;
  addPlan: (data: Omit<Plan, 'id'> & { id?: string }) => Promise<Plan | null>;
  deletePlan: (id: string) => Promise<boolean>;
  updatePlan: (id: string, data: Partial<Plan>) => void;
};

const defaultPlans: Plan[] = [
  {
    id: 'silver',
    name: 'Silver',
    description: 'Ideal para clientes ocasionales que quieren mantener su auto limpio.',
    monthlyPrice: 9,
    quarterlyPrice: 25,
    features: [
      '1 lavado exterior al mes',
      'Descuento en servicios adicionales',
      'Acceso a promociones exclusivas',
      'Sin permanencia',
      'Soporte estándar'
    ],
    unavailable: ['Lavado interior', 'Prioridad en reservas']
  },
  {
    id: 'black',
    name: 'Black',
    description: 'Para quienes buscan un auto impecable todo el mes.',
    monthlyPrice: 19,
    quarterlyPrice: 54,
    highlight: true,
    features: [
      '4 lavados completos al mes',
      'Lavado interior y exterior',
      'Prioridad en reservas',
      'Acceso a promociones exclusivas',
      'Soporte premium'
    ]
  }
];

const PlanContext = createContext<PlanContextState | undefined>(undefined);

function toUiPlan(row: DbPlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    monthlyPrice: Number(row.monthly_price ?? 0),
    quarterlyPrice: row.quarterly_price == null ? undefined : Number(row.quarterly_price),
    highlight: row.highlight ?? undefined,
    features: row.features ?? [],
    unavailable: row.unavailable ?? [],
  };
}

function toDbPatch(data: Partial<Plan>): Partial<DbPlanRow> {
  const patch: Partial<DbPlanRow> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.description !== undefined) patch.description = data.description;
  if (data.monthlyPrice !== undefined) patch.monthly_price = Number(data.monthlyPrice);
  if (data.quarterlyPrice !== undefined) patch.quarterly_price = data.quarterlyPrice == null ? null : Number(data.quarterlyPrice);
  if (data.highlight !== undefined) patch.highlight = Boolean(data.highlight);
  if (data.features !== undefined) patch.features = data.features;
  if (data.unavailable !== undefined) patch.unavailable = data.unavailable;
  return patch;
}

function slugifyId(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'plan'}-${suffix}`;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('plans')
        .select('id,name,description,monthly_price,quarterly_price,highlight,features,unavailable')
        .order('monthly_price', { ascending: true });

      if (err) throw err;

      if (Array.isArray(data)) {
        const mapped = (data as DbPlanRow[]).map(toUiPlan);
        if (mapped.length > 0) {
          setPlans(mapped);
        } else {
          // Tabla vacía (o RLS devolviendo 0 filas sin error): usamos defaults para que Home no quede sin planes.
          console.info('[PlanContext] No plans rows found in Supabase; using default plans.');
          setPlans(defaultPlans);
        }
      } else {
        setPlans(defaultPlans);
      }
    } catch (e: unknown) {
      // Fallback a defaults si no existe tabla o RLS bloquea
      const msg = e instanceof Error ? e.message : 'No se pudieron cargar planes desde Supabase.';
      console.warn('[PlanContext] Supabase fetch failed, using default plans:', msg);
      setError(msg);
      setPlans(defaultPlans);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPlans();
  }, [refreshPlans]);

  const addPlan = useCallback(async (data: Omit<Plan, 'id'> & { id?: string }) => {
    const id = data.id?.trim() || slugifyId(data.name);
    const payload: DbPlanRow = {
      id,
      name: data.name,
      description: data.description,
      monthly_price: Number(data.monthlyPrice),
      quarterly_price: data.quarterlyPrice == null ? null : Number(data.quarterlyPrice),
      highlight: data.highlight ?? null,
      features: data.features ?? [],
      unavailable: data.unavailable ?? [],
    };

    const optimistic: Plan = toUiPlan(payload);
    setPlans((prev) => [optimistic, ...prev]);

    const { data: inserted, error: err } = await supabase
      .from('plans')
      .insert(payload)
      .select('id,name,description,monthly_price,quarterly_price,highlight,features,unavailable')
      .single();

    if (err) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setError(err.message);
      console.error('[PlanContext] addPlan failed:', err.message);
      return null;
    }

    const created = toUiPlan(inserted as DbPlanRow);
    setPlans((prev) => prev.map((p) => (p.id === id ? created : p)));
    return created;
  }, []);

  const deletePlan = useCallback(async (id: string) => {
    let snapshot: Plan[] = [];
    setPlans((prev) => {
      snapshot = prev;
      return prev.filter((p) => p.id !== id);
    });

    const { error: err } = await supabase.from('plans').delete().eq('id', id);
    if (err) {
      setPlans(snapshot);
      setError(err.message);
      console.error('[PlanContext] deletePlan failed:', err.message);
      return false;
    }
    return true;
  }, []);

  const updatePlan = useCallback((id: string, data: Partial<Plan>) => {
    // Optimista
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

    (async () => {
      const patch = toDbPatch(data);
      const { error: err } = await supabase.from('plans').update(patch).eq('id', id);
      if (err) {
        setError(err.message);
        console.error('[PlanContext] updatePlan failed:', err.message);
        // Mejor esfuerzo: recargar desde BD
        await refreshPlans();
      }
    })();
  }, [refreshPlans]);

  const value = useMemo(
    () => ({ plans, isLoading, error, refreshPlans, addPlan, deletePlan, updatePlan }),
    [plans, isLoading, error, refreshPlans, addPlan, deletePlan, updatePlan]
  );
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlans() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlans must be used within PlanProvider');
  return ctx;
}
