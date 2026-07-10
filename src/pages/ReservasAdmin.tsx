import React, { useEffect, useMemo, useState } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import ReservasFilter from '../components/ReservasFilter';
import ReservasTable from '../components/ReservasTable';
import { type Reserva, useReservas } from '../hooks/useReservas';

const RESERVA_STATES = ['todos', 'por_aprobar', 'aprobada', 'desaprobada', 'cancelada'];

export default function ReservasAdmin() {
  const { getReservasAdmin, editarReserva, loading, error } = useReservas();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [estado, setEstado] = useState<string>('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchReservas = async () => {
    try {
      const data = await getReservasAdmin({
        estadoReserva: estado,
        fechaDesde: dateFrom || undefined,
        fechaHasta: dateTo || undefined,
      });
      setReservas(data);
    } catch {
      setReservas([]);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [estado, dateFrom, dateTo]);

  const onSortChange = (col: string) => {
    setSortBy((prev) => {
      if (prev === col) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder('asc');
      return col;
    });
  };

  const rows = useMemo(() => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    return [...reservas].sort((a, b) => {
      if (sortBy === 'fecha') return a.fecha.localeCompare(b.fecha) * dir;
      if (sortBy === 'hora_inicio') return a.hora_inicio.localeCompare(b.hora_inicio) * dir;
      if (sortBy === 'nombre_cliente') return a.nombre_cliente.localeCompare(b.nombre_cliente) * dir;
      if (sortBy === 'servicio') return a.servicio.localeCompare(b.servicio) * dir;
      if (sortBy === 'estado_reserva') return a.estado_reserva.localeCompare(b.estado_reserva) * dir;
      return 0;
    });
  }, [reservas, sortBy, sortOrder]);

  const updateReserva = async (id: string, updates: Partial<Reserva>) => {
    await editarReserva(id, updates);
    await fetchReservas();
  };

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl space-y-4">
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="text-white/70">Gestiona solicitudes: aprobar, desaprobar, cancelar o reprogramar.</p>

          <ReservasFilter value={estado} options={RESERVA_STATES} onChange={setEstado} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-white/70">
              Desde
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
              />
            </label>
            <label className="text-sm text-white/70">
              Hasta
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 min-h-[420px]">
            <ReservasTable
              reservas={rows}
              loading={loading}
              error={error}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              renderActions={(reserva) => {
                if (reserva.estado_reserva === 'por_aprobar') {
                  return (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200"
                        onClick={() => updateReserva(reserva.id, { estado_reserva: 'aprobada', estado_lavado: reserva.estado_lavado || 'no_iniciado' })}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200"
                        onClick={() => updateReserva(reserva.id, { estado_reserva: 'desaprobada' })}
                      >
                        Desaprobar
                      </button>
                    </div>
                  );
                }

                if (reserva.estado_reserva === 'aprobada') {
                  return (
                    <button
                      type="button"
                      className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200"
                      onClick={() => updateReserva(reserva.id, { estado_reserva: 'cancelada' })}
                    >
                      Cancelar
                    </button>
                  );
                }

                if (reserva.estado_reserva === 'desaprobada') {
                  return (
                    <button
                      type="button"
                      className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200"
                      onClick={() => updateReserva(reserva.id, { estado_reserva: 'aprobada', estado_lavado: reserva.estado_lavado || 'no_iniciado' })}
                    >
                      Aprobar
                    </button>
                  );
                }

                return <span className="text-xs text-white/50">Sin acciones</span>;
              }}
            />
          </div>
        </div>
      </main>
    </MobileScaleWrapper>
  );
}
