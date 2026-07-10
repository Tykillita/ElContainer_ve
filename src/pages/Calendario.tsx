import React, { useState, useEffect } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { Calendar } from '../components/ui/calendar';
import { useReservas, Reserva } from '../hooks/useReservas';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Calendario() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [markedDates, setMarkedDates] = useState<Date[]>([]);
  const { getReservasByFecha, getReservasByCliente, getReservasAdmin, loading, error } = useReservas();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = (user?.user_metadata?.rol as 'admin' | 'it' | 'cliente' | undefined) ?? 'cliente';
  const isCliente = role === 'cliente';

  useEffect(() => {
    const fetchReservas = async () => {
      const fechaStr = selectedDate.toISOString().slice(0, 10);
      try {
        const res = await getReservasByFecha(fechaStr, isCliente);
        setReservas(res);
      } catch {
        setReservas([]);
      }
    };
    fetchReservas();
  }, [selectedDate, getReservasByFecha, isCliente]);

  useEffect(() => {
    const fetchMarkedDates = async () => {
      const year = visibleMonth.getFullYear();
      const month = visibleMonth.getMonth();
      const from = new Date(year, month, 1).toISOString().slice(0, 10);
      const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
      try {
        const data = isCliente
          ? (user?.id ? await getReservasByCliente(user.id) : [])
          : await getReservasAdmin({ fechaDesde: from, fechaHasta: to });
        const filtered = isCliente
          ? data.filter((r) => r.fecha >= from && r.fecha <= to)
          : data;
        const unique = new Set(filtered.map((r) => r.fecha));
        setMarkedDates(Array.from(unique).map((d) => new Date(`${d}T00:00:00`)));
      } catch {
        setMarkedDates([]);
      }
    };
    fetchMarkedDates();
  }, [visibleMonth, isCliente, user?.id, getReservasByCliente, getReservasAdmin]);

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-white/70">
            {isCliente
              ? 'Revisa tus reservas por fecha.'
              : 'Revisa y organiza las reservas y citas del autolavado.'}
          </p>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Calendar
                selected={selectedDate}
                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                onMonthChange={setVisibleMonth}
                modifiers={{ hasReservations: markedDates }}
                modifiersClassNames={{
                  hasReservations:
                    "after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-orange-400 after:shadow-[0_0_10px_rgba(249,115,22,0.8)]",
                }}
                className="rounded-2xl border border-white/10 bg-black/60 p-4"
              />
              <button
                className="mt-4 w-full py-3 rounded-xl bg-orange-500 text-white text-lg font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.03] hover:shadow-xl transition-all duration-150 border-none outline-none focus:ring-2 focus:ring-orange-400"
                onClick={() => navigate('/lavados')}
              >
                Ir a Lavados
              </button>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold mb-2">Reservas del día</h2>
              {loading && <p className="text-white/70">Cargando reservas...</p>}
              {error && <p className="text-red-400">Error: {error}</p>}
              {reservas.length === 0 && !loading && (
                <p className="text-white/80">No hay reservas para este día.</p>
              )}
              <ul className="space-y-3">
                {reservas.map(reserva => (
                  <li key={reserva.id} className="rounded-xl border border-white/10 bg-black/50 p-4 flex flex-col gap-1">
                    <span className="font-semibold text-lg">{reserva.servicio}</span>
                    <span className="text-white/70">Cliente: {reserva.nombre_cliente}</span>
                    <span className="text-white/70">Hora: {reserva.hora_inicio}</span>
                    <span className="text-white/70">Estado: <span className={
                      reserva.estado_reserva === 'aprobada' ? 'text-green-400' :
                      reserva.estado_reserva === 'cancelada' ? 'text-red-400' :
                      reserva.estado_reserva === 'por_aprobar' ? 'text-yellow-400' :
                      'text-white/80'
                    }>{reserva.estado_reserva}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </MobileScaleWrapper>
  );
}
