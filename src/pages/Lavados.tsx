import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import ReservasTable from '../components/ReservasTable';
import ReservasFilter from '../components/ReservasFilter';
import { useReservas, Reserva } from '../hooks/useReservas';

const RANGE_OPTIONS: Array<{ value: 'hoy' | 'dia' | 'semana' | 'mes'; label: string }> = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'dia', label: 'Dia especifico' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];


export default function Lavados() {
  const navigate = useNavigate();
  const { getReservasOperativas, editarReserva, loading, error } = useReservas();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [estado, setEstado] = useState<string>('todos');
  const [rangeType, setRangeType] = useState<'hoy' | 'dia' | 'semana' | 'mes'>('hoy');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement | null>(null);

  const getRange = useMemo(() => {
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    if (rangeType === 'hoy') {
      const d = new Date();
      const ds = d.toISOString().slice(0, 10);
      return { from: ds, to: ds };
    }
    if (rangeType === 'dia') {
      const ds = base.toISOString().slice(0, 10);
      return { from: ds, to: ds };
    }
    if (rangeType === 'semana') {
      const start = new Date(base);
      const day = start.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
    }
    const monthStart = new Date(base.getFullYear(), base.getMonth(), 1);
    const monthEnd = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { from: monthStart.toISOString().slice(0, 10), to: monthEnd.toISOString().slice(0, 10) };
  }, [rangeType, selectedDate]);

  const fetchReservas = async () => {
    try {
      const res = await getReservasOperativas(getRange.from, getRange.to);
      setReservas(res);
    } catch {
      setReservas([]);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [getRange.from, getRange.to]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) {
        setRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRows = useMemo(() => {
    if (estado === 'todos') return reservas;
    return reservas.filter((r) => (r.estado_lavado || 'no_iniciado') === estado);
  }, [reservas, estado]);

  const setEstadoLavado = async (reserva: Reserva, estado_lavado: string) => {
    await editarReserva(reserva.id, { estado_lavado });
    await fetchReservas();
  };

  const cancelar = async (reserva: Reserva) => {
    await editarReserva(reserva.id, { estado_reserva: 'cancelada' });
    await fetchReservas();
  };

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-6xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold">Lavados</h1>
          <p className="text-white/70">Operativa diaria de lavados aprobados. Vista por hoy, dia, semana o mes.</p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="text-sm text-white/70" ref={rangeRef}>
              <span>Rango</span>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => setRangeOpen((v) => !v)}
                  className="inline-flex w-full items-center justify-between rounded-full border border-orange-400/70 bg-gradient-to-r from-white/10 via-white/5 to-white/10 px-4 py-2 text-sm text-white shadow-[0_0_18px_rgba(249,115,22,0.22)] transition-all hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                >
                  <span>{RANGE_OPTIONS.find((opt) => opt.value === rangeType)?.label || 'Rango'}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.7)]" />
                </button>
                {rangeOpen && (
                  <div className="absolute left-0 z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-2xl">
                    <ul className="divide-y divide-white/5">
                      {RANGE_OPTIONS.map((opt) => (
                        <li key={opt.value}>
                          <button
                            type="button"
                            className={`w-full px-4 py-3 text-left text-sm transition ${rangeType === opt.value ? 'bg-white/8 text-white' : 'text-white/85 hover:bg-white/5'}`}
                            onClick={() => {
                              setRangeType(opt.value);
                              setRangeOpen(false);
                            }}
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {rangeType !== 'hoy' && (
              <label className="text-sm text-white/70 md:col-span-2">
                Fecha base
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </label>
            )}
          </div>

          <ReservasFilter
            value={estado}
            options={['todos', 'no_iniciado', 'en_proceso', 'carro_listo', 'completado']}
            onChange={setEstado}
          />

          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 min-h-[420px]">
            <ReservasTable
              reservas={filteredRows}
              loading={loading}
              error={error}
              statusField="estado_lavado"
              statusHeader="Estado lavado"
              renderActions={(reserva) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200"
                    onClick={() => setEstadoLavado(reserva, 'en_proceso')}
                    type="button"
                  >
                    Iniciar
                  </button>
                  <button
                    className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200"
                    onClick={() => setEstadoLavado(reserva, 'carro_listo')}
                    type="button"
                  >
                    Carro listo
                  </button>
                  <button
                    className="rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-200"
                    onClick={() => setEstadoLavado(reserva, 'completado')}
                    type="button"
                  >
                    Completar
                  </button>
                  <button
                    className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200"
                    onClick={() => cancelar(reserva)}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            />
          </div>

          <button
            className="mt-6 w-full py-3 rounded-xl bg-orange-500 text-white text-lg font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.03] hover:shadow-xl transition-all duration-150 border-none outline-none focus:ring-2 focus:ring-orange-400"
            onClick={() => navigate('/calendario')}
          >
            Ir al Calendario
          </button>
        </div>
      </main>
    </MobileScaleWrapper>
  );
}
