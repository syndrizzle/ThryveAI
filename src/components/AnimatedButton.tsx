import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
    onClick?: () => void;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export function AnimatedButton({ 
    onClick, 
    children, 
    className = '', 
    disabled = false,
    type = 'button'
}: AnimatedButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={`group relative p-[1px] rounded-xl overflow-hidden animate-border disabled:animate-none disabled:cursor-not-allowed [background:linear-gradient(45deg,transparent,theme(colors.neutral.900)_40%,transparent)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.neutral.600/.3)_10%,theme(colors.white)_30%,theme(colors.neutral.600/.3))_border-box] disabled:[background:linear-gradient(45deg,transparent,theme(colors.neutral.900)_40%,transparent)_padding-box,theme(colors.neutral.800/50)_border-box] before:absolute before:inset-0 before:p-[1px] before:rounded-xl before:mask-gradient ${className}`}
        >
            <div className="relative flex items-center gap-3 px-6 py-3 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 rounded-xl backdrop-blur-sm text-white font-medium transition-colors group-disabled:opacity-50">
                {children}
            </div>
        </motion.button>
    );
}
