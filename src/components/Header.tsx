
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../resources/svg/elcontainer_vector.svg';

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/reservas', label: 'Reservas' },
  { to: '/blog', label: 'Blog' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();
  const delayStep = 70;

  const linkClass = (to: string) =>
    `hover:text-white transition-all duration-200 ${location.pathname === to ? 'text-white font-medium' : 'text-white/80'}`;

  const itemClass = (to: string) =>
    `${linkClass(to)} w-full text-right rounded-lg px-3 py-2 transition-all duration-200 hover:bg-white/10 active:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 ${
      location.pathname === to ? 'bg-white/10 text-white font-medium' : 'text-white/80'
    }`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuOpen) return;
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (!menuOpen) return;
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 w-full z-30 py-2 bg-transparent">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative flex items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2 shadow-[0_5px_30px_rgba(0,0,0,0.3)] backdrop-blur-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white min-w-0 flex-1">
            <img 
              src={logo}
              alt="El Container"
              className="header-logo"
            />
            <span className="hidden md:inline text-sm whitespace-nowrap">EL CONTAINER</span>
            <span className="md:hidden text-xs whitespace-nowrap">EL CONTAINER</span>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-5 text-xs uppercase tracking-[0.08em] md:flex">
            {navItems.map((item) => (
              <Link 
                key={item.to} 
                to={item.to} 
                className={`${linkClass(item.to)} relative px-2 py-1 transition-all duration-200`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                {location.pathname === item.to && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full"></span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.08em] flex-shrink-0">
            <Link 
              to="/onboarding" 
              className={`${linkClass('/onboarding')} hidden md:inline px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-xs border border-white/20`} 
              onClick={() => setMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
            <button
              className="group flex h-8 w-8 items-center justify-center text-white transition-all duration-200 hover:bg-white/10 rounded-lg md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              ref={toggleRef}
              aria-label="Abrir menu"
            >
              <span className="relative block h-5 w-5">
                <span
                  className="absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-200 ease-in-out"
                  style={{
                    top: menuOpen ? '50%' : '25%',
                    transform: menuOpen ? 'translateY(-50%) rotate(45deg)' : 'translateY(0) rotate(0deg)',
                    opacity: 1,
                    transitionDelay: menuOpen ? '0ms' : '100ms'
                  }}
                ></span>
                <span
                  className="absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-200 ease-in-out"
                  style={{
                    top: '50%',
                    transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)',
                    opacity: menuOpen ? 0 : 1,
                    transitionDelay: menuOpen ? '50ms' : '50ms'
                  }}
                ></span>
                <span
                  className="absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-200 ease-in-out"
                  style={{
                    top: menuOpen ? '50%' : '75%',
                    transform: menuOpen ? 'translateY(-50%) rotate(-45deg)' : 'translateY(0) rotate(0deg)',
                    opacity: 1,
                    transitionDelay: menuOpen ? '100ms' : '0ms'
                  }}
                ></span>
              </span>
            </button>
          </div>

          <div
            ref={menuRef}
            className={`absolute right-2 top-[calc(100%+0.5rem)] w-48 rounded-xl border border-white/20 bg-black/80 p-3 text-xs uppercase tracking-[0.08em] text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-lg transition-all duration-200 ease-out origin-top-right ${
              menuOpen ? 'pointer-events-auto opacity-100 scale-100 translate-y-0' : 'pointer-events-none opacity-0 scale-95 -translate-y-2'
            }`}
            style={{ backgroundColor: 'rgba(10, 10, 15, 0.9)' }}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/05 via-white/02 to-transparent pointer-events-none" />
            <div className="relative flex flex-col gap-1.5">
              {navItems.map((item, idx) => {
                const delay = menuOpen ? idx * delayStep : (navItems.length - 1 - idx) * delayStep;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`${itemClass(item.to)} transform transition-all duration-200 ease-out ${
                      menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}
                    style={{ transitionDelay: `${delay}ms` }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-2 mt-1 border-t border-white/10">
                <Link 
                  to="/onboarding" 
                  className="w-full text-right rounded-lg px-3 py-2 text-white/80 hover:bg-white/15 transition-all duration-200 block"
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
