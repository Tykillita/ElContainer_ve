import React, { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  ReceiptText,
  TrendingUp,
  CalendarDays,
  User2
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Planes', path: '/planes', icon: <ReceiptText className="w-5 h-5" /> },
  { label: 'Progreso', path: '/progreso', icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Calendario', path: '/calendario', icon: <CalendarDays className="w-5 h-5" /> },
  { label: 'Cuenta', path: '/cuenta', icon: <User2 className="w-5 h-5" /> },
] as const;

const COLLAPSED_WIDTH = 58;
const EXPANDED_WIDTH = 148;

export default function DockBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const railRef = useRef<HTMLDivElement | null>(null);

  const activePath = useMemo(() => {
    const found = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
    return found?.path ?? '/dashboard';
  }, [pathname]);

  const selectPath = (path: string) => {
    if (path !== activePath) navigate(path);
  };


  const displayedPath = activePath;


  // Animación más fluida y responsiva en móvil
  const dockStyle = useMemo(() => ({
    '--dock-anim-duration': window.innerWidth < 769 ? '340ms' : '220ms'
  } as React.CSSProperties), []);

  return (
    <div className="dock-shell dock-allow-animations" style={dockStyle}>
      <motion.div
        ref={railRef}
        className="dock-bar"
        transition={{
          type: 'spring',
          stiffness: window.innerWidth < 769 ? 180 : 260,
          damping: window.innerWidth < 769 ? 18 : 24,
          mass: 0.7
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = displayedPath === item.path;
          return (
              <motion.button
                key={item.path}
                layout
                type="button"
                className={`dock-item ${isActive ? 'dock-item-active' : ''}`}
                style={{
                  justifyContent: isActive ? 'flex-start' : 'center',
                  paddingInline: isActive ? 18 : 10,
                  gap: isActive ? 10 : 0
                }}
                onClick={() => selectPath(item.path)}
                animate={{
                  width: isActive ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0)',
                  borderColor: isActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
                  color: '#e8edf7',
                }}
                whileTap={{ scale: 0.97 }}
                transition={{
                  layout: { duration: 0.32, ease: [0.22, 0.61, 0.36, 1] },
                  default: { type: 'spring', stiffness: 220, damping: 22, mass: 0.8 }
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className="dock-icon">{item.icon}</span>
                {/* El texto solo se renderiza cuando el botón está expandido completamente */}
                {isActive && (
                  <motion.span
                    className="dock-label"
                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -6, scale: 0.95 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ display: 'inline-flex', overflow: 'hidden' }}
                  >
                    {item.label.split('').map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.12 + i * 0.03,
                          duration: 0.22,
                          ease: [0.22, 0.61, 0.36, 1]
                        }}
                        style={{ display: 'inline-block' }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.span>
                )}
              </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
