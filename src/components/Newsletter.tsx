import * as React from 'react';
import { useState, useEffect } from 'react';
import { Briefcase, BookOpen, Newspaper, CheckCircle2 } from 'lucide-react';
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

  const cards = [
    {
      id: 'vacancies',
      label: 'New Vacancies',
      description: 'Get notified about latest job openings matching your profile',
      icon: Briefcase,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      borderGradient: 'from-blue-400 to-cyan-400',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      id: 'articles',
      label: 'Career Articles',
      description: 'Receive curated career tips, guides, and industry insights',
      icon: BookOpen,
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderGradient: 'from-purple-400 to-pink-400',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      id: 'news',
      label: 'Company News',
      description: 'Stay updated with company announcements and culture highlights',
      icon: Newspaper,
      gradient: 'from-amber-500/20 to-orange-500/20',
      borderGradient: 'from-amber-400 to-orange-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          const isActive = preferences[card.id];
          
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setPreferences({ ...preferences, [card.id]: !isActive })}
              className={`relative group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-2xl overflow-hidden transition-smooth ${
                isActive ? 'btn-scale' : 'hover:scale-102'
              } ${
                index === 0 ? 'fade-in' : index === 1 ? 'fade-in' : 'fade-in'
              }`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Glassmorphism Background */}
              <div className={`absolute inset-0 backdrop-blur-xl ${
                isActive 
                  ? `bg-gradient-to-br ${card.gradient} border-2 border-orange-300/30` 
                  : 'bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10'
              } transition-all duration-300`} />

              {/* Animated gradient border for active state */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-r ${card.borderGradient} rounded-2xl -z-10 blur-lg opacity-50`} />
                </div>
              )}

              {/* Content */}
              <div className="relative p-6 text-left">
                {/* Icon Container */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  isActive 
                    ? `${card.iconBg} text-white shadow-lg shadow-blue-500/20` 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className={`font-bold text-lg mb-2 transition-colors duration-300 ${
                  isActive 
                    ? 'text-slate-900 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {card.label}
                </h3>

                {/* Description */}
                <p className={`text-sm leading-relaxed mb-4 transition-colors duration-300 ${
                  isActive
                    ? 'text-slate-700 dark:text-slate-200'
                    : 'text-slate-500 dark:text-slate-500'
                }`}>
                  {card.description}
                </p>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-500'
                }`}>
                  {isActive && <CheckCircle2 className="w-4 h-4" />}
                  <span className="text-xs font-semibold">
                    {isActive ? 'Subscribed' : 'Not subscribed'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Frequency Section with Glassmorphism */}
      <div className="relative group slide-in-up">
        <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-slate-500/10 to-slate-500/5 border border-white/20 dark:border-white/10 rounded-2xl transition-smooth" />
        
        <div className="relative p-6 rounded-2xl">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 block">Notification Frequency</label>
          <div className="flex gap-3 flex-wrap">
            {['daily', 'weekly', 'monthly'].map((freq, idx) => (
              <button
                key={freq}
                type="button"
                aria-pressed={preferences.frequency === freq}
                onClick={() => setPreferences({ ...preferences, frequency: freq })}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-smooth focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  preferences.frequency === freq
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-white/20 hover:scale-102'
                }`}
                style={{
                  animationDelay: `${200 + idx * 50}ms`
                }}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="group relative w-full overflow-hidden rounded-2xl py-4 font-bold btn-scale focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
      >
        {/* Background gradient - main */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 transition-smooth group-hover:shadow-xl group-hover:shadow-orange-500/50" />
        {/* Background gradient - hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-smooth" />
        
        {/* Content */}
        <span className="relative flex items-center justify-center text-white gap-2 text-lg">
          {isSaving ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Saving...
            </>
          ) : 'Update Preferences'}
        </span>
      </button>
    </div>
  );
}
