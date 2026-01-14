
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import elcontainerLogo from '../../public/elcontainer_vector.svg';
import { useAuth } from '../context/useAuth';
import { resolveAvatarUrl, DEFAULT_AVATAR_URL } from '../context/AuthContext';
import { UserRound } from 'lucide-react';
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  ReceiptText,
  ClipboardList,
  Users,
  CalendarDays,
  User2,
  LogOut,
  ShieldCheck
} from 'lucide-react';

type UserRole = 'admin' | 'it' | 'cliente';

const sidebarItems: Array<{ label: string; icon: React.ReactNode; path: string; roles: UserRole[] }> = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard', roles: ['admin', 'it'] },
  { label: 'Lavados', icon: <Sparkles className="w-5 h-5" />, path: '/lavados', roles: ['admin', 'it'] },
  { label: 'Progreso', icon: <TrendingUp className="w-5 h-5" />, path: '/progreso', roles: ['admin', 'it'] },
  { label: 'Planes', icon: <ReceiptText className="w-5 h-5" />, path: '/planes', roles: ['admin', 'it'] },
  { label: 'Clientes', icon: <Users className="w-5 h-5" />, path: '/clientes', roles: ['admin', 'it'] },
  { label: 'Calendario', icon: <CalendarDays className="w-5 h-5" />, path: '/calendario', roles: ['admin', 'it'] },
  { label: 'Admin Panel', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin-panel', roles: ['admin', 'it'] },
  { label: 'Cuenta', icon: <User2 className="w-5 h-5" />, path: '/cuenta', roles: ['admin', 'it'] },
  // Cliente: link to client pages
  { label: 'Mi Panel', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard', roles: ['cliente'] },
  { label: 'Mi Progreso', icon: <TrendingUp className="w-5 h-5" />, path: '/progreso', roles: ['cliente'] },
  { label: 'Mis Planes', icon: <ReceiptText className="w-5 h-5" />, path: '/planes', roles: ['cliente'] },
  { label: 'Mis Reservas', icon: <ClipboardList className="w-5 h-5" />, path: '/mis-reservas', roles: ['cliente'] },
  { label: 'Calendario', icon: <CalendarDays className="w-5 h-5" />, path: '/calendario', roles: ['cliente'] },
  { label: 'Cuenta', icon: <User2 className="w-5 h-5" />, path: '/cuenta', roles: ['cliente'] },
];


export default function Sidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const meta = user?.user_metadata || {};
  const userName = meta.full_name || [meta.nombre, meta.apellido].filter(Boolean).join(' ').trim() || meta.nombre || user?.email || 'Usuario';
  const userRole = (user?.user_metadata?.rol as UserRole | undefined) || 'cliente';
  const roleLabel: Record<UserRole, string> = { admin: 'Admin', it: 'IT', cliente: 'Cliente' };
  const avatarUrl = resolveAvatarUrl(user?.user_metadata as unknown as { avatar_url?: string | null; picture?: string | null });
  const isDefaultAvatar = avatarUrl === DEFAULT_AVATAR_URL;
  return (
    <aside
      className={`fixed top-0 left-0 z-40 bg-black/95 text-white h-screen flex flex-col border-r border-white/10 shadow-xl transition-all duration-300 ${expanded ? 'w-[220px] min-w-[220px]' : 'w-[100px] min-w-[100px]'}`}
      style={{ height: '100vh' }}
    >
      {/* Logo y nombre solo en expandido */}
      {expanded && (
        <div className="flex flex-col items-center pt-8 pb-2 border-b border-white/10">
          <div className="w-16 h-16 flex items-center justify-center mb-2">
            <img
              src={elcontainerLogo}
              alt="El Container Logo"
              className="w-14 h-14 object-contain drop-shadow-xl"
              draggable={false}
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">ElContainer</span>
          <span className="text-xs text-white/60 -mt-1 mb-2">Autolavado</span>
          {/* Botón collapse/expand debajo del título */}
          <div className="flex items-center justify-center w-full mt-2 mb-2">
            <button
              onClick={onToggle}
              className="hover:text-orange-400 transition-colors duration-200"
              aria-label={expanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="ml-3 text-white/80 font-medium text-base select-none">Colapsar</span>
          </div>
        </div>
      )}
      {/* Botón collapse/expand en colapsado */}
      {!expanded && (
        <>
          <div className="flex items-center justify-center w-full pt-6 pb-8">
            <button
              onClick={onToggle}
              className="hover:text-orange-400 transition-colors duration-200"
              aria-label="Expandir sidebar"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="border-b border-white/10 w-full mb-0" />
        </>
      )}
      {/* Navegación */}
      <nav className={`flex-1 ${expanded ? 'px-2 py-6' : 'pt-0 pb-6 mt-3'}`}>
        <ul className="space-y-1">
          {sidebarItems
            .filter(item => item.roles.includes(userRole))
            .map(item => (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${expanded ? 'gap-4 px-3 py-3 justify-start' : 'justify-center py-4'} rounded-lg font-medium transition-colors hover:bg-orange-600/20 text-white/90` +
                    (isActive ? ' bg-orange-900/30' : '')
                  }
                  end={userRole === 'cliente'}
                >
                  <span className="w-6 h-6 flex items-center justify-center">{item.icon}</span>
                  {expanded && <span className="text-base">{item.label}</span>}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
      {/* Usuario y logout solo en expandido, solo avatar en colapsado */}
      {expanded ? (
        <div className="mt-auto border-t border-white/10 px-4 py-6 flex flex-col">
          <div className="flex items-center gap-3 justify-center">
            <div className="rounded-full w-9 h-9 border-2 border-orange-400 shadow bg-transparent flex items-center justify-center overflow-hidden">
              {isDefaultAvatar ? (
                <UserRound size={14} color="#fff" strokeWidth={2.2} />
              ) : (
                <img src={avatarUrl} alt="avatar" className="object-cover w-full h-full" />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-white text-sm leading-tight">{userName}</span>
              <span className="text-xs text-white/60">{roleLabel[userRole]}</span>
            </div>
          </div>
          <button
            className="flex items-center gap-2 mt-4 text-red-500 hover:text-red-600 font-semibold text-sm group justify-center self-center"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full mt-auto mb-4">
          <div className="border-t border-white/10 w-full mb-5" />
          <div className="rounded-full w-9 h-9 border-2 border-orange-400 shadow bg-transparent flex items-center justify-center overflow-hidden">
            {isDefaultAvatar ? (
              <UserRound size={14} color="#fff" strokeWidth={2.2} />
            ) : (
              <img src={avatarUrl} alt="avatar" className="object-cover w-full h-full" />
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
