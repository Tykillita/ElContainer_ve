import { useEffect, useRef, useState } from 'react'
import logo from '../resources/svg/elcontainer_vector.svg'

type Page = 'home' | 'services' | 'booking' | 'blog' | 'contact' | 'onboarding' | 'demo'

interface HeaderProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const delayStep = 70
  const navItems: Array<{ page: Page; label: string }> = [
    { page: 'home', label: 'Inicio' },
    { page: 'services', label: 'Servicios' },
    { page: 'booking', label: 'Reservas' },
    { page: 'blog', label: 'Blog' },
    { page: 'contact', label: 'Contacto' },
    { page: 'demo', label: 'Demo' }
  ]

  const linkClass = (page: Page) =>
    `hover:text-white/80 transition ${currentPage === page ? 'text-white' : 'text-white/70'}`

  const itemClass = (page: Page) =>
    `${linkClass(page)} w-full text-right rounded-lg px-3 py-2 transition-all hover:bg-white/10 active:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 ${
      currentPage === page ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'text-white/80'
    }`

  const handleNav = (page: Page) => {
    onNavigate(page)
    setMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuOpen) return
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      if (toggleRef.current?.contains(target)) return
      setMenuOpen(false)
    }

    const handleKey = (event: KeyboardEvent) => {
      if (!menuOpen) return
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  return (
    <header className="fixed top-0 left-0 w-full z-30 py-4 bg-transparent">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 shadow-[0_10px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
            <img src={logo} alt="El Container" className="h-10 w-auto drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]" />
            <span>EL CONTAINER</span>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm uppercase tracking-[0.08em] text-white/80 md:flex">
            {navItems.map((item) => (
              <button key={item.page} className={linkClass(item.page)} onClick={() => handleNav(item.page)}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.08em]">
            <button className={linkClass('onboarding')} onClick={() => handleNav('onboarding')}>
              Iniciar sesion
            </button>
            <button
              className="group flex h-10 w-10 items-center justify-center text-white transition hover:text-white md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              ref={toggleRef}
              aria-label="Abrir menu"
            >
              <span className="relative block h-6 w-7">
                <span
                  className="absolute left-0 block h-[3px] w-full rounded-full bg-current transition-all duration-220 ease-out"
                  style={{
                    top: '9px',
                    transform: menuOpen ? 'translateY(-7px) scaleX(1)' : 'translateY(0) scaleX(1)',
                    opacity: 1,
                    transitionDelay: menuOpen ? '0ms' : '120ms'
                  }}
                ></span>
                <span
                  className="absolute left-0 block h-[3px] w-full rounded-full bg-current transition-all duration-220 ease-out"
                  style={{
                    top: '9px',
                    transform: menuOpen ? 'translateY(2px) scaleX(1)' : 'translateY(0) scaleX(0.65)',
                    opacity: menuOpen ? 1 : 0,
                    transitionDelay: menuOpen ? '70ms' : '70ms'
                  }}
                ></span>
                <span
                  className="absolute left-0 block h-[3px] w-full rounded-full bg-current transition-all duration-220 ease-out"
                  style={{
                    top: '9px',
                    transform: menuOpen ? 'translateY(11px) scaleX(1)' : 'translateY(0) scaleX(0.65)',
                    opacity: menuOpen ? 1 : 0,
                    transitionDelay: menuOpen ? '140ms' : '0ms'
                  }}
                ></span>
              </span>
            </button>
          </div>

          <div
            ref={menuRef}
            className={`absolute right-4 top-[calc(100%+0.5rem)] w-56 rounded-2xl border border-white/10 bg-black/70 p-3.5 text-sm uppercase tracking-[0.08em] text-white/85 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-lg transition-all duration-240 ease-out origin-top-right ${
              menuOpen ? 'pointer-events-auto opacity-100 scale-100 translate-y-1' : 'pointer-events-none opacity-0 scale-95 -translate-y-2'
            }`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/04 via-white/02 to-transparent pointer-events-none" />
            <div className="relative flex flex-col gap-2">
              {navItems.map((item, idx) => {
                const delay = menuOpen ? idx * delayStep : (navItems.length - 1 - idx) * delayStep
                return (
                  <button
                    key={item.page}
                    className={`${itemClass(item.page)} transform transition-all duration-220 ease-out ${
                      menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}
                    style={{ transitionDelay: `${delay}ms` }}
                    onClick={() => handleNav(item.page)}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
