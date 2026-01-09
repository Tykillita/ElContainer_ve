import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import ReservasTable from '../components/ReservasTable';
import ReservasFilter from '../components/ReservasFilter';
import { useReservas, Reserva } from '../hooks/useReservas';


export default function Lavados() {
  const navigate = useNavigate();
  const { getReservasByFecha, loading, error } = useReservas();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fecha] = useState<string>('');
  const [estado, setEstado] = useState<string>('todos');
  const [sort] = useState<string>('fecha');

  useEffect(() => {
    const fetch = async () => {
      let fechaStr = fecha;
      if (!fechaStr) {
        const today = new Date();
        fechaStr = today.toISOString().slice(0, 10);
      }
      let res = await getReservasByFecha(fechaStr, false);
      if (estado !== 'todos') {
        res = res.filter(r => r.estado_reserva === estado);
      }
      // Ordenamiento
      if (sort === 'alfabetico') {
        res = [...res].sort((a, b) => a.nombre_cliente.localeCompare(b.nombre_cliente));
      } else if (sort === 'alfabetico-desc') {
        res = [...res].sort((a, b) => b.nombre_cliente.localeCompare(a.nombre_cliente));
      } else if (sort === 'fecha') {
        res = [...res].sort((a, b) => b.fecha.localeCompare(a.fecha));
      } else if (sort === 'fecha-ant') {
        res = [...res].sort((a, b) => a.fecha.localeCompare(b.fecha));
      }
      setReservas(res);
    };
    fetch();
  }, [fecha, estado, sort, getReservasByFecha]);

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold">Lavados</h1>
          <p className="text-white/70">Aquí podrás ver y gestionar los lavados registrados.</p>
          {/* Ordenamiento ahora es por click en encabezado de tabla. */}
          <ReservasFilter
            value={estado}
            options={['todos','completado','pendiente','cancelado','en proceso','carro listo','en espera']}
            onChange={setEstado}
          />
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 min-h-[400px]">
            <ReservasTable reservas={reservas} loading={loading} error={error} />
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
