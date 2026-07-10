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
  estado_lavado?: string;
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

type ReservasAdminFilters = {
  estadoReserva?: string;
  estadoLavado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
};

const INACTIVE_RESERVA_STATES = '(cancelada,desaprobada,cancelado,completado)';

export function canClienteCancelarReserva(fecha: string, timeZone = 'America/Caracas') {
  const now = new Date();
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const todayMs = Date.parse(`${todayStr}T00:00:00Z`);
  const reservaMs = Date.parse(`${fecha}T00:00:00Z`);
  if (!Number.isFinite(todayMs) || !Number.isFinite(reservaMs)) return false;
  const diffDays = Math.floor((reservaMs - todayMs) / (1000 * 60 * 60 * 24));
  return diffDays >= 3;
}

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
      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }
      return (data || []) as Reserva[];
    },
    [user]
  );

  // Obtener reservas por cliente (usuario_id)
  const getReservasByCliente = useCallback(async (clienteId: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('usuario_id', clienteId)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: true });
    setLoading(false);
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    return (data || []) as Reserva[];
  }, []);

  const getReservasAdmin = useCallback(async (filters?: ReservasAdminFilters) => {
    setLoading(true);
    setError(null);
    let query = supabase.from('reservas').select('*');
    if (filters?.estadoReserva && filters.estadoReserva !== 'todos') {
      query = query.eq('estado_reserva', filters.estadoReserva);
    }
    if (filters?.estadoLavado && filters.estadoLavado !== 'todos') {
      query = query.eq('estado_lavado', filters.estadoLavado);
    }
    if (filters?.fechaDesde) {
      query = query.gte('fecha', filters.fechaDesde);
    }
    if (filters?.fechaHasta) {
      query = query.lte('fecha', filters.fechaHasta);
    }
    const { data, error } = await query
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true });
    setLoading(false);
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    return (data || []) as Reserva[];
  }, []);

  const getReservasOperativas = useCallback(async (fechaDesde: string, fechaHasta: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('estado_reserva', 'aprobada')
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta)
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true });
    setLoading(false);
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    return (data || []) as Reserva[];
  }, []);

  // KPIs para dashboard (periodo [start, end]
  const getDashboardKPIs = useCallback(async (start: string, end: string) => {
    const from = start;
    const to = end;
    // Lavados realizados (aprobada + no_iniciado?) Use completado
    const { count: lavados, error: lavError } = await supabase
      .from('reservas')
      .select('id', { count: 'exact', head: true })
      .gte('fecha', from)
      .lte('fecha', to)
      .eq('estado_reserva', 'aprobada')
      .eq('estado_lavado', 'completado');
    // Reservas activas
    const { count: reservasActivas, error: raError } = await supabase
      .from('reservas')
      .select('id', { count: 'exact', head: true })
      .gte('fecha', from)
      .lte('fecha', to)
      .not('estado_reserva', 'in', ['cancelada', 'completado']);
    // Ingresos
    const { data: reservasPagadas } = await supabase
      .from('reservas')
      .select('monto_pago')
      .gte('fecha', from)
      .lte('fecha', to)
      .eq('estado_pago', 'pagado');
    const ingresos = (reservasPagadas || []).reduce((sum, r: any) => sum + (r.monto_pago ?? 0), 0);
    // Clientes registrados
    const { count: clientes } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', from)
      .lte('created_at', to);
    return {
      lavados: typeof lavados === 'number' ? lavados : 0,
      reservasActivas: typeof reservasActivas === 'number' ? reservasActivas : 0,
      ingresos: ingresos || 0,
      clientes: clientes || 0,
    } as { lavados: number; reservasActivas: number; ingresos: number; clientes: number };
  }, []);

  // Distribución por servicio (cuenta por servicio en rango)
  const getDashboardServiceCounts = useCallback(async (start: string, end: string) => {
    const { data } = await supabase
      .from('reservas')
      .select('servicio')
      .gte('fecha', start)
      .lte('fecha', end)
      .eq('estado_reserva', 'aprobada');
    const map = new Map<string, number>();
    (data || []).forEach((r: any) => {
      const s = r.servicio || 'Otros';
      map.set(s, (map.get(s) || 0) + 1);
    });
    const res = Array.from(map.entries()).map(([service, count]) => ({ service, count }));
    return res;
  }, []);

  // Crear reserva
  const crearReserva = useCallback(async (reserva: Omit<Reserva, 'id'>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('reservas').insert([reserva]).select();
    setLoading(false);
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    return data && data.length > 0 ? (data[0] as Reserva) : null;
  }, []);

  // Editar reserva
  const editarReserva = useCallback(async (id: string, updates: Partial<Reserva>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('reservas').update(updates).eq('id', id).select();
    setLoading(false);
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    return data && data.length > 0 ? (data[0] as Reserva) : null;
  }, []);

  // Cancelar reserva (cambia estado_reserva)
  const cancelarReserva = useCallback(async (id: string) => {
    return editarReserva(id, { estado_reserva: 'cancelada' });
  }, [editarReserva]);

  const cancelarReservaCliente = useCallback(async (reserva: Reserva) => {
    if (!canClienteCancelarReserva(reserva.fecha)) {
      throw new Error('Solo puedes cancelar con minimo 3 dias de anticipacion.');
    }
    return editarReserva(reserva.id, { estado_reserva: 'cancelada' });
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
      .not('estado_reserva', 'in', INACTIVE_RESERVA_STATES);
    setLoading(false);
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    return !data || data.length === 0;
  }, []);

  // Repetir reserva (crea varias reservas según patrón)
  const repetirReserva = useCallback(async (reserva: Omit<Reserva, 'id'>, fechas: string[]) => {
    setLoading(true);
    setError(null);
    const reservas = fechas.map(f => ({ ...reserva, fecha: f }));
    const { data, error } = await supabase.from('reservas').insert(reservas).select();
    setLoading(false);
    if (error) {
      setError(error.message);
      throw new Error(error.message);
    }
    return (data || []) as Reserva[];
  }, []);

  return {
    loading,
    error,
    getReservasByFecha,
    getReservasByCliente,
    getReservasAdmin,
    getReservasOperativas,
    getDashboardKPIs,
    getDashboardServiceCounts,
    crearReserva,
    editarReserva,
    cancelarReserva,
    cancelarReservaCliente,
    canClienteCancelarReserva,
    validarDisponibilidad,
    repetirReserva,
  };
}
