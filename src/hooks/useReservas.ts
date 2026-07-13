import { useCallback, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { db } from '../lib/firebaseClient';
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';

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

const INACTIVE_RESERVA_STATES = ['cancelada', 'desaprobada', 'cancelado', 'completado'];

const reservasCol = () => collection(db, 'reservas');

async function queryReservas(...constraints: QueryConstraint[]): Promise<Reserva[]> {
  const snap = await getDocs(query(reservasCol(), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reserva);
}

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

  const isStaff = ['admin', 'it'].includes(user?.user_metadata?.rol ?? '');

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error de base de datos';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener reservas por fecha (y opcionalmente usuario)
  const getReservasByFecha = useCallback(
    async (fecha: string, onlyUser = false) =>
      run(() => {
        const constraints: QueryConstraint[] = [where('fecha', '==', fecha)];
        // Las rules solo dejan a staff leer reservas ajenas (paridad con la RLS previa)
        if ((onlyUser || !isStaff) && user) constraints.push(where('usuario_id', '==', user.id));
        constraints.push(orderBy('hora_inicio', 'asc'));
        return queryReservas(...constraints);
      }),
    [run, user, isStaff]
  );

  // Obtener reservas por cliente (usuario_id)
  const getReservasByCliente = useCallback(
    async (clienteId: string) =>
      run(() =>
        queryReservas(
          where('usuario_id', '==', clienteId),
          orderBy('fecha', 'desc'),
          orderBy('hora_inicio', 'asc')
        )
      ),
    [run]
  );

  const getReservasAdmin = useCallback(
    async (filters?: ReservasAdminFilters) =>
      run(() => {
        const constraints: QueryConstraint[] = [];
        if (filters?.estadoReserva && filters.estadoReserva !== 'todos') {
          constraints.push(where('estado_reserva', '==', filters.estadoReserva));
        }
        if (filters?.estadoLavado && filters.estadoLavado !== 'todos') {
          constraints.push(where('estado_lavado', '==', filters.estadoLavado));
        }
        if (filters?.fechaDesde) constraints.push(where('fecha', '>=', filters.fechaDesde));
        if (filters?.fechaHasta) constraints.push(where('fecha', '<=', filters.fechaHasta));
        constraints.push(orderBy('fecha', 'asc'), orderBy('hora_inicio', 'asc'));
        return queryReservas(...constraints);
      }),
    [run]
  );

  const getReservasOperativas = useCallback(
    async (fechaDesde: string, fechaHasta: string) =>
      run(() =>
        queryReservas(
          where('estado_reserva', '==', 'aprobada'),
          where('fecha', '>=', fechaDesde),
          where('fecha', '<=', fechaHasta),
          orderBy('fecha', 'asc'),
          orderBy('hora_inicio', 'asc')
        )
      ),
    [run]
  );

  // KPIs para dashboard (periodo [start, end])
  const getDashboardKPIs = useCallback(async (start: string, end: string) => {
    // Lavados completados
    const lavadosSnap = await getCountFromServer(
      query(
        reservasCol(),
        where('fecha', '>=', start),
        where('fecha', '<=', end),
        where('estado_reserva', '==', 'aprobada'),
        where('estado_lavado', '==', 'completado')
      )
    );
    // Rango completo una vez; activas e ingresos se filtran en memoria
    // ponytail: volumen pequeño (negocio local); si crece, mover a agregaciones
    const enRango = await queryReservas(where('fecha', '>=', start), where('fecha', '<=', end));
    const reservasActivas = enRango.filter(
      (r) => !['cancelada', 'completado'].includes(r.estado_reserva)
    ).length;
    const ingresos = enRango
      .filter((r) => r.estado_pago === 'pagado')
      .reduce((sum, r) => sum + (r.monto_pago ?? 0), 0);
    // Clientes registrados en el periodo
    const clientesSnap = await getCountFromServer(
      query(collection(db, 'profiles'), where('created_at', '>=', start), where('created_at', '<=', end))
    );
    return {
      lavados: lavadosSnap.data().count,
      reservasActivas,
      ingresos: ingresos || 0,
      clientes: clientesSnap.data().count,
    } as { lavados: number; reservasActivas: number; ingresos: number; clientes: number };
  }, []);

  // Distribución por servicio (cuenta por servicio en rango)
  const getDashboardServiceCounts = useCallback(async (start: string, end: string) => {
    const data = await queryReservas(
      where('fecha', '>=', start),
      where('fecha', '<=', end),
      where('estado_reserva', '==', 'aprobada')
    );
    const map = new Map<string, number>();
    data.forEach((r) => {
      const s = r.servicio || 'Otros';
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries()).map(([service, count]) => ({ service, count }));
  }, []);

  // Crear reserva
  const crearReserva = useCallback(
    async (reserva: Omit<Reserva, 'id'>) =>
      run(async () => {
        const ref = await addDoc(reservasCol(), reserva);
        return { id: ref.id, ...reserva } as Reserva;
      }),
    [run]
  );

  // Editar reserva
  const editarReserva = useCallback(
    async (id: string, updates: Partial<Reserva>) =>
      run(async () => {
        const ref = doc(db, 'reservas', id);
        await updateDoc(ref, updates as Record<string, any>);
        const snap = await getDoc(ref);
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Reserva) : null;
      }),
    [run]
  );

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
  const validarDisponibilidad = useCallback(
    async (fecha: string, hora_inicio: string) =>
      run(async () => {
        const constraints: QueryConstraint[] = [
          where('fecha', '==', fecha),
          where('hora_inicio', '==', hora_inicio),
        ];
        // ponytail: cliente solo ve sus reservas (igual que la RLS previa); choques con
        // reservas de terceros los valida el staff al aprobar
        if (!isStaff && user) constraints.push(where('usuario_id', '==', user.id));
        const data = await queryReservas(...constraints);
        // Solo cuentan reservas activas (no canceladas ni completadas)
        return data.filter((r) => !INACTIVE_RESERVA_STATES.includes(r.estado_reserva)).length === 0;
      }),
    [run, user, isStaff]
  );

  // Repetir reserva (crea varias reservas según patrón)
  const repetirReserva = useCallback(
    async (reserva: Omit<Reserva, 'id'>, fechas: string[]) =>
      run(async () => {
        const batch = writeBatch(db);
        const created: Reserva[] = [];
        fechas.forEach((f) => {
          const ref = doc(reservasCol());
          const data = { ...reserva, fecha: f };
          batch.set(ref, data);
          created.push({ id: ref.id, ...data } as Reserva);
        });
        await batch.commit();
        return created;
      }),
    [run]
  );

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
