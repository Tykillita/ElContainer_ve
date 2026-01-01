import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/useAuth';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  // Simulación de métricas del autolavado
  const metrics = [
    { label: 'Lavados realizados', value: 12, icon: '🧼' },
    { label: 'Clientes atendidos', value: 8, icon: '👥' },
    { label: 'Ingresos hoy', value: '$120', icon: '💵' },
    { label: 'Reservas activas', value: 3, icon: '📅' },
  ];
  return (
    <div className="min-h-screen relative" style={{ paddingLeft: sidebarOpen ? 220 : 100, transition: 'padding-left 0.3s' }}>
      <Sidebar expanded={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">¡Bienvenido, {user?.user_metadata?.nombre || user?.email || 'Usuario'}!</h1>
          <p className="text-white/70 mt-1">Panel de gestión de autolavado</p>
          <div className="text-white/60 text-sm mt-2">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map(m => (
            <div key={m.label} className="bg-black/80 border border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg">
              <span className="text-4xl mb-2">{m.icon}</span>
              <div className="text-2xl font-bold text-orange-400">{m.value}</div>
              <div className="text-white/80 mt-1 text-center">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-black/70 border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Panel rápido</h2>
            <ul className="text-white/80 space-y-2">
              <li>Lavado más reciente: <span className="font-bold text-orange-400">Toyota Corolla</span> (hace 2h)</li>
              <li>Cliente frecuente: <span className="font-bold text-orange-400">Juan Pérez</span></li>
              <li>Reservas para mañana: <span className="font-bold text-orange-400">2</span></li>
            </ul>
          </section>
          <section className="bg-black/70 border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Tip del día</h2>
            <p className="text-white/80">Ofrece un descuento especial a clientes que reserven en línea.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
