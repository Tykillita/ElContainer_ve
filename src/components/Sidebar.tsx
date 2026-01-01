
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import elcontainerLogo from '../../public/elcontainer_vector.svg';
import { useAuth } from '../context/useAuth';
import {
  DashboardIcon,
  WashIcon,
  ProgressIcon,
  PlansIcon,
  ClientsIcon,
  CalendarIcon,
  AccountIcon,
  LogoutIcon
} from './icons/SidebarIcons';

const sidebarItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Lavados', icon: <WashIcon />, path: '/lavados' },
  { label: 'Progreso', icon: <ProgressIcon />, path: '/progreso' },
  { label: 'Planes', icon: <PlansIcon />, path: '/planes' },
  { label: 'Clientes', icon: <ClientsIcon />, path: '/clientes' },
  { label: 'Calendario', icon: <CalendarIcon />, path: '/calendario' },
  { label: 'Cuenta', icon: <AccountIcon />, path: '/cuenta' },
];


export default function Sidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userName = user?.user_metadata?.nombre || user?.email || 'Usuario';
  const userRole = user?.user_metadata?.rol || 'Admin';
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
          {sidebarItems.map(item => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${expanded ? 'gap-4 px-3 py-3 justify-start' : 'justify-center py-4'} rounded-lg font-medium transition-colors hover:bg-orange-600/20 text-white/90` +
                  (isActive ? ' bg-orange-900/30' : '')
                }
                end
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
        <div className="mt-auto border-t border-white/10 px-4 py-6 flex flex-col items-center">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`}
            alt="avatar"
            className="rounded-full w-12 h-12 mb-2 border-2 border-orange-400 shadow"
          />
          <span className="font-semibold text-white text-sm leading-tight">{userName}</span>
          <span className="text-xs text-white/60 mb-2">{userRole}</span>
          <button
            className="flex items-center gap-2 mt-2 text-red-500 hover:text-red-600 font-semibold text-sm group"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            <LogoutIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full mt-auto mb-4">
          <div className="border-t border-white/10 w-full mb-5" />
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`}
            alt="avatar"
            className="rounded-full w-12 h-12 border-2 border-orange-400 shadow"
          />
        </div>
      )}
    </aside>
  );
}
