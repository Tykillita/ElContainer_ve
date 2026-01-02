import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';


export interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  register: (email: string, password: string, extra?: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);