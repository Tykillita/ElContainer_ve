
import React from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import PricingPlans from '../components/PricingPlans';
import { useAuth } from '../context/useAuth';

const PlanesCliente: React.FC = () => {
  const { user } = useAuth();
  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold mb-4">Mis Planes</h1>
          <section className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                Administración de plan
              </div>
              <p className="text-white/80 text-sm">
                Cambia entre mensual o trimestral y afíliate al plan que más te convenga. Podrás gestionarlo desde tu cuenta.
              </p>
              <a
                href="/cuenta"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow shadow-orange-500/30"
              >
                Administrar mi plan
              </a>
            </div>
            <PricingPlans />
          </section>
        </div>
      </main>
    </MobileScaleWrapper>
  );
};

export default PlanesCliente;
