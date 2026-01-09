import { useCallback, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabaseClient';

export type Reserva = {
  id: string;
  usuario_id: string;
  nombre_cliente: string;
  telefono_cliente?: string;
  email_cliente?: string;
  fecha: string;
  hora_inicio: string;
  servicio: string;
  estado_reserva: string;
  estado_pago: string;
  metodo_pago?: string;
  monto_pago?: number;
  notas_cliente?: string;
  notas_admin?: string;
  plan_usuario?: string;
  etiquetas?: string[];
  calificacion?: number;
  comentario_postservicio?: string;
  repeticion?: any;
  historial?: any;
  fotos_metadata?: any;
  creado_en?: string;
  actualizado_en?: string;
};

export function useReservas() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener reservas por fecha (y opcionalmente usuario)
  const getReservasByFecha = useCallback(
    async (fecha: string, onlyUser = false) => {
      setLoading(true);
      setError(null);
      let query = supabase.from('reservas').select('*').eq('fecha', fecha);
      if (onlyUser && user) {
        query = query.eq('usuario_id', user.id);
      }
      const { data, error } = await query.order('hora_inicio', { ascending: true });
      setLoading(false);
      if (error) setError(error.message);
      return (data || []) as Reserva[];
    },
    [user]
  );

  // Crear reserva
  const crearReserva = useCallback(async (reserva: Omit<Reserva, 'id'>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('reservas').insert([reserva]).select();
    setLoading(false);
    if (error) setError(error.message);
    return data && data.length > 0 ? (data[0] as Reserva) : null;
  }, []);

  // Editar reserva
  const editarReserva = useCallback(async (id: string, updates: Partial<Reserva>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('reservas').update(updates).eq('id', id).select();
    setLoading(false);
    if (error) setError(error.message);
    return data && data.length > 0 ? (data[0] as Reserva) : null;
  }, []);

  // Cancelar reserva (cambia estado_reserva)
  const cancelarReserva = useCallback(async (id: string) => {
    return editarReserva(id, { estado_reserva: 'cancelado' });
  }, [editarReserva]);

  // Validar disponibilidad (devuelve true si el horario está libre)
  const validarDisponibilidad = useCallback(async (fecha: string, hora_inicio: string) => {
    setLoading(true);
    setError(null);
    // Solo cuenta reservas activas (no canceladas ni completadas)
    const { data, error } = await supabase
      .from('reservas')
      .select('id')
      .eq('fecha', fecha)
      .eq('hora_inicio', hora_inicio)
      .not('estado_reserva', 'in', ['cancelado', 'completado']);
    setLoading(false);
    if (error) setError(error.message);
    return !data || data.length === 0;
  }, []);

  // Repetir reserva (crea varias reservas según patrón)
  const repetirReserva = useCallback(async (reserva: Omit<Reserva, 'id'>, fechas: string[]) => {
    setLoading(true);
    setError(null);
    const reservas = fechas.map(f => ({ ...reserva, fecha: f }));
    const { data, error } = await supabase.from('reservas').insert(reservas).select();
    setLoading(false);
    if (error) setError(error.message);
    return (data || []) as Reserva[];
  }, []);

  return {
    loading,
    error,
    getReservasByFecha,
    crearReserva,
    editarReserva,
    cancelarReserva,
    validarDisponibilidad,
    repetirReserva,
  };
}
