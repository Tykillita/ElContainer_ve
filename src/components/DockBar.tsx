import React, { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  const [dragPreviewPath, setDragPreviewPath] = useState<string | null>(null);

  const activePath = useMemo(() => {
    const found = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
    return found?.path ?? '/dashboard';
  }, [pathname]);

  const selectPath = (path: string) => {
    if (path !== activePath) navigate(path);
  };

  const pickIndexFromX = (clientX: number) => {
    const rail = railRef.current;
    if (!rail) return null;
    const rect = rail.getBoundingClientRect();
    const clampedX = Math.max(rect.left, Math.min(rect.right, clientX));
    const relative = clampedX - rect.left;
    const slot = rect.width / NAV_ITEMS.length;
    const index = Math.min(NAV_ITEMS.length - 1, Math.max(0, Math.floor(relative / slot)));
    return index;
  };

  const displayedPath = dragPreviewPath ?? activePath;

  const updatePreviewFromPoint = (clientX: number) => {
    const idx = pickIndexFromX(clientX);
    if (idx != null) {
      const path = NAV_ITEMS[idx].path;
      if (path !== dragPreviewPath) setDragPreviewPath(path);
    }
  };

  const dockStyle = useMemo(() => ({
    '--dock-anim-duration': '260ms'
  } as React.CSSProperties), []);

  return (
    <div className="dock-shell dock-allow-animations" style={dockStyle}>
      <motion.div
        ref={railRef}
        className="dock-bar"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={(event, info) => updatePreviewFromPoint(info.point.x)}
        onDrag={(event, info) => updatePreviewFromPoint(info.point.x)}
        onDragEnd={(event, info) => {
          const idx = pickIndexFromX(info.point.x);
          const targetPath = idx != null ? NAV_ITEMS[idx].path : activePath;
          setDragPreviewPath(null);
          selectPath(targetPath);
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
                backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderColor: isActive ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
                color: '#e8edf7',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{
                layout: { duration: 0.26, ease: [0.22, 0.61, 0.36, 1] },
                default: { type: 'spring', stiffness: 260, damping: 24, mass: 0.8 }
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className="dock-icon">{item.icon}</span>
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    className="dock-label"
                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -6, scale: 0.95 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
