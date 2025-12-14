import React from 'react';
import { cn } from '@/lib/utils';

export function GlassCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-xl",
        className
      )}
      {...props}
    >
      {/* Optional: Noise texture or gradient overlay could go here */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
      {children}
    </div>
  );
}

