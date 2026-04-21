/**
 * Badge Component - For status, tags, labels
 */

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const sizeMap = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizeMap[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
