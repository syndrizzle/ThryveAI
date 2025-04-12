import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

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
            className="min-h-screen bg-slate-950 text-white relative overflow-hidden"
        >
            {/* Gradient Background Elements */}
            <div className="absolute -top-20 sm:-top-40 -left-20 sm:-left-40 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-purple-500/30 blur-3xl" />
            <div className="absolute top-1/2 -translate-y-1/2 -right-20 sm:-right-40 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute bottom-20 sm:bottom-40 left-20 sm:left-40 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-sky-500/30 blur-3xl" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 space-y-12">
                <div className="space-y-4 text-center">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent font-heading">
                        Welcome to Thryve
                    </h1>
                    <p className="text-neutral-300 text-lg sm:text-xl max-w-sm mx-auto">
                        Your AI-powered health companion. Sign in to start your journey towards better preventive healthcare.
                    </p>
                </div>
                
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-neutral-900/80 backdrop-blur-sm border border-white/10 text-white rounded-xl font-medium hover:border-white/20 hover:bg-neutral-800/80 transition-all duration-200"
                >
                    <img src="/google.svg" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                </motion.button>

                <p className="text-neutral-400 text-sm max-w-sm mx-auto text-center">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </motion.div>
    );
} 