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
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-600 rounded-3xl text-white shadow-2xl shadow-orange-600/30">
            <Newspaper className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">RVSL Updates</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">The latest from our recruitment network</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {updates.map(update => (
          <div key={update.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
            {update.mediaUrl && (
              <div className="h-56 overflow-hidden relative">
                <img
                  src={update.mediaUrl}
                  alt={update.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )}
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]
                  ${update.type === 'Vacancy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                    update.type === 'Article' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' :
                    'bg-orange-600 text-white shadow-lg shadow-orange-600/20'}`}>
                  {update.type}
                </span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  {new Date(update.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-orange-600 transition-colors">
                {update.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-8 leading-relaxed text-sm">
                {update.content}
              </p>

              <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">RVSL Team</span>
                </div>
                <button className="text-orange-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2 group/btn">
                  Read Full <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
