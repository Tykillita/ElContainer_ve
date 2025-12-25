import { useState } from 'react';
import CustomSelect from '../components/CustomSelect';

const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
const services = ['Lavado básico', 'Lavado detallado', 'Motor', 'Tapicería', 'Motos', 'Camionetas'];



export default function Booking() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [selectedSlot, setSelectedSlot] = useState(slots[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación básica
    if (!name || !phone || !car || !date || !selectedSlot || !selectedService) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }
    const msg =
      `🚗 *¡Nueva reserva desde la web de El Container!* 🚗\n` +
      `¡Hola! Me gustaría reservar un servicio para mi vehículo.\n\n` +
      `*Datos de la reserva:*\n` +
      `• Nombre: ${name}\n` +
      `• Teléfono: ${phone}\n` +
      `• Vehículo: ${car}\n` +
      `• Servicio: ${selectedService}\n` +
      `• Fecha: ${date}\n` +
      `• Hora: ${selectedSlot}\n` +
      (notes ? `• Notas: ${notes}\n` : '') +
      `\n¿Me pueden confirmar la disponibilidad? ¡Gracias! ✨`;
    const url = `https://wa.me/50762259262?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="container-shell space-y-6 booking-form">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.12em] text-white/50">Reservas</p>
        <h1 className="text-3xl font-semibold leading-tight">Agenda tu cita</h1>
        <p className="max-w-2xl text-sm text-white/70">
          Elige fecha, hora y servicio. Te confirmaremos por WhatsApp o email. Los pagos se realizan en el local:
          pago móvil, transferencia, efectivo o tarjeta.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <form className="space-y-4 card" onSubmit={handleSubmit}>
          <label className="space-y-1 text-sm text-white/80">
            <span>Nombre y Apellido</span>
            <input
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </label>
          <label className="space-y-1 text-sm text-white/80">
            <span>Teléfono</span>
            <input
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </label>
          <label className="space-y-1 text-sm text-white/80">
            <span>Placa / Modelo / Color</span>
            <input
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/40"
              value={car}
              onChange={e => setCar(e.target.value)}
              required
            />
          </label>
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
                onChange={e => setDate(e.target.value)}
                required
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
              onChange={e => setNotes(e.target.value)}
            />
          </label>
          <button className="w-full rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold transition focus:ring-2 focus:ring-orange-400 focus:outline-none">
            Confirmar reserva
          </button>
        </form>

        <aside className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Cómo funciona</h2>
            <p className="text-sm text-white/70">
              Reservas sujetas a disponibilidad. Duración estimada según servicio. Recibirás confirmación y recordatorio.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Métodos de pago (en el local)</h3>
            <ul className="text-sm text-white/80 space-y-1">
              <li>• Pago móvil</li>
              <li>• Transferencia</li>
              <li>• Efectivo</li>
              <li>• Tarjeta</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Contacto</h3>
            <p className="text-sm text-white/70">WhatsApp y teléfono disponibles para cambios o dudas.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
