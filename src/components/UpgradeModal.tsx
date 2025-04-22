import { motion, AnimatePresence } from 'framer-motion';
import { X, RocketLaunch } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from './AnimatedButton';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const navigate = useNavigate();

    const handleUpgradeClick = () => {
        onClose();
        navigate('/pricing');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[100] p-4"
                    onClick={onClose} // Close on backdrop click
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="bg-neutral-900/80 border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                    >
                        <button 
                            onClick={onClose} 
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="p-4 bg-zinc-400/10 rounded-full">
                                <RocketLaunch size={48} weight="duotone" className="text-zinc-200" />
                            </div>
                            <h2 className="text-2xl font-heading font-medium text-white">Upgrade Required</h2>
                            <p className="text-neutral-300">
                                Access to AI Health Assessments is a premium feature. Please upgrade your plan to continue.
                            </p>
                            <AnimatedButton onClick={handleUpgradeClick} className="w-full sm:w-auto">
                                View Premium Plans
                            </AnimatedButton>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
