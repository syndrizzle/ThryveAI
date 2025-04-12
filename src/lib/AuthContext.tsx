import { useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { auth, supabase } from './supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const checkOnboarding = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('phone_number')
                .eq('user_id', userId)
                .single();

            if (error || !data?.phone_number) {
                setNeedsOnboarding(true);
                if (location.pathname !== '/onboarding') {
                    navigate('/onboarding');
                }
            } else {
                setNeedsOnboarding(false);
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
        }
    }, [location.pathname, navigate]);

    useEffect(() => {
        // Check for initial user
        auth.getCurrentUser()
            .then((currentUser) => {
                setUser(currentUser);
                if (currentUser) {
                    checkOnboarding(currentUser.id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        // Subscribe to auth changes
        const unsubscribe = auth.onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                checkOnboarding(user.id);
            }
        });

        return () => {
            unsubscribe.data.subscription.unsubscribe();
        };
    }, [checkOnboarding]);

    const signIn = async () => {
        try {
            await auth.signInWithGoogle();
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setNeedsOnboarding(false);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
        needsOnboarding
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 