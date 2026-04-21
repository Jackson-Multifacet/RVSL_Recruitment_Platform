import * as React from 'react';
import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { sendPasswordReset } from '../services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

/**
 * ForgotPasswordModal - For password reset flow
 * 
 * Usage:
 * ```typescript
 * const [showForgot, setShowForgot] = useState(false);
 * 
 * <ForgotPasswordModal
 *   isOpen={showForgot}
 *   onClose={() => setShowForgot(false)}
 *   onBackToLogin={() => setShowForgot(false)}
 * />
 * ```
 */
export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await sendPasswordReset(email);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setEmail('');
        setSuccess(false);
        onBackToLogin();
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          {success ? (
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We've sent a password reset link to {email}. Click the link to create a new password.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Don't see it? Check your spam folder.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Reset Password</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                        placeholder-slate-400 dark:placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium
                    hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium
                    hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
                    flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
