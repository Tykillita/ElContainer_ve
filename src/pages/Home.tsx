import { useRef } from 'react'
import AutoStepper from '../components/AutoStepper'
import JeepShowcase from '../components/JeepShowcase'
import { SpeedIcon, PaintIcon, SecurityIcon } from '../components/icons/Benefits'
import LazySection from '../components/LazySection'
import { FloatingElement } from '../components/ParticleSystem'
import ScrollButton from '../components/ScrollButton'
import logo from '../resources/img/elcontainer_logo.png'

const featuredServices = [
  { title: 'Lavado rapido', desc: 'Exterior + secado en 30 min.' },
  { title: 'Detallado', desc: 'Exterior e interior con aspirado profundo.' },
  { title: 'Tapiceria', desc: 'Limpieza profunda y neutralizado de olores.' }
]

const benefits = [
  { title: 'Rapidez y orden', desc: 'Reservas flexibles para evitar esperas largas.' },
  { title: 'Cuidado de pintura', desc: 'Productos y tecnicas suaves para brillo duradero.' },
  { title: 'Seguridad', desc: 'Zona iluminada y aviso al terminar tu vehiculo.' }
]

const steps = [
  { title: 'Elige tu servicio', desc: 'Lavado basico, detallado, tapiceria o motor.' },
  { title: 'Reserva horario', desc: 'Define dia y hora; te confirmamos por WhatsApp o email.' },
  { title: 'Paga en el local', desc: 'Pago movil, transferencia, efectivo o tarjeta.' }
]

const payments = ['Pago movil', 'Transferencia', 'Efectivo', 'Tarjeta']

