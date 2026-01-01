import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ redirectTo = '/' }: { redirectTo?: string }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white text-center py-10">Cargando...</div>;
  if (!user) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}
