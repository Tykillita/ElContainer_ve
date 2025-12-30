
import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

import type { User } from '@supabase/supabase-js';
import { AuthContext } from './AuthContextContext';

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


