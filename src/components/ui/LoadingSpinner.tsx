import * as React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * LoadingSpinner - Multiple size options for loading indicators
 * Usage: <LoadingSpinner size="default" />
 */
export const LoadingSpinner: React.FC<{ size?: 'small' | 'default' | 'large' }> = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-orange-600`} />
    </div>
  );
};

/**
 * PageLoadingSpinner - Full-page loading state
 * Usage: <PageLoadingSpinner />
 */
export const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="text-center">
      <LoadingSpinner size="large" />
      <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg">Loading...</p>
    </div>
  </div>
);

/**
 * SkeletonLoader - Placeholder for content that's loading
 * Usage: <SkeletonLoader count={5} height="h-24" />
 */
export const SkeletonLoader: React.FC<{ count?: number; height?: string }> = ({ count = 3, height = 'h-24' }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${height} bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse`} />
    ))}
  </div>
);

/**
 * ErrorState - Display error with retry option
 * Usage: <ErrorState message="Failed to load" onRetry={() => window.location.reload()} />
 */
export const ErrorState: React.FC<{ 
  message?: string; 
  title?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ 
  message = 'Something went wrong. Please try again.',
  title = 'Error',
  onRetry,
  showRetry = true
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-8 text-center max-w-md">
      <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">{title}</h2>
      <p className="text-red-600 dark:text-red-300 mb-6">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

/**
 * EmptyState - Display when data is empty
 * Usage: <EmptyState icon={<Icon />} title="No jobs found" />
 */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="text-center">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      {message && <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  </div>
);
