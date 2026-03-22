import * as React from 'react';
import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, XCircle } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

interface NewsletterProps {
  userEmail?: string;
  initialPreferences?: any;
}

export function Newsletter({ userEmail = '', initialPreferences = null }: NewsletterProps) {
  const [preferences, setPreferences] = useState(initialPreferences || {
    vacancies: true,
    articles: true,
    news: true,
    frequency: 'daily'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialPreferences) {
      setPreferences(initialPreferences);
    }
  }, [initialPreferences]);

  const handleSave = async () => {
    if (!userEmail) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'newsletter', userEmail), {
        email: userEmail,
        preferences,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Newsletter error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'vacancies', label: 'New Vacancies', icon: Bell },
          { id: 'articles', label: 'Career Articles', icon: Bell },
          { id: 'news', label: 'Company News', icon: Bell }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setPreferences({ ...preferences, [item.id]: !preferences[item.id] })}
            className={`p-6 rounded-3xl border-2 transition-all text-left group ${
              preferences[item.id] 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' 
                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
              preferences[item.id] ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              {preferences[item.id] ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <span className={`font-bold ${preferences[item.id] ? 'text-orange-600' : 'text-slate-500'}`}>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Notification Frequency</label>
        <div className="flex gap-4">
          {['daily', 'weekly', 'monthly'].map(freq => (
            <button 
              key={freq}
              onClick={() => setPreferences({ ...preferences, frequency: freq })}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                preferences.frequency === freq 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Update Preferences'}
      </button>
    </div>
  );
}
