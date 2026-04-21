import * as React from 'react';
import { useState, useEffect } from 'react';
import { Newspaper, User, ChevronRight } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';

export function UpdatesFeed() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const updatesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUpdates(updatesList);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'updates');
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  if (loading) return null;
  if (updates.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
          <div className="p-3 sm:p-4 bg-orange-600 rounded-2xl sm:rounded-3xl text-white shadow-2xl shadow-orange-600/30 flex-shrink-0">
            <Newspaper className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">RVSL Updates</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">The latest from our recruitment network</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {updates.map(update => (
          <div key={update.id} className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
            {update.mediaUrl && (
              <div className="h-40 sm:h-48 md:h-56 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                <img
                  src={update.mediaUrl}
                  alt={update.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )}
            <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 md:mb-6">
                <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap
                  ${update.type === 'Vacancy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                    update.type === 'Article' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' :
                    'bg-orange-600 text-white shadow-lg shadow-orange-600/20'}`}>
                  {update.type}
                </span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  {new Date(update.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4 leading-tight group-hover:text-orange-600 transition-colors">
                {update.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 line-clamp-2 sm:line-clamp-3 mb-4 md:mb-8 leading-relaxed text-xs sm:text-sm">
                {update.content}
              </p>

              <div className="mt-auto pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">RVSL Team</span>
                </div>
                <button type="button" className="text-orange-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2 group/btn focus:outline-none focus:ring-2 focus:ring-orange-500 whitespace-nowrap justify-start sm:justify-end">
                  <span className="hidden sm:inline">Read Full</span>
                  <span className="sm:hidden">Read</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
