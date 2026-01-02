import React from 'react';

export default function Calendario() {
  return (
    <main className="min-h-screen px-4 py-10 text-white">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Calendario</h1>
        <p className="text-white/70">Revisa y organiza las reservas y citas del autolavado.</p>
        <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
          <p className="text-white/80">Próximamente: vista de calendario, agenda diaria y confirmaciones.</p>
        </div>
      </div>
    </main>
  );
}
