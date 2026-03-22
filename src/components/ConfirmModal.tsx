import * as React from 'react';
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'success' | 'info';
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = 'danger' 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
          type === 'danger' ? 'bg-red-100 text-red-600' : 
          type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
          'bg-blue-100 text-blue-600'
        }`}>
          {type === 'danger' ? <Trash2 className="w-8 h-8" /> : 
           type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : 
           <AlertCircle className="w-8 h-8" />}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-4 text-white rounded-2xl font-bold transition-all shadow-lg ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 
              type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 
              'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
