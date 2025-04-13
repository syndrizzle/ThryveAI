import Spline from '@splinetool/react-spline';
import { ReactNode } from 'react';

interface SplineBackgroundProps {
    children?: ReactNode;
    className?: string;
}

export function SplineBackground({ children, className = '' }: SplineBackgroundProps) {
    return (
        <div className="relative min-h-screen w-full">
            {/* Spline Background */}
            <div className="fixed inset-0 z-0">
                <Spline scene="https://prod.spline.design/kbdxW06LZQz6VInE/scene.splinecode" />
            </div>
            
            {/* Content */}
            <div className={`relative z-10 ${className}`}>
                {children}
            </div>
        </div>
    );
} 