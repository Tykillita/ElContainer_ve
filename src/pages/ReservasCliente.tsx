import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import MobileScaleWrapper from '../components/MobileScaleWrapper';
import ReservasTable from '../components/ReservasTable';
import ReservasFilter from '../components/ReservasFilter';
import CustomSelect from '../components/CustomSelect';
import { useAuth } from '../context/useAuth';
import { type Reserva, useReservas } from '../hooks/useReservas';

const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
const services = ['Lavado básico', 'Lavado detallado', 'Motor', 'Tapicería', 'Motos', 'Camionetas'];

const QUICK_COLORS: Array<{ name: string; hex: string }> = [
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Negro', hex: '#000000' },
  { name: 'Gris', hex: '#6b7280' },
  { name: 'Plata', hex: '#cbd5e1' },
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Amarillo', hex: '#facc15' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Marrón', hex: '#7c3f1d' },
];

export default function ReservasCliente() {
  const { user } = useAuth();
  const { getReservasByCliente, crearReserva, validarDisponibilidad, loading, error } = useReservas();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [estado, setEstado] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [openModal, setOpenModal] = useState(false);

  const meta = user?.user_metadata ?? {};
  const defaultName = (meta.full_name as string | undefined) || [meta.nombre, meta.apellido].filter(Boolean).join(' ').trim() || (user?.email ?? '');
  const defaultPhone = (meta.telefono as string | undefined) || (meta.phone as string | undefined) || '';

  const fetchReservas = async () => {
    if (!user?.id) return;
    const res = await getReservasByCliente(user.id);
    setReservas(res);
  };

  useEffect(() => {
    fetchReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filteredAndSorted = useMemo(() => {
    let result = reservas;
    if (estado !== 'todos') {
      result = result.filter((r) => r.estado_reserva === estado);
    }

    const direction = sortOrder === 'asc' ? 1 : -1;
    const compare = (a: Reserva, b: Reserva) => {
      switch (sortBy) {
        case 'servicio':
          return a.servicio.localeCompare(b.servicio) * direction;
        case 'nombre_cliente':
          return a.nombre_cliente.localeCompare(b.nombre_cliente) * direction;
        case 'fecha': {
          const c = a.fecha.localeCompare(b.fecha);
          return c * direction;
        }
        case 'hora_inicio':
          return a.hora_inicio.localeCompare(b.hora_inicio) * direction;
        case 'monto_pago':
          return ((a.monto_pago ?? 0) - (b.monto_pago ?? 0)) * direction;
        case 'estado_reserva':
          return a.estado_reserva.localeCompare(b.estado_reserva) * direction;
        default:
          return 0;
      }
    };

    return [...result].sort(compare);
  }, [reservas, estado, sortBy, sortOrder]);

  const onSortChange = (col: string) => {
    setSortBy((prev) => {
      if (prev === col) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder('asc');
      return col;
    });
  };

  const handleCreateReserva = async (form: { name: string; phone: string; placa: string; modelo: string; colorHex: string; date: string; slot: string; service: string; notes: string; }) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    const disponible = await validarDisponibilidad(form.date, form.slot);
    if (!disponible) {
      throw new Error('Ese horario ya está ocupado. Elige otra hora.');
    }

    const notasParts: string[] = [];
    if (form.placa.trim()) notasParts.push(`Placa: ${form.placa.trim()}`);
    if (form.modelo.trim()) notasParts.push(`Modelo: ${form.modelo.trim()}`);
    if (form.colorHex) notasParts.push(`Color: ${form.colorHex}`);
    if (form.notes.trim()) notasParts.push(`Notas: ${form.notes.trim()}`);

    const payload: Omit<Reserva, 'id'> = {
      usuario_id: user.id,
      nombre_cliente: form.name,
      telefono_cliente: form.phone || undefined,
      email_cliente: user.email || undefined,
      fecha: form.date,
      hora_inicio: form.slot,
      servicio: form.service,
      estado_reserva: 'pendiente',
      estado_pago: 'pendiente',
      notas_cliente: notasParts.length ? notasParts.join('\n') : undefined,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };

    const created = await crearReserva(payload);
    if (!created) throw new Error('No se pudo crear la reserva.');

    await fetchReservas();
  };

  return (
    <MobileScaleWrapper>
      <main className="min-h-screen px-4 py-10 text-white">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">Mis Reservas</h1>
              <p className="text-white/70">Aquí puedes ver tu historial y agendar una nueva cita.</p>
            </div>
            <button
              className="rounded-xl bg-orange-500 px-4 py-2 font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition"
              onClick={() => setOpenModal(true)}
            >
              + Nueva reserva
            </button>
          </div>

          <ReservasFilter
            value={estado}
            options={['todos', 'completado', 'pendiente', 'cancelado', 'en proceso', 'carro listo', 'en espera']}
            onChange={setEstado}
          />

          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 min-h-[420px]">
            <ReservasTable
              reservas={filteredAndSorted}
              loading={loading}
              error={error}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
          </div>
        </div>

        <ReservaClienteModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          defaultName={defaultName}
          defaultPhone={defaultPhone}
          onSubmit={async (form) => {
            await handleCreateReserva(form);
            setOpenModal(false);
          }}
        />
      </main>
    </MobileScaleWrapper>
  );
}

function ReservaClienteModal({
  open,
  onClose,
  defaultName,
  defaultPhone,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  defaultName: string;
  defaultPhone: string;
  onSubmit: (form: { name: string; phone: string; placa: string; modelo: string; colorHex: string; date: string; slot: string; service: string; notes: string; }) => Promise<void>;
}) {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [selectedSlot, setSelectedSlot] = useState(slots[0]);
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [colorHex, setColorHex] = useState('#ffffff');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(defaultName);
    setPhone(defaultPhone);
    setSelectedService(services[0]);
    setSelectedSlot(slots[0]);
    setPlaca('');
    setModelo('');
    setColorHex('#ffffff');
    setDate('');
    setNotes('');
    setLocalError(null);
    setSubmitting(false);
  }, [open, defaultName, defaultPhone]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name || !phone || !placa || !date || !selectedSlot || !selectedService) {
      setLocalError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({ name, phone, placa, modelo, colorHex, date, slot: selectedSlot, service: selectedService, notes });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear la reserva.';
      setLocalError(msg);
      setSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto px-3 sm:px-4 py-5 sm:py-8">
      <div className="fixed inset-0 z-[200] bg-black" onClick={() => !submitting && onClose()} />
      <div className="relative z-[210] w-full max-w-5xl origin-top scale-[0.9] sm:scale-100 rounded-2xl border border-white/10 bg-zinc-950 p-3 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-white/50">Reservas</p>
            <h2 className="text-2xl font-semibold leading-tight">Agenda tu cita</h2>
            <p className="max-w-2xl text-sm text-white/70">
              Elige fecha, hora y servicio. Tu reserva quedará registrada y el equipo la confirmará.
            </p>
          </div>
          <button
            type="button"
            className="text-white/70 hover:text-orange-400 text-3xl font-bold leading-none"
            onClick={() => !submitting && onClose()}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <form className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-4" onSubmit={handleSubmit}>
            {localError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {localError}
              </div>
            )}

            <label className="space-y-1 text-sm text-white/80">
              <span>Nombre y Apellido</span>
              <input
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </label>

            <label className="space-y-1 text-sm text-white/80">
              <span>Teléfono</span>
              <input
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={submitting}
              />
            </label>

            <label className="space-y-1 text-sm text-white/80">
              <span>Placa</span>
              <input
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                required
                disabled={submitting}
              />
            </label>

            <label className="space-y-1 text-sm text-white/80">
              <span>Modelo</span>
              <input
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej: Corolla, Civic, Hilux"
                disabled={submitting}
              />
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white/80">Color</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">{colorHex.toUpperCase()}</span>
                  <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: colorHex }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  disabled={submitting}
                  aria-label="Selector de color"
                  className="h-10 w-14 rounded-lg border border-white/15 bg-white/5 p-1"
                  style={{ WebkitAppearance: 'none' } as React.CSSProperties}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    role="group"
                    aria-label="Colores rápidos"
                  >
                    {QUICK_COLORS.map((c) => {
                      const isActive = c.hex.toLowerCase() === colorHex.toLowerCase();
                      return (
                        <button
                          key={c.name}
                          type="button"
                          disabled={submitting}
                          onClick={() => setColorHex(c.hex)}
                          className={
                            `inline-flex flex-none items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ` +
                            (isActive
                              ? 'border-orange-400/80 bg-orange-500/15 text-white'
                              : 'border-white/15 bg-white/5 text-white/80 hover:border-white/30')
                          }
                          aria-pressed={isActive}
                        >
                          <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <label className="space-y-1 text-sm text-white/80 w-full">
              <span>Servicio</span>
              <CustomSelect
                options={services.map((s) => ({ value: s, label: s }))}
                value={selectedService}
                onChange={setSelectedService}
                placeholder="Selecciona un servicio"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-white/80">
                <span>Fecha</span>
                <input
                  type="date"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={submitting}
                />
              </label>
              <label className="space-y-1 text-sm text-white/80 w-full">
                <span>Hora</span>
                <CustomSelect
                  options={slots.map((h) => ({ value: h, label: h }))}
                  value={selectedSlot}
                  onChange={setSelectedSlot}
                  placeholder="Selecciona una hora"
                />
              </label>
            </div>

            <label className="space-y-1 text-sm text-white/80">
              <span>Notas</span>
              <textarea
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
              />
            </label>

            <button
              className="w-full rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold transition focus:ring-2 focus:ring-orange-400 focus:outline-none disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? 'Creando...' : 'Confirmar reserva'}
            </button>

            <details className="xl:hidden rounded-2xl border border-white/10 bg-black/40 p-4">
              <summary className="cursor-pointer select-none text-sm font-semibold text-white/90">Cómo funciona / Métodos de pago</summary>
              <div className="mt-3 space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Cómo funciona</h3>
                  <p className="text-sm text-white/70">
                    Reservas sujetas a disponibilidad. Tu solicitud quedará registrada y se confirmará por el equipo.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Métodos de pago</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Pago móvil</li>
                    <li>• Transferencia</li>
                    <li>• Efectivo</li>
                    <li>• Tarjeta</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Tip</h4>
                  <p className="text-sm text-white/70">Si necesitas cambiar la hora, crea otra reserva o contáctanos.</p>
                </div>
              </div>
            </details>
          </form>

          <aside className="hidden xl:block rounded-2xl border border-white/10 bg-black/40 p-4 space-y-4 xl:sticky xl:top-6">
            <div>
              <h3 className="text-lg font-semibold">Cómo funciona</h3>
              <p className="text-sm text-white/70">
                Reservas sujetas a disponibilidad. Tu solicitud quedará registrada y se confirmará por el equipo.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Métodos de pago</h4>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Pago móvil</li>
                <li>• Transferencia</li>
                <li>• Efectivo</li>
                <li>• Tarjeta</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Tip</h4>
              <p className="text-sm text-white/70">Si necesitas cambiar la hora, crea otra reserva o contáctanos.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
