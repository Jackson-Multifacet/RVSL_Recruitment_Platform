import * as React from 'react';
import { Briefcase, ChevronRight } from 'lucide-react';

export function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
        <Briefcase className="w-3 h-3" />
        Recruitment Platform
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold font-display text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
        Your Career Journey <br />
        <span className="text-orange-600">Starts with Real Value.</span>
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
        Join the RVSL network today. We connect top talent with premium opportunities across industries. Professional, reliable, and mobile-first.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onLogin}
          className="px-12 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl hover:bg-orange-700 transition-all transform hover:-translate-y-1 flex items-center gap-2"
        >
          Get Started Now <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
