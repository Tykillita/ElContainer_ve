import { createContext } from 'react';

// Forma compatible con el antiguo User de Supabase: las vistas leen
// user.id, user.email y user.user_metadata.*; ahora user_metadata se
// hidrata desde el doc profiles/{uid} de Firestore.
export interface AppUser {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata: Record<string, any>;
}

export interface AuthContextValue {
  user: AppUser | null;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  register: (email: string, password: string, extra?: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
