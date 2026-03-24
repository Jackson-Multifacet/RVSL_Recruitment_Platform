import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error && typeof parsed.error === 'string' && parsed.error.includes("Missing or insufficient permissions")) {
          displayMessage = "You don't have permission to perform this action. Please contact an administrator.";
        }
      } catch (e) {
        // Fallback to default message
      }
      return (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 my-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4 font-display">Something went wrong</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{displayMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
