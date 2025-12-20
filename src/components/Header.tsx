
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../resources/svg/elcontainer_vector.svg';

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/reservas', label: 'Reservas' },
  { to: '/blog', label: 'Blog' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/demo', label: 'Demo' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();
  const delayStep = 70;

  const linkClass = (to: string) =>
    `hover:text-white/80 transition ${location.pathname === to ? 'text-white' : 'text-white/70'}`;

  const itemClass = (to: string) =>
    `${linkClass(to)} w-full text-right rounded-lg px-3 py-2 transition-all hover:bg-white/10 active:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 ${
      location.pathname === to ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'text-white/80'
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
    <header className="fixed top-0 left-0 w-full z-30 py-2 sm:py-4 bg-transparent">
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <div className="relative flex items-center justify-between gap-2 sm:gap-4 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-6 py-2 sm:py-3 shadow-[0_10px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold tracking-tight text-white min-w-0 flex-1">
            <img 
              src={logo}
              alt="El Container"
              className="header-logo"
            />
            <span className="hidden sm:inline text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">EL CONTAINER</span>
            <span className="sm:hidden text-xs whitespace-nowrap">EL CONTAINER</span>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm uppercase tracking-[0.08em] text-white/80 md:flex">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass(item.to)} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm uppercase tracking-[0.08em] flex-shrink-0">
            <Link to="/onboarding" className={`${linkClass('/onboarding')} hidden sm:inline`} onClick={() => setMenuOpen(false)}>
              Iniciar sesion
            </Link>
            <button
              className="group flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-white transition hover:text-white md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              ref={toggleRef}
              aria-label="Abrir menu"
            >
              <span className="relative block h-5 w-6 sm:h-6 sm:w-7">
                <span
                  className="absolute left-0 block h-[2px] sm:h-[3px] w-full rounded-full bg-current transition-all duration-220 ease-out"
                  style={{
                    top: menuOpen ? '50%' : '25%',
                    transform: menuOpen ? 'translateY(-50%) rotate(45deg)' : 'translateY(0) rotate(0deg)',
                    opacity: 1,
                    transitionDelay: menuOpen ? '0ms' : '120ms'
                  }}
                ></span>
                <span
                  className="absolute left-0 block h-[2px] sm:h-[3px] w-full rounded-full bg-current transition-all duration-220 ease-out"
                  style={{
                    top: '50%',
                    transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)',
                    opacity: menuOpen ? 0 : 1,
                    transitionDelay: menuOpen ? '70ms' : '70ms'
                  }}
                ></span>
                <span
                  className="absolute left-0 block h-[2px] sm:h-[3px] w-full rounded-full bg-current transition-all duration-220 ease-out"
                  style={{
                    top: menuOpen ? '50%' : '75%',
                    transform: menuOpen ? 'translateY(-50%) rotate(-45deg)' : 'translateY(0) rotate(0deg)',
                    opacity: 1,
                    transitionDelay: menuOpen ? '140ms' : '0ms'
                  }}
                ></span>
              </span>
            </button>
          </div>

          <div
            ref={menuRef}
            className={`absolute right-2 sm:right-4 top-[calc(100%+0.5rem)] w-48 sm:w-56 rounded-xl sm:rounded-2xl border border-white/10 bg-black/70 p-3 sm:p-3.5 text-xs sm:text-sm uppercase tracking-[0.08em] text-white/85 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-lg transition-all duration-240 ease-out origin-top-right ${
              menuOpen ? 'pointer-events-auto opacity-100 scale-100 translate-y-1' : 'pointer-events-none opacity-0 scale-95 -translate-y-2'
            }`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/04 via-white/02 to-transparent pointer-events-none" />
            <div className="relative flex flex-col gap-2">
              {navItems.map((item, idx) => {
                const delay = menuOpen ? idx * delayStep : (navItems.length - 1 - idx) * delayStep;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`${itemClass(item.to)} transform transition-all duration-220 ease-out ${
                      menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}
                    style={{ transitionDelay: `${delay}ms` }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
