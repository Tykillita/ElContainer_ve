import React, { useState, useEffect } from 'react';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import { Calendar } from '../components/ui/calendar';
import { useReservas, Reserva } from '../hooks/useReservas';
import { useNavigate } from 'react-router-dom';

export default function Calendario() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const { getReservasByFecha, loading, error } = useReservas();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservas = async () => {
      const fechaStr = selectedDate.toISOString().slice(0, 10);
      const res = await getReservasByFecha(fechaStr);
      setReservas(res);
    };
    fetchReservas();
  }, [selectedDate, getReservasByFecha]);

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-white/70">Revisa y organiza las reservas y citas del autolavado.</p>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Calendar
                selected={selectedDate}
                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
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
                      reserva.estado_reserva === 'completado' ? 'text-green-400' :
                      reserva.estado_reserva === 'cancelado' ? 'text-red-400' :
                      reserva.estado_reserva === 'pendiente' ? 'text-yellow-400' :
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
