export default function Contact() {
  return (
    <section className="container-shell space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.12em] text-white/50">Contacto</p>
        <h1 className="text-3xl font-semibold leading-tight">Encuéntranos y agenda</h1>
        <p className="max-w-2xl mx-auto text-sm text-white/70">
          Estamos listos para atenderte. Escríbenos por WhatsApp o visita el local en horario extendido.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-0">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Horario */}
            <div className="card bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 items-start shadow-[0_22px_80px_rgba(0,0,0,0.18)] w-full md:w-1/2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span className="font-semibold text-white">Horario</span>
              </div>
              <span className="text-white/80 text-sm">Lunes a Sábado</span>
              <span className="text-white/80 text-sm">8:00 AM a 8:00 PM</span>
              <span className="text-white/80 text-sm">Domingos 10:00 AM a 6:00 PM</span>
            </div>
            {/* Dirección */}
            <div className="card bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 items-start shadow-[0_22px_80px_rgba(0,0,0,0.18)] w-full md:w-1/2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                <span className="font-semibold text-white">Dirección</span>
              </div>
              <span className="text-white/80 text-sm">MATURÍN</span>
              <span className="text-white/80 text-sm">Av. Colectora</span>
              <span className="text-white/80 text-sm">Sector Tipuro (Frente al C.C Servimas)</span>
            </div>
          </div>
          {/* Texto motivacional de contacto */}
          <div className="flex flex-col items-start text-left mt-6">
            <span className="text-xs sm:text-sm text-white/40 mb-1">¿Quieres ponerte en contacto con nosotros?</span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-4">Estamos a un click de distancia<br />de ayudarte</span>
            <div className="flex flex-col sm:flex-row gap-4 w-full mt-4 mb-6 md:mb-0">
              <a href="mailto:elcontainervzla@gmail.com" className="flex-1 card bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-white/90 font-semibold text-sm hover:bg-white/10 transition">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png" alt="Gmail" className="w-5 h-5" />
                Gmail
              </a>
              <a href="https://wa.me/584127181873" target="_blank" rel="noopener noreferrer" className="flex-1 card bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-white/90 font-semibold text-sm hover:bg-white/10 transition">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />
                WhatsApp
              </a>
              <a href="https://instagram.com/elcontainer_ve" target="_blank" rel="noopener noreferrer" className="flex-1 card bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-white/90 font-semibold text-sm hover:bg-white/10 transition">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="w-5 h-5" />
                Instagram
              </a>
            </div>
          </div>
          {/* Tarjetas de contacto eliminadas temporalmente */}
        </div>

        <div className="card space-y-3 flex flex-col items-center w-full max-w-lg mx-auto mt-6 md:mt-0">
          <h2 className="text-lg font-semibold">Mapa y acceso</h2>
          <div className="w-full aspect-[3/3.7] overflow-hidden rounded-xl bg-black/40 flex items-center justify-center">
            <iframe
              title="El Container - Mapa"
              className="w-full h-full border-0 rounded-xl"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d854.2799314276551!2d-63.20521935688477!3d9.803619791891258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c333f007a796477%3A0xed6e00b308320271!2sPaisajes%20Shaddai%20y%20Construcciones!5e1!3m2!1ses-419!2sve!4v1765755618779!5m2!1ses-419!2sve"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <p className="text-sm text-white/70">Estacionamiento disponible y zona iluminada.</p>
        </div>
      </div>
    </section>
  );
}
