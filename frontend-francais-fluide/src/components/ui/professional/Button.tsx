// src/components/ui/professional/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  loading = false,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  const variantClasses = {
    primary:
      'bg-gradient-to-b from-accent-500 to-accent-600 text-white hover:brightness-105 active:brightness-95',
    secondary:
      'bg-white/80 text-gray-700 border border-gray-300/70 hover:bg-white/90 backdrop-blur-sm',
    ghost: 'text-gray-700 hover:bg-gray-100/80',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-full',
    md: 'px-4 py-2 text-sm rounded-full',
    lg: 'px-6 py-3 text-base rounded-full',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'loading',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="mr-2 size-4 animate-spin rounded-full border-2 border-transparent border-t-white/90" />
      ) : null}
      {children}
    </button>
  );
};
