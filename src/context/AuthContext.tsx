
import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

import type { User } from '@supabase/supabase-js';
import { AuthContext } from './AuthContextContext';

import { useContext } from 'react';

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

  useEffect(() => {
    // Revisar si hay sesión guardada
    const saved = localStorage.getItem('auth_user');
    if (saved) setUser(JSON.parse(saved));
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
      setUser(data.user);
      if (remember) localStorage.setItem('auth_user', JSON.stringify(data.user));
      else localStorage.removeItem('auth_user');
      setLoading(false);
      return true;
    } catch {
      setError('Error de autenticación');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}


