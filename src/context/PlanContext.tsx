/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

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

type PlanContextState = {
  plans: Plan[];
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

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);

  const updatePlan = (id: string, data: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const value = useMemo(() => ({ plans, updatePlan }), [plans]);
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlans() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlans must be used within PlanProvider');
  return ctx;
}
