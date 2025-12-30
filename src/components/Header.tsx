
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
    <header className="fixed top-0 left-0 w-full z-30 py-3 bg-transparent">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex items-center justify-between gap-5 rounded-2xl border border-white/15 bg-white/5 px-5 sm:px-6 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white min-w-0">
            <img 
              src={logo}
              alt="El Container"
              className="header-logo"
            />
            <span className="hidden md:inline text-base whitespace-nowrap">EL CONTAINER</span>
            <span className="md:hidden text-xs whitespace-nowrap">EL CONTAINER</span>
          </div>

          <nav className="hidden items-center justify-center gap-6 text-sm uppercase tracking-[0.08em] md:flex flex-1">
            {navItems.map((item) => (
              <Link 
                key={item.to} 
                to={item.to} 
                className={`${linkClass(item.to)} relative px-3 py-2 transition-all duration-200`}
                onClick={() => {
                  setMenuOpen(false);
                  setTimeout(() => { window.scrollTo(0, 0); }, 0);
                }}
              >
                {item.label}
                {location.pathname === item.to && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full"></span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-sm uppercase tracking-[0.08em]">
            <Link 
              to="/login" 
              className={`${linkClass('/login')} hidden md:inline px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition-all duration-200 border border-white/25`} 
              onClick={() => {
                setMenuOpen(false);
                setTimeout(() => { window.scrollTo(0, 0); }, 0);
              }}
            >
              Iniciar sesión
            </Link>
            <button
              className="group flex h-10 w-10 items-center justify-center text-white transition-all duration-200 hover:bg-white/15 rounded-xl md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              ref={toggleRef}
              aria-label="Abrir menu"
            >
              <span className="relative block h-6 w-6">
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
            className={`absolute right-3 top-[calc(100%+0.75rem)] w-52 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm uppercase tracking-[0.08em] text-white shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-lg transition-all duration-200 ease-out origin-top-right ${
              menuOpen ? 'pointer-events-auto opacity-100 scale-100 translate-y-0' : 'pointer-events-none opacity-0 scale-95 -translate-y-2'
            }`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/05 via-white/02 to-transparent pointer-events-none" />
            <div className="relative flex flex-col gap-2">
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
                    onClick={() => {
                      setMenuOpen(false);
                      setTimeout(() => { window.scrollTo(0, 0); }, 0);
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-3 mt-2 border-t border-white/15">
                <Link 
                  to="/login" 
                  className="w-full text-right rounded-xl px-4 py-3 text-white/85 hover:bg-white/20 transition-all duration-200 block"
                  onClick={() => {
                    setMenuOpen(false);
                    setTimeout(() => { window.scrollTo(0, 0); }, 0);
                  }}
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
