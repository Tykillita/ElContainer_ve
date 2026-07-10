/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

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
      const snap = await getDocs(query(collection(db, 'plans'), orderBy('monthly_price', 'asc')));
      const data = snap.docs.map((d) => ({ ...(d.data() as Omit<DbPlanRow, 'id'>), id: d.id }));

      const mapped = (data as DbPlanRow[]).map(toUiPlan);
      if (mapped.length > 0) {
        setPlans(mapped);
      } else {
        // Colección vacía: usamos defaults para que Home no quede sin planes.
        console.info('[PlanContext] No plans docs found in Firestore; using default plans.');
        setPlans(defaultPlans);
      }
    } catch (e: unknown) {
      // Fallback a defaults si no existe la colección o rules bloquean
      const msg = e instanceof Error ? e.message : 'No se pudieron cargar planes desde Firestore.';
      console.warn('[PlanContext] Firestore fetch failed, using default plans:', msg);
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

    try {
      const docData: Partial<DbPlanRow> = { ...payload };
      delete docData.id;
      await setDoc(doc(db, 'plans', id), docData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear plan';
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setError(msg);
      console.error('[PlanContext] addPlan failed:', msg);
      return null;
    }

    return optimistic;
  }, []);

  const deletePlan = useCallback(async (id: string) => {
    let snapshot: Plan[] = [];
    setPlans((prev) => {
      snapshot = prev;
      return prev.filter((p) => p.id !== id);
    });

    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar plan';
      setPlans(snapshot);
      setError(msg);
      console.error('[PlanContext] deletePlan failed:', msg);
      return false;
    }
    return true;
  }, []);

  const updatePlan = useCallback((id: string, data: Partial<Plan>) => {
    // Optimista
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

    (async () => {
      try {
        const patch = toDbPatch(data);
        await updateDoc(doc(db, 'plans', id), patch as Record<string, any>);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar plan';
        setError(msg);
        console.error('[PlanContext] updatePlan failed:', msg);
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
