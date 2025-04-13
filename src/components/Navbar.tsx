import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatedButton } from './AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const { user, signIn, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
            setIsOpen(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-24 flex items-center justify-center z-50" ref={menuRef}>
            <nav className="flex items-center gap-4 px-6 py-3 rounded-full bg-neutral-950/50 backdrop-blur-lg border border-white/10 justify-center flex-row">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="ThryveAI" className="w-8 h-8" />
                    <span className="text-lg font-semibold">ThryveAI</span>
                </Link>
                
                <div className="w-px h-6 bg-white/10 mx-2" />
                
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative flex justify-center">
                            <button 
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
                            >
                                {user.user_metadata.avatar_url ? (
                                    <img 
                                        src={user.user_metadata.avatar_url} 
                                        alt={user.user_metadata.full_name || 'User'} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-medium">
                                        {(user.user_metadata.full_name || user.email || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 10 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-neutral-950/50 backdrop-blur-lg border border-white/10 shadow-2xl overflow-hidden"
                                    >
                                        <div className="p-1.5">
                                            <button
                                                onClick={() => {
                                                    navigate('/profile');
                                                    setIsOpen(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-neutral-300 hover:bg-white/5 rounded-xl transition-colors text-left text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>View Profile</span>
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-neutral-300 hover:bg-white/5 rounded-xl transition-colors text-left text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <AnimatedButton onClick={signIn}>
                            <span className="text-sm">Get Started</span>
                        </AnimatedButton>
                    )}
                </div>
            </nav>
        </header>
    );
}
