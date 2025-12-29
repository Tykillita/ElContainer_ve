import React, { useState } from 'react';

const plans = [
  {
    name: 'Silver',
    price: 9,
    period: 'mes',
    description: 'Ideal para clientes ocasionales que quieren mantener su auto limpio.',
    features: [
      '1 lavado exterior mensual',
      'Descuento en servicios adicionales',
      'Acceso a promociones exclusivas',
      'Sin permanencia',
      'Soporte estándar',
    ],
    unavailable: ['Lavado interior', 'Prioridad en reservas'],
    cta: 'Afiliarme al plan',
    highlight: false,
  },
  {
    name: 'Black',
    price: 19,
    period: 'mes',
    description: 'Para quienes buscan un auto impecable todo el mes.',
    features: [
      '4 lavados completos al mes',
      'Lavado interior y exterior',
      'Prioridad en reservas',
      'Acceso a promociones exclusivas',
      'Soporte premium',
    ],
    unavailable: [],
    cta: 'Afiliarme al plan',
    highlight: true,
  },
];

export default function PricingPlans() {
  const [isYearly, setIsYearly] = useState(false);

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
          <span className={isYearly ? 'text-gray-400' : 'text-white font-semibold'}>Mensual</span>
          <button
            className={`w-12 h-6 rounded-full bg-white/20 flex items-center px-1 transition-colors duration-200 ${isYearly ? 'bg-orange-500/80' : ''}`}
            onClick={() => setIsYearly(!isYearly)}
            aria-label="Cambiar periodo"
          >
            <span
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isYearly ? 'translate-x-6' : ''}`}
            />
          </button>
          <span className={isYearly ? 'text-white font-semibold' : 'text-gray-400'}>Anual</span>
        </div>
        <div className="grid grid-cols-1 md:flex md:flex-row gap-8 w-full max-w-4xl justify-center place-items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex-1 bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border ${plan.highlight ? 'border-orange-500' : 'border-white/10'} p-8 flex flex-col items-center transition-transform hover:scale-105 h-full min-h-[520px]`}
            >
              <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
              <p className="text-white/70 mb-4 text-center">{plan.description}</p>
              <div className="flex items-end mb-4">
                <span className="text-4xl font-bold text-white">${isYearly ? plan.price * 10 : plan.price}</span>
                <span className="text-white/60 ml-1">/ {isYearly ? 'año' : plan.period}</span>
              </div>
                <button
                  className={`w-full py-2 rounded-lg font-semibold mb-6 border border-orange-400 bg-black/40 ${plan.highlight ? 'bg-orange-500 text-white' : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-900/20'}`}
                >
                  {plan.cta}
                </button>
              <ul className="w-full mb-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 mb-1">
                    <span className="text-green-400">✔</span>
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
                {plan.unavailable.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 mb-1 text-white/40 line-through">
                    <span>✖</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex-1" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
