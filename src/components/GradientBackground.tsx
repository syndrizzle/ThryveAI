import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  className,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Gradient Background Elements */}
      <div className="fixed -top-20 sm:-top-40 -left-20 sm:-left-40 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="fixed top-1/2 -translate-y-1/2 -right-20 sm:-right-40 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="fixed bottom-20 sm:bottom-40 left-20 sm:left-40 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-sky-500/30 blur-3xl" />

      {/* Content */}
      <div className={cn("relative z-10", className)}>
        {children}
      </div>
    </div>
  );
}; 