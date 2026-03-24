import * as React from 'react';
import { useState, useEffect } from 'react';
import { AlertCircle, Clock, X, Trash2 } from 'lucide-react';

interface PendingDeletionOverlayProps {
  deletionRequestedAt: string;
  onCancel: () => void;
}

export const PendingDeletionOverlay: React.FC<PendingDeletionOverlayProps> = ({ deletionRequestedAt, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const requestDate = new Date(deletionRequestedAt);
      const targetDate = new Date(requestDate.getTime() + (14 * 24 * 60 * 60 * 1000));
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Review period complete. Awaiting admin confirmation.');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m remaining`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [deletionRequestedAt]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-red-100 dark:border-red-900/20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse" />

        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Trash2 className="w-10 h-10 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">Account Deletion Pending</h2>
        <p className="text-slate-500 mb-8">
          Your account is currently in a 14-day review period. All app activities are restricted until the deletion is confirmed by an admin or canceled by you.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center gap-2 text-orange-600 font-bold mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider">Time Remaining</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
            {timeLeft}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onCancel}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel Deletion Request
          </button>
          <p className="text-[10px] text-slate-400 italic">
            Canceling will immediately restore full access to your account.
          </p>
        </div>
      </div>
    </div>
  );
};
