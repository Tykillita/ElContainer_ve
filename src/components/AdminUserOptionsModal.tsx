import { UserCog, BadgeDollarSign, History, Trash2, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  joined: string;
  avatar?: string | null;
  phone?: string;
  location?: string;
  bio?: string;
};

interface AdminUserOptionsModalProps {
  open: boolean;
  onClose: () => void;
  user: AdminUser;
  onChangeRole: (role: string) => void | Promise<void>;
  onAssignPlan: (planId: string) => void | Promise<void>;
  onViewHistory: () => void;
  onDelete: () => void;
  viewerRole?: string;
}


export const AdminUserOptionsModal: React.FC<AdminUserOptionsModalProps & { plans?: { id: string, name: string }[] }> = ({
  open,
  onClose,
  user,
  onChangeRole,
  onAssignPlan,
  onViewHistory,
  onDelete,
  viewerRole,
  plans = [],
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const isAdminViewer = viewerRole === 'admin';
  const showRoleControls = !isAdminViewer;
  const showDelete = !isAdminViewer;
  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'it', label: 'IT' },
    { value: 'cliente', label: 'Cliente' },
  ];

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl shadow-2xl px-7 py-8 w-full max-w-xs animate-fadeIn relative border border-zinc-700">
        <button
          className="absolute top-3 right-3 text-zinc-400 hover:text-orange-400 transition text-2xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="flex flex-col items-center gap-2 mb-7">
          <div className="w-20 h-20 rounded-full border-4 border-orange-400 shadow-lg overflow-hidden bg-zinc-900">
            <img src={user.avatar || '/default-avatar.png'} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-xl font-bold text-white mt-2">{user.name}</div>
          <div className="text-xs text-zinc-400">{user.email}</div>
        </div>
        <div className="flex flex-col gap-3">
          {showRoleControls && (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-orange-500/80 text-white font-semibold transition shadow border border-zinc-700 group justify-between"
              >
                <span className="flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-orange-300 group-hover:text-white transition" />
                  Cambiar rol
                </span>
                <span className="flex items-center gap-1 text-xs text-orange-200 bg-zinc-900/60 px-2 py-1 rounded-full border border-orange-400/30">
                  {roles.find(r => r.value === user.role)?.label || user.role}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </span>
              </button>
              {showRoleMenu && (
                <ul className="absolute left-0 mt-2 w-full rounded-xl bg-black/95 border border-white/10 shadow-lg z-20 overflow-hidden animate-fade-in">
                  {roles.map(opt => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-2 hover:bg-orange-500/10 ${user.role === opt.value ? 'font-bold bg-white/10 text-orange-400' : 'text-white'}`}
                        onClick={() => { setShowRoleMenu(false); onChangeRole(opt.value); }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setShowPlanMenu((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-orange-500/80 text-white font-semibold transition shadow border border-zinc-700 group justify-between"
            >
              <span className="flex items-center gap-2">
                <BadgeDollarSign className="w-5 h-5 text-orange-300 group-hover:text-white transition" />
                Asignar plan
              </span>
              <span className="flex items-center gap-1 text-xs text-orange-200 bg-zinc-900/60 px-2 py-1 rounded-full border border-orange-400/30">
                {user.plan || 'Sin plan'}
                <ChevronDown className="w-4 h-4 ml-1" />
              </span>
            </button>
            {showPlanMenu && (
              <ul className="absolute left-0 mt-2 w-full rounded-xl bg-black/95 border border-white/10 shadow-lg z-20 overflow-hidden animate-fade-in">
                <li>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 hover:bg-orange-500/10 ${!user.plan ? 'font-bold bg-white/10 text-orange-400' : 'text-white'}`}
                    onClick={() => { setShowPlanMenu(false); onAssignPlan(''); }}
                  >
                    Sin plan
                  </button>
                </li>
                {plans.map(opt => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-2 hover:bg-orange-500/10 ${user.plan === opt.id ? 'font-bold bg-white/10 text-orange-400' : 'text-white'}`}
                      onClick={() => { setShowPlanMenu(false); onAssignPlan(opt.id); }}
                    >
                      {opt.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={onViewHistory} className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-orange-500/80 text-white font-semibold transition shadow border border-zinc-700 group">
            <History className="w-5 h-5 text-orange-300 group-hover:text-white transition" />
            Historial de lavados
          </button>
          {showDelete && (
            <button onClick={onDelete} className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow border border-red-700 group">
              <Trash2 className="w-5 h-5 text-white group-hover:text-orange-100 transition" />
              Eliminar cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
