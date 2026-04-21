/**
 * Reusable Button Component
 * Variants: primary, secondary, outline, ghost
 * Sizes: xs, sm, md, lg, xl
 */

import React from 'react';
import { TOKENS } from '../../theme/tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
  };

  const sizes = {
    xs: TOKENS.size.button.xs,
    sm: TOKENS.size.button.sm,
    md: TOKENS.size.button.md,
    lg: TOKENS.size.button.lg,
    xl: TOKENS.size.button.xl,
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {leftIcon && !isLoading && leftIcon}
      {isLoading && (
        <span className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent w-5 h-5" />
      )}
      {children}
      {rightIcon && !isLoading && rightIcon}
    </button>
  );
}
