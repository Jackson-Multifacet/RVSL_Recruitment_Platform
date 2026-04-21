/**
 * Reusable Input Component
 * Supports: text, email, password, number, textarea
 */

import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  const sizeMap = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          className={`w-full ${sizeMap[size]} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} bg-white dark:bg-slate-900 border ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500'
          } rounded-lg outline-none focus:ring-2 transition-all ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-slate-400 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({
  label,
  error,
  className = '',
  ...props
}: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500'
        } rounded-lg outline-none focus:ring-2 transition-all res ize-none ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
