import React from 'react';
import type { Reserva } from '../hooks/useReservas';

interface ReservasTableProps {
  reservas: Reserva[];
  loading?: boolean;
  error?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (col: string) => void;
}

const statusColors: Record<string, string> = {
  completado: 'text-green-400',
  cancelado: 'text-red-400',
  pendiente: 'text-yellow-400',
  'en proceso': 'text-blue-400',
  'carro listo': 'text-green-300',
  'en espera': 'text-orange-400',
};

export const ReservasTable: React.FC<ReservasTableProps> = ({ reservas, loading, error, sortBy, sortOrder, onSortChange }) => {
  // Responsive: la tabla se muestra igual en desktop y móvil, el contenedor externo controla el diseño de tarjeta
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-white/70 text-sm select-none">
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => onSortChange && onSortChange('servicio')}>
              Servicio {sortBy === 'servicio' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => onSortChange && onSortChange('nombre_cliente')}>
              Cliente {sortBy === 'nombre_cliente' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => onSortChange && onSortChange('fecha')}>
              Fecha {sortBy === 'fecha' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => onSortChange && onSortChange('hora_inicio')}>
              Hora {sortBy === 'hora_inicio' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => onSortChange && onSortChange('monto_pago')}>
              Monto {sortBy === 'monto_pago' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => onSortChange && onSortChange('estado_reserva')}>
              Estado {sortBy === 'estado_reserva' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="px-6 py-6 text-center text-white/70">Cargando...</td></tr>
          ) : error ? (
            <tr><td colSpan={6} className="px-6 py-6 text-center text-red-400">{error}</td></tr>
          ) : reservas.length === 0 ? (
            <tr><td colSpan={6} className="px-6 py-6 text-center text-white/80">No hay reservas.</td></tr>
          ) : (
            reservas.map(reserva => (
              <tr key={reserva.id} className="border-t border-white/10 hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold">{reserva.servicio}</td>
                <td className="px-6 py-4">{reserva.nombre_cliente}</td>
                <td className="px-6 py-4">{reserva.fecha}</td>
                <td className="px-6 py-4">{reserva.hora_inicio}</td>
                <td className="px-6 py-4">{reserva.monto_pago ? `$${reserva.monto_pago.toFixed(2)}` : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-2 font-medium ${statusColors[reserva.estado_reserva] || 'text-white/80'}`}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{backgroundColor: getStatusDotColor(reserva.estado_reserva)}}></span>
                    {capitalize(reserva.estado_reserva)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusDotColor(status: string) {
  switch (status) {
    case 'completado': return '#22c55e';
    case 'cancelado': return '#ef4444';
    case 'pendiente': return '#facc15';
    case 'en proceso': return '#3b82f6';
    case 'carro listo': return '#6ee7b7';
    case 'en espera': return '#f59e42';
    default: return '#a3a3a3';
  }
}

export default ReservasTable;
