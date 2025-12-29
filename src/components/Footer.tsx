import { Link } from 'react-router-dom';
import whatsappIcon from '../resources/svg/whatsapp-128-svgrepo-com.svg';
import gmailIcon from '../resources/svg/gmail-svgrepo-com.svg';
import instagramIcon from '../resources/svg/instagram-svgrepo-com.svg';

export default function Footer() {
  return (
    <footer
      className="border-t text-white text-sm pt-10 pb-4 backdrop-blur-md rounded-xl ml-2 md:ml-4 md:mr-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', borderColor: '#b0b0b0', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="px-0 flex flex-col gap-10">


        {/* Contacto */}
        <div className="text-center mb-2">
          <h4 className="text-lg font-semibold mb-2">Contacto</h4>
          <div className="flex flex-col gap-1 text-white/80">
            <span>Teléfono: +58 412-7181873</span>
            <span>Email: <a href="mailto:elcontainervzla@gmail.com" className="underline hover:text-white">elcontainervzla@gmail.com</a></span>
            <span>Instagram: <a href="https://instagram.com/elcontainer_ve" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">@elcontainer_ve</a></span>
            <span>Ubicación: Maturín, Edo. Monagas, Venezuela</span>
          </div>
        </div>

        <hr className="border-white/10" />



        {/* Copyright */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2 pb-6 text-xs text-white/40 mb-6 w-full">
          <span className="text-sm md:text-base text-center -mb-1">© 2025 El Container. Diseñado y desarrollado por el Equipo de <span className="text-gray-300 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">El Container</span>.</span>
          <div className="flex gap-4 items-center justify-center mt-1">
            <Link to="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link to="/terminos" className="hover:text-white transition-colors">Términos & Condiciones</Link>
          </div>
          <div className="flex gap-4 items-center justify-center mt-1 mb-1">
            <a href="https://wa.me/584127181873" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <img src={whatsappIcon} alt="WhatsApp" className="w-5 h-5 hover:scale-110 transition-transform" />
            </a>
            <a href="mailto:elcontainervzla@gmail.com" aria-label="Gmail">
              <img src={gmailIcon} alt="Gmail" className="w-5 h-5 hover:scale-110 transition-transform" />
            </a>
            <a href="https://instagram.com/elcontainer_ve" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={instagramIcon} alt="Instagram" className="w-5 h-5 hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
