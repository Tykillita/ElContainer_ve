export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 text-white text-sm">
      <div className="container-shell mx-auto px-4">
        {/* Top row: logo, nav, social */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-5 gap-4">
          <div className="flex items-center gap-2">
            <img src="/public/resources/img/lanyard/logo.png" alt="El Container Logo" className="w-7 h-7 object-contain bg-white rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="font-bold tracking-wide text-base">El Container</span>
          </div>
          <nav className="flex flex-wrap gap-6 font-medium text-white/80">
            <a href="/" className="hover:text-white transition-colors">Inicio</a>
            <a href="/servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="/contacto" className="hover:text-white transition-colors">Contacto</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/584127181873" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5 hover:scale-110 transition-transform" />
            </a>
            <a href="mailto:elcontainervzla@gmail.com" aria-label="Gmail">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png" alt="Gmail" className="w-5 h-5 hover:scale-110 transition-transform" />
            </a>
            <a href="https://instagram.com/elcontainer_ve" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="w-5 h-5 hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
        <hr className="border-white/10" />
        {/* Bottom row: copyright and policies */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-2 text-xs text-white/40">
          <span>© 2024-{new Date().getFullYear()} El Container. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <a href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</a>
            <a href="/terminos" className="hover:text-white transition-colors">Términos &amp; Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
