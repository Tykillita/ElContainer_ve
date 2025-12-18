import logo from '../resources/img/elcontainer_logo.png'
import Stepper, { Step } from '../components/Stepper'

export default function Onboarding() {
  return (
    <section className="container-shell py-12">
      <Stepper
        header={
          <div className="grid items-start gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-4 md:pr-6">
              <p className="text-sm uppercase tracking-[0.22em] text-white/60">Onboarding</p>
              <h1 className="text-4xl font-semibold leading-tight">Crea tu cuenta y empieza</h1>
              <p className="max-w-2xl text-base text-white/70">
                Completa los pasos para configurar tu espacio. El fondo react-three cubre toda la pagina y esta tarjeta
                se apoya sobre el efecto.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-white/70">
                <span className="rounded-full border border-white/20 px-3 py-1">1. Datos basicos</span>
                <span className="rounded-full border border-white/20 px-3 py-1">2. Verificacion</span>
                <span className="rounded-full border border-white/20 px-3 py-1">3. Preferencias</span>
              </div>
            </div>
            <img
              src={logo}
              alt="Logo Autolavado"
              className="justify-self-end h-40 w-auto opacity-95 drop-shadow-xl md:h-60"
            />
          </div>
        }
        initialStep={1}
        className="step-card-root mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 shadow-2xl backdrop-blur"
        stepCircleContainerClassName="step-card-container"
        stepContainerClassName="step-inline-row"
        contentClassName="step-inline-content"
        footerClassName="step-inline-footer"
      >
        <Step>
          <div className="space-y-5">
            <div className="space-y-2 text-lg text-white/80">
              <h3 className="text-lg font-semibold text-white">Datos basicos</h3>
              <p>Completa tu nombre y correo para empezar el registro.</p>
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-lg text-white/80">
                  <span>Nombre</span>
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-base outline-none ring-0 focus:border-white/40"
                    placeholder="Nombre"
                  />
                </label>
                <label className="space-y-1 text-lg text-white/80">
                  <span>Apellido</span>
                  <input
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-base outline-none ring-0 focus:border-white/40"
                    placeholder="Apellido"
                  />
                </label>
              </div>
              <label className="space-y-1 text-lg text-white/80">
                <span>Email</span>
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-base outline-none ring-0 focus:border-white/40"
                  type="email"
                  placeholder="tu@email.com"
                />
              </label>
              <label className="space-y-1 text-lg text-white/80">
                <span>Contraseña</span>
                <input
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-base outline-none ring-0 focus:border-white/40"
                  type="password"
                  placeholder="••••••••"
                />
              </label>
              <p className="text-sm text-white/60">Puedes regresar y editar tus datos mas adelante.</p>
            </div>
          </div>
        </Step>
        <Step>
          <div className="space-y-3 text-lg text-white/80">
            <h3 className="text-lg font-semibold text-white">Verificacion</h3>
            <p>Validaremos tu identidad y enviaremos un codigo de seguridad a tu correo para confirmar el registro.</p>
          </div>
        </Step>
        <Step>
          <div className="space-y-3 text-lg text-white/80">
            <h3 className="text-lg font-semibold text-white">Preferencias</h3>
            <p>Configura notificaciones y preferencias de contacto para recibir alertas y recordatorios.</p>
          </div>
        </Step>
        <Step>
          <div className="space-y-3 text-lg text-white/80">
            <h3 className="text-lg font-semibold text-white">Confirmacion</h3>
            <p>Revisa tu informacion y confirma para finalizar.</p>
          </div>
        </Step>
      </Stepper>
    </section>
  )
}
