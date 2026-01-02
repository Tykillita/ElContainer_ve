import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

type UserRole = 'admin' | 'it' | 'cliente';

export default function ProtectedRoute({ redirectTo = '/', allowedRoles }: { redirectTo?: string; allowedRoles?: UserRole[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white text-center py-10">Cargando...</div>;
  if (!user) return <Navigate to={redirectTo} replace />;
  const role = (user.user_metadata?.rol as UserRole) ?? 'cliente';
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}
