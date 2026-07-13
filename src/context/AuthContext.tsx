
/* eslint-disable react-refresh/only-export-components */

import { useEffect, useState, ReactNode, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebaseClient';
import { AuthContext, type AppUser } from './AuthContextContext';

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

// Construye el AppUser combinando Firebase Auth + doc profiles/{uid}
async function hydrateUser(fbUser: FirebaseUser | null): Promise<AppUser | null> {
  if (!fbUser) return null;
  let profile: Record<string, any> = {};
  try {
    const snap = await getDoc(doc(db, 'profiles', fbUser.uid));
    if (snap.exists()) profile = snap.data();
  } catch {
    // Sin perfil aún: usamos defaults
  }
  const role = (profile.role as UserRole) ?? 'cliente';
  return {
    id: fbUser.uid,
    email: fbUser.email ?? undefined,
    created_at: fbUser.metadata.creationTime,
    user_metadata: {
      ...profile,
      rol: role,
      role,
      avatar_url: resolveAvatarUrl(profile),
      avatar_icon: profile.avatar_icon ?? 'default',
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (e: unknown) => {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    if (e && typeof e === 'object' && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
      return (e as { message: string }).message;
    }
    return 'Error de autenticación';
  };

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hydrated = await hydrateUser(auth.currentUser);
      setUser(hydrated);
      if (hydrated) localStorage.setItem('auth_user', JSON.stringify(hydrated));
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sesión cacheada para primer render rápido
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
    // Firebase restaura la sesión de forma asíncrona
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      const hydrated = await hydrateUser(fbUser);
      setUser(hydrated);
      if (hydrated) localStorage.setItem('auth_user', JSON.stringify(hydrated));
      else localStorage.removeItem('auth_user');
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const hydrated = await hydrateUser(cred.user);
      setUser(hydrated);
      if (remember && hydrated) localStorage.setItem('auth_user', JSON.stringify(hydrated));
      else localStorage.removeItem('auth_user');
      setLoading(false);
      return true;
    } catch (e: unknown) {
      setError(getErrorMessage(e));
      setLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, extra?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const meta = { avatar_icon: 'default', rol: 'cliente', ...(extra || {}) } as Record<string, any>;
      const profile = {
        email,
        full_name: meta.full_name ?? ([meta.nombre, meta.apellido].filter(Boolean).join(' ').trim() || null),
        nombre: meta.nombre ?? null,
        apellido: meta.apellido ?? null,
        phone: meta.telefono ?? meta.phone ?? null,
        role: 'cliente',
        avatar_icon: meta.avatar_icon,
        created_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
      };
      await setDoc(doc(db, 'profiles', cred.user.uid), profile, { merge: true });
      const hydrated = await hydrateUser(cred.user);
      setUser(hydrated);
      if (hydrated) localStorage.setItem('auth_user', JSON.stringify(hydrated));
      setLoading(false);
      return { success: true };
    } catch (e: unknown) {
      setError('Error de registro');
      setLoading(false);
      return { success: false, error: getErrorMessage(e) || 'Error de registro' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
