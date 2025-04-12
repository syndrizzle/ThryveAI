import { createContext } from 'react';
import { User } from '@supabase/supabase-js';

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    needsOnboarding: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 