const packages = [
  {
    name: 'Lavado básico',
    price: 'Desde $10',
    duration: '30 min',
    includes: ['Exterior', 'Secado', 'Limpieza vidrios']
  },
  {
    name: 'Lavado detallado',
    price: 'Desde $25',
    duration: '90 min',
    includes: ['Exterior e interior', 'Encerado ligero', 'Aspirado profundo']
  },
  {
    name: 'Motor',
    price: 'Desde $15',
    duration: '45 min',
    includes: ['Desengrase', 'Protección plásticos', 'Secado controlado']
  },
  {
    name: 'Tapicería',
    price: 'Desde $30',
    duration: '2 h',
    includes: ['Limpieza profunda', 'Desmanchado básico', 'Neutralizado de olores']
  },
  {
    name: 'Motos',
    price: 'Desde $8',
    duration: '25 min',
    includes: ['Exterior', 'Brillo plásticos', 'Lubricación ligera']
  },
  {
    name: 'Camionetas',
    price: 'Desde $18',
    duration: '50 min',
    includes: ['Exterior', 'Chasis rápido', 'Secado + vidrios']
  }
]

export default function Services() {
  return (
    <section className="container-shell space-y-6 pt-6 sm:pt-0">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.12em] text-white/50">Servicios y precios</p>
        <h1 className="text-3xl font-semibold leading-tight">Elige el paquete ideal</h1>
        <p className="max-w-2xl text-sm text-white/70">
          Paquetes pensados para distintos tipos de vehículo y nivel de detalle. Cada servicio muestra una duración
          estimada y lo que incluye.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((item) => (
          <article key={item.name} className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <span className="text-sm text-white/70">{item.duration}</span>
            </div>
            <p className="text-sm text-white/80">{item.price}</p>
            <ul className="space-y-1 text-sm text-white/70">
              {item.includes.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
            <button className="mt-2 w-full rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black transition">
              Reservar este servicio
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
