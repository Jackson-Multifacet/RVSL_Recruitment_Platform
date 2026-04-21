/**
 * Reusable Card Component
 * Supports: default, interactive, glassmorphism variants
 */

import React from 'react';
import { TOKENS } from '../../theme/tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'glass';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  hover = false,
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all';

  const paddingMap = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variants = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
    interactive: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-lg',
    glass: 'backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10',
  };

  const hoverStyles = hover ? 'hover:shadow-lg hover:scale-105' : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddingMap[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