export default function Home() {
  const infoRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      <section className="container-shell space-y-14">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-2 text-center sm:px-4">
          <FloatingElement delay={0} duration={8}>
            <img
              src={logo}
              alt="El Container Autolavado"
              className="h-[18rem] max-w-full object-contain drop-shadow-[0_45px_140px_rgba(0,0,0,0.6)] md:h-[14rem] lg:h-[17rem] xl:h-[20rem] card-ripple"
              style={{
                imageRendering: 'auto',
                maxHeight: '70vh',
                maxWidth: '90vw'
              }}
            />
          </FloatingElement>
          <h1
            className="font-hero text-[clamp(2.8rem,8vw,5.8rem)] md:text-[clamp(2.4rem,7vw,5.2rem)] lg:text-[clamp(3.1rem,6vw,6rem)] leading-[0.95] tracking-[0.12em] uppercase text-transparent bg-clip-text inline-block mb-5"
            style={{
              backgroundImage:
                'linear-gradient(180deg,#f7f7f7 0%,#ededed 22%,#d5d5d5 42%,#9b9b9b 60%,#e4e4e4 78%,#8a8a8a 100%)',
              textShadow: '0 1px 0 #d6d6d6ff, 0 2px 0 #111, 0 4px 10px rgba(0,0,0,0.55), 0 0 24px rgba(151, 149, 148, 0.65)',
              transform: 'skewX(-8deg)',
              WebkitTextStroke: '0.6px #0b0b0b'
            }}
          >
            <span className="md:text-[1.1em] text-[1.3em] whitespace-nowrap">
              EL CONTAINER
            </span>
            <span
              className="block text-white"
              style={{
                fontSize: '0.45em',
                letterSpacing: '0.58em',
                WebkitTextStroke: '0.6px #0b0b0b',
                textShadow: '0 1px 0 #0c0c0c, 0 2px 6px rgba(0,0,0,0.5), 0 0 18px rgba(32, 10, 4, 0.9)',
                transform: 'translateY(-10px)'
              }}
            >
              AUTOLAVADO
            </span>
          </h1>
          <p className="-mt-2 max-w-3xl text-base text-white/75 sm:text-lg">
            Lavado rapido, seguro y sin sorpresas. Reserva en linea, llega a tu hora y paga en el local.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-white/80">
            <span className="rounded-full border border-white/25 px-3 py-1">Reservas flexibles</span>
            <span className="rounded-full border border-white/25 px-3 py-1">Confirmacion por WhatsApp</span>
            <span className="rounded-full border border-white/25 px-3 py-1">Pago en sitio</span>
          </div>
          <ScrollButton
            targetRef={infoRef}
            delay={300}
            className="lg:block hidden mt-4 mb-12"
          >
            Ver mas
          </ScrollButton>
        </div>
      </section>

      <LazySection threshold={0.1} className="w-full mt-0 md:mt-24 lg:mt-28 overflow-hidden pb-28">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20">
          <div className="flex justify-center lg:hidden mt-8 mb-20">
            <ScrollButton
              targetRef={infoRef}
              delay={300}
            >
              Ver mas
            </ScrollButton>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start justify-items-start gap-y-4 sm:gap-8 lg:gap-12 xl:gap-14">
            <div className="flex justify-start min-w-0 mb-2 sm:mb-0 sm:justify-start lg:ml-16 mt-10 sm:mt-0">
              <div className="relative w-full max-w-[340px] ml-16 sm:ml-0 sm:max-w-md md:max-w-2xl lg:max-w-5xl overflow-visible rounded-2xl card bg-white/5 backdrop-blur-sm border border-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] transition-all duration-300">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/0 to-black/30" />
                <div className="overflow-visible">
                  <JeepShowcase variant="clean" />
                </div>
              </div>
            </div>
            <div className="text-white flex justify-center min-w-0 lg:justify-start">
              <div className="flex flex-col gap-6 w-full max-w-xl lg:ml-72 xl:ml-90 mt-6 mb-10 sm:mt-0 sm:mb-0">
                <div className="card space-y-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 lg:p-9 pr-1 sm:pr-0 text-base shadow-[0_22px_80px_rgba(0,0,0,0.28)]">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.16em] text-white/60">Para cualquier modelo</p>
                    <h2 className="text-3xl font-semibold leading-tight lg:text-4xl">Cualquier auto merece el mejor lavado</h2>
                    <p className="text-white/75 text-base lg:text-lg">
                      Trabajamos con autos compactos, sedanes, SUVs y 4x4. Usamos productos que cuidan pintura y tapiceria, con
                      tecnicas que evitan rayas y dejan acabado de showroom.
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex gap-2">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-white/60" />
                      <span>Lavados sin esperas largas.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-white/60" />
                      <span>Detallado interior y exterior para cualquier modelo.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-white/60" />
                      <span>Confirmacion por WhatsApp y pago al finalizar.</span>
                    </div>
                  </div>
                </div>
                <div className="card space-y-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 lg:p-9 pr-1 sm:pr-0 text-base shadow-[0_18px_60px_rgba(0,0,0,0.18)] mt-8 sm:mt-0">
                  <p className="text-sm uppercase tracking-[0.16em] text-white/60">Promoción especial</p>
                  <h2 className="text-2xl font-semibold leading-tight">¡Diciembre de brillo total!</h2>
                  <p className="text-white/75 text-base lg:text-lg">
                    Este mes, tu auto recibe un tratamiento de cera gratis con cualquier detallado completo. ¡Reserva tu cita y haz que tu vehículo luzca impecable para las fiestas!<br/>
                    <span className="block mt-2 text-white/60 text-sm">Válido hasta el 31 de diciembre.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Línea de separación solo en móvil, después de la tarjeta de promoción y antes de 'Autolavado' */}
        <div className="block sm:hidden w-full" style={{ marginTop: 64, marginBottom: 0 }}>
          <hr className="border-t border-white/15" />
        </div>
      </LazySection>

      <div className="relative" style={{ marginTop: 0, paddingTop: 0 }} ref={infoRef}>
        <div className="container-shell">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.12em] text-white/60">Autolavado</p>
            <h2 className="text-3xl font-semibold leading-tight">Lavado rapido, seguro y sin sorpresas</h2>
            <p className="max-w-2xl text-base text-white/70">
              Reserva en linea, llega a tu hora y paga en el local. Cuidamos pintura, tapiceria y detalles para que tu
              vehiculo salga brillante y protegido.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <span className="rounded-full border border-white/20 px-3 py-1">Reservas flexibles</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Confirmacion por WhatsApp</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Pago en sitio</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/booking"
                className="rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow-md transition hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:outline-none flex items-center"
              >
                Reservar cita
              </a>
              <a
                href="https://wa.me/584241234567?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20los%20servicios%20de%20autolavado%20y%20reservar%20una%20cita.%20%C2%BFMe%20pueden%20ayudar%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/30 px-4 py-2 text-sm text-white transition hover:border-white/60 flex items-center"
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="text-lg font-semibold">Servicios destacados</h2>
            <div className="space-y-3">
              {featuredServices.map((s) => (
                <div key={s.title} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-sm font-semibold text-white">{s.title}</div>
                  <p className="text-sm text-white/70">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-xs text-white/60">Ver lista completa en la seccion Servicios.</div>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-3 my-8">
          {benefits.map((b, i) => (
            <FloatingElement key={b.title} delay={i * 0.5} duration={6 + i}>
              <article
                className="card flex flex-col items-center justify-center text-center h-full min-h-[180px] p-5 transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl hover:border-white/30 border-b border-white/10 md:border-b-0 md:border-r last:border-b-0 md:last:border-r-0 card-floating-particles"
              >
                <div className="flex flex-col items-center mb-2">
                  <span className="mb-2 interactive-element">
                    {i === 0 && <SpeedIcon width={32} height={32} className="text-orange-500" />}
                    {i === 1 && <PaintIcon width={32} height={32} className="text-orange-500" />}
                    {i === 2 && <SecurityIcon width={32} height={32} className="text-orange-500" />}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1 leading-tight">{b.title}</h3>
                </div>
                <p className="text-base text-white/80 leading-snug">{b.desc}</p>
              </article>
            </FloatingElement>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-stretch">
          <LazySection threshold={0.2}>
            <div className="card space-y-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 lg:p-9 pr-1 sm:pr-0 text-base shadow-[0_22px_80px_rgba(0,0,0,0.28)]">
              <AutoStepper steps={steps} />
            </div>
          </LazySection>
          <div className="card space-y-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 lg:p-9 pr-1 sm:pr-0 text-base shadow-[0_22px_80px_rgba(0,0,0,0.28)] h-full min-h-[260px] flex flex-col card-ripple">
            <h2 className="text-lg font-semibold">Metodos de pago (en sitio)</h2>
            <p className="text-sm text-white/70">
              Pagas al finalizar el servicio en el local. Elige el metodo que prefieras.
            </p>
            <div className="flex flex-wrap gap-2">
              {payments.map((p, index) => (
                <FloatingElement key={p} delay={index * 0.2}>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 hover:border-white/40 hover:bg-white/10 transition-all duration-200 interactive-element">
                    {p}
                  </span>
                </FloatingElement>
              ))}
            </div>
            <div className="text-xs text-white/60">Confirma tu cita y lleva el vehiculo a la hora acordada.</div>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
