import React from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';

export default function Clientes() {
  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-white/70">Gestiona tu base de clientes y su historial de lavados.</p>
          <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
            <p className="text-white/80">Próximamente: listado de clientes, contacto rápido y métricas.</p>
          </div>
        </div>
      </main>
    </MobileScaleWrapper>
  );
}
