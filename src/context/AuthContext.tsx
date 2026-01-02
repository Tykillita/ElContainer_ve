
import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

import type { User } from '@supabase/supabase-js';
import { AuthContext } from './AuthContextContext';

import { useContext } from 'react';
const DEFAULT_AVATAR_URL = 'https://api.iconify.design/lucide:user-round.svg?color=%23f97316&width=28&height=28';

export function resolveAvatarUrl(meta?: { avatar_url?: string | null; picture?: string | null }) {
  if (meta?.avatar_url) return meta.avatar_url;
  if (meta?.picture) return meta.picture;
  return DEFAULT_AVATAR_URL;
}

export { DEFAULT_AVATAR_URL };

type UserRole = 'admin' | 'it' | 'cliente';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    if (typeof window !== 'undefined') {
      // Render fallback UI if context is missing
      const fallback = document.getElementById('auth-context-fallback');
      if (!fallback) {
        const div = document.createElement('div');
        div.id = 'auth-context-fallback';
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.left = '0';
        div.style.width = '100vw';
        div.style.height = '100vh';
        div.style.background = '#1a1a1a';
        div.style.color = '#fff';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.zIndex = '9999';
        div.innerHTML = '<h1 style="font-size:2rem;margin-bottom:1rem;">Error de autenticación</h1><p>No se pudo inicializar el contexto de autenticación.<br>Por favor, recarga la página o contacta soporte.</p>';
        document.body.appendChild(div);
      }
    }
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  // Elimina el fallback si el contexto se recupera
  const fallback = typeof window !== 'undefined' ? document.getElementById('auth-context-fallback') : null;
  if (fallback) fallback.remove();
  return ctx;
}

export { AuthContext };



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveSignedAvatar = async (meta: User['user_metadata']) => {
    if (meta?.avatar_path) {
      const { data } = await supabase.storage.from('avatars').createSignedUrl(meta.avatar_path, 60 * 60 * 24 * 7); // 7 días
      if (data?.signedUrl) return data.signedUrl;
    }
    return resolveAvatarUrl(meta);
  };

  const hydrateUser = async (u: User | null) => {
    if (!u) return null;
    const avatarUrl = await resolveSignedAvatar(u.user_metadata);
    const avatarIcon = u.user_metadata?.avatar_icon ?? 'default';
    const role = (u.user_metadata?.rol as UserRole) ?? 'cliente';
    return {
      ...u,
      user_metadata: {
        ...u.user_metadata,
        avatar_url: avatarUrl,
        avatar_icon: avatarIcon,
        rol: role
      }
    } as User;
  };

  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.auth.getUser();
      if (supabaseError) throw supabaseError;
      const hydrated = await hydrateUser(data.user ?? null);
      setUser(hydrated);
      if (hydrated) localStorage.setItem('auth_user', JSON.stringify(hydrated));
    } catch (e: any) {
      setError(e?.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Revisar si hay sesión guardada
    const saved = localStorage.getItem('auth_user');
    if (saved) setUser(JSON.parse(saved));
    // Rehidratar y re-firmar al montar
    refreshUser();
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });
      if (supabaseError) {
        setError(supabaseError.message);
        setLoading(false);
        return false;
      }
      const hydrated = await hydrateUser(data.user ?? null);
      setUser(hydrated);
      if (remember && hydrated) localStorage.setItem('auth_user', JSON.stringify(hydrated));
      else localStorage.removeItem('auth_user');
      setLoading(false);
      return true;
    } catch {
      setError('Error de autenticación');
      setLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, extra?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      // Registro sin confirmación automática de email
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // No enviar email de confirmación
          data: { avatar_icon: 'default', rol: 'cliente', ...(extra || {}) },
          // @ts-ignore
          sendConfirmationEmail: false
        }
      });
      if (supabaseError) {
        setError(supabaseError.message);
        setLoading(false);
        return { success: false, error: supabaseError.message };
      }
      const hydrated = await hydrateUser(data.user ?? null);
      setUser(hydrated);
      if (hydrated) localStorage.setItem('auth_user', JSON.stringify(hydrated));
      setLoading(false);
      return { success: true };
    } catch (e: any) {
      setError('Error de registro');
      setLoading(false);
      return { success: false, error: e?.message || 'Error de registro' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}


