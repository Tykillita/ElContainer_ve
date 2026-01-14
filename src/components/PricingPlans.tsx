import React, { useState } from 'react';
import { usePlans } from '../context/PlanContext';

export default function PricingPlans() {
  const { plans, isLoading } = usePlans();
  const planList = plans ?? [];
  const [isQuarterly, setIsQuarterly] = useState(false);

  return (
    <>
      {/* Línea divisoria solo en móvil, antes de la sección */}
      <div className="block md:hidden w-full mb-8">
        <hr className="border-t border-white/15 w-full" />
      </div>
      <section className="w-full py-16 flex flex-col items-center" id="pricing">
        <h2 className="text-4xl font-bold mb-2 text-center text-white">Planes de Afiliación</h2>
        <p className="text-white/70 mb-6 text-center max-w-xl">
          Elige el plan que mejor se adapte a tus necesidades y disfruta de los beneficios exclusivos de nuestro autolavado.
        </p>
        <div className="flex items-center gap-2 mb-10">
          <span className={isQuarterly ? 'text-gray-400' : 'text-white font-semibold'}>Mensual</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isQuarterly}
              onChange={(e) => setIsQuarterly(e.target.checked)}
              aria-label="Cambiar periodo"
            />
            <span className="w-12 h-6 rounded-full bg-white/20 peer-checked:bg-orange-500/80 transition-colors duration-200" />
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-6" />
          </label>
          <span className={isQuarterly ? 'text-white font-semibold' : 'text-gray-400'}>Trimestral</span>
        </div>
        <div className="grid grid-cols-1 md:flex md:flex-row gap-8 w-full max-w-4xl justify-center place-items-stretch">
          {planList.length === 0 && (
            <div className="text-white/70 text-center w-full">
              {isLoading ? 'Cargando planes…' : 'Sin planes disponibles.'}
            </div>
          )}
          {planList.map((plan) => {
            const features = plan.features ?? [];
            const unavailable = plan.unavailable ?? [];
            return (
            <div
              key={plan.id}
              className={`flex-1 bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border ${plan.highlight ? 'border-orange-500' : 'border-white/10'} p-8 flex flex-col items-center transition-transform h-full min-h-[520px]${typeof window !== 'undefined' && window.innerWidth <= 640 ? '' : ' hover:scale-105'}`}
            >
              <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
              <p className="text-white/70 mb-4 text-center">{plan.description}</p>
              <div className="flex items-end mb-4">
                <span className="text-4xl font-bold text-white">${
                  isQuarterly ? plan.quarterlyPrice ?? plan.monthlyPrice * 3 : plan.monthlyPrice
                }</span>
                <span className="text-white/60 ml-1">/ {isQuarterly ? 'trimestre' : 'mes'}</span>
              </div>
                <button
                  type="button"
                  className={`w-full py-2 rounded-lg font-semibold mb-6 border border-orange-400 bg-black/40 ${plan.highlight ? 'bg-orange-500 text-white' : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-900/20'}`}
                >
                  Afiliarme al plan
                </button>
              <ul className="w-full mb-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 mb-1">
                    <span className="text-green-400">✔</span>
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
                {unavailable.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 mb-1 text-white/40 line-through">
                    <span>✖</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex-1" />
            </div>
          );})}
        </div>
      </section>
    </>
  );
}
