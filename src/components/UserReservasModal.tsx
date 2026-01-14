import React from 'react';
import { Reserva } from '../hooks/useReservas';
import ReservasTable from './ReservasTable';

interface UserReservasModalProps {
  open: boolean;
  onClose: () => void;
  reservas: Reserva[];
  loading?: boolean;
  error?: string | null;
  userName?: string;
}

const UserReservasModal: React.FC<UserReservasModalProps> = ({ open, onClose, reservas, loading, error, userName }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative border border-zinc-700">
        <button
          className="absolute top-3 right-3 text-zinc-400 hover:text-orange-400 transition text-2xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-white mb-4 text-center">Historial de lavados{userName ? ` de ${userName}` : ''}</h2>
        <ReservasTable reservas={reservas} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default UserReservasModal;
