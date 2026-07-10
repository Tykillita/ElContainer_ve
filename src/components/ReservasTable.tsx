import React from 'react';
import type { Reserva } from '../hooks/useReservas';

interface ReservasTableProps {
  reservas: Reserva[];
  loading?: boolean;
  error?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (col: string) => void;
  renderActions?: (reserva: Reserva) => React.ReactNode;
  onRowClick?: (reserva: Reserva) => void;
  statusField?: 'estado_reserva' | 'estado_lavado';
  statusHeader?: string;
}

const statusColors: Record<string, string> = {
  por_aprobar: 'text-yellow-300',
  aprobada: 'text-green-400',
  desaprobada: 'text-rose-300',
  cancelada: 'text-red-400',
  no_iniciado: 'text-white/80',
  en_proceso: 'text-blue-400',
  carro_listo: 'text-emerald-300',
  completado: 'text-green-400',
  pendiente: 'text-yellow-300',
  cancelado: 'text-red-400',
  'en proceso': 'text-blue-400',
  'carro listo': 'text-emerald-300',
  'en espera': 'text-yellow-300',
};

export const ReservasTable: React.FC<ReservasTableProps> = ({
  reservas,
  loading,
  error,
  sortBy,
  sortOrder,
  onSortChange,
  renderActions,
  onRowClick,
  statusField = 'estado_reserva',
  statusHeader = 'Estado',
}) => {
  const colSpan = renderActions ? 7 : 6;
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
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-orange-400 transition" onClick={() => onSortChange && onSortChange(statusField)}>
              {statusHeader} {sortBy === statusField && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            {renderActions && <th className="px-6 py-4 font-medium">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={colSpan} className="px-6 py-6 text-center text-white/70">Cargando...</td></tr>
          ) : error ? (
            <tr><td colSpan={colSpan} className="px-6 py-6 text-center text-red-400">{error}</td></tr>
          ) : reservas.length === 0 ? (
            <tr><td colSpan={colSpan} className="px-6 py-6 text-center text-white/80">No hay reservas.</td></tr>
          ) : (
            reservas.map(reserva => (
              <tr
                key={reserva.id}
                className={`border-t border-white/10 transition ${onRowClick ? 'hover:bg-white/5 cursor-pointer' : 'hover:bg-white/5'}`}
                onClick={onRowClick ? () => onRowClick(reserva) : undefined}
              >
                <td className="px-6 py-4 font-semibold">{reserva.servicio}</td>
                <td className="px-6 py-4">{reserva.nombre_cliente}</td>
                <td className="px-6 py-4">{reserva.fecha}</td>
                <td className="px-6 py-4">{reserva.hora_inicio}</td>
                <td className="px-6 py-4">{reserva.monto_pago ? `$${reserva.monto_pago.toFixed(2)}` : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-2 font-medium ${statusColors[(reserva[statusField] || '') as string] || 'text-white/80'}`}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{backgroundColor: getStatusDotColor((reserva[statusField] || '') as string)}}></span>
                    {capitalize(String(reserva[statusField] || '-'))}
                  </span>
                </td>
                {renderActions && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {renderActions(reserva)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

function capitalize(str: string) {
  return str.replace(/_/g, ' ').replace(/^./, (s) => s.toUpperCase());
}

function getStatusDotColor(status: string) {
  switch (status) {
    case 'por_aprobar': return '#facc15';
    case 'aprobada': return '#4ade80';
    case 'desaprobada': return '#fb7185';
    case 'cancelada': return '#ef4444';
    case 'no_iniciado': return '#a3a3a3';
    case 'en_proceso': return '#3b82f6';
    case 'carro_listo': return '#6ee7b7';
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
