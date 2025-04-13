import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { GoogleLogo } from '@phosphor-icons/react';
import { AnimatedButton } from '../components/AnimatedButton';

export default function Login() {
    const { user, signIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleGoogleSignIn = async () => {
        try {
            await signIn();
        } catch (error) {
            console.error('Error signing in:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 space-y-8"
        >                
            <div className="space-y-4 text-center">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading py-4 overflow-hidden font-medium">
                    Welcome to ThryveAI
                </h1>
                <p className="text-neutral-300 text-lg sm:text-xl mx-auto">
                    Your AI-powered health companion. Sign in to start your journey towards better preventive healthcare.
                </p>
            </div>
            
            <AnimatedButton onClick={handleGoogleSignIn}>
                <GoogleLogo 
                    size={20} 
                    weight="bold"
                    className="text-white group-hover:text-white/90 transition-colors" 
                />
                <span className="font-semibold">Continue with Google</span>
            </AnimatedButton>

            <p className="text-neutral-400 text-sm mx-auto text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
        </motion.div>
    );
}