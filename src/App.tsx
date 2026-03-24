import * as React from 'react';
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, getRedirectResult, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';
import { LogOut, Sun, Moon } from 'lucide-react';
import { Hero } from './components/Hero';
import { JobFeed } from './components/JobFeed';
import { StaffDashboard } from './components/StaffDashboard';
import ClientDashboard from './components/ClientDashboard';
import { CandidateDashboard } from './components/CandidateDashboard';
import RegistrationForm from './components/RegistrationForm';
import { RealAssistant } from './components/RealAssistant';
import { ClientContact } from './components/ClientContact';
import { Newsletter } from './components/Newsletter';
import { UpdatesFeed } from './components/UpdatesFeed';
import { LegalModal } from './components/LegalModal';
import { LoginModal } from './components/LoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'licenses'>('privacy');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const staffDoc = await getDoc(doc(db, 'staff', user.uid));
        if (staffDoc.exists() || user.email === 'faithjohnjackson@gmail.com') {
          setIsStaff(true);
        } else {
          const clientDoc = await getDoc(doc(db, 'clients', user.uid));
          if (clientDoc.exists()) {
            setIsClient(true);
          } else {
            const candidateDoc = await getDoc(doc(db, 'candidates', user.uid));
            if (candidateDoc.exists()) {
              setHasRegistered(true);
            }
          }
        }
      } else {
        setUser(null);
        setIsStaff(false);
        setIsClient(false);
        setHasRegistered(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getRedirectResult(auth).catch((error: any) => {
      console.error('Redirect login failed:', error);
      if (error.code !== 'auth/cancelled-popup-request') {
        setLoginError('Authentication failed. Please try again.');
      }
    });
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Toaster position="top-right" />
        
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 overflow-hidden flex items-center justify-center p-1.5">
                <img src="/logo.png" alt="RVSL Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-orange-600 font-display">RVSL</span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {loginError && (
                <div className="absolute top-full right-0 mt-2 p-2 bg-red-100 text-red-700 text-xs rounded border border-red-200 z-50 w-64">
                  {loginError}
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold">{user.displayName || user.email}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                      {isStaff ? 'Internal Staff' : 'Candidate'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        <main>
          {!user ? (
            <>
              <Hero onLogin={() => setIsLoginModalOpen(true)} />
              <UpdatesFeed />
              <JobFeed />
              <ClientContact />
              <Newsletter />
            </>
          ) : isStaff ? (
            <StaffDashboard user={user} />
          ) : isClient ? (
            <ClientDashboard user={user} />
          ) : hasRegistered ? (
            <CandidateDashboard user={user} />
          ) : (
            <RegistrationForm />
          )}
        </main>

        <RealAssistant />

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 overflow-hidden flex items-center justify-center p-1.5">
                  <img src="/logo.png" alt="RVSL Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-xl tracking-tight text-orange-600 font-display">Real Value & Stakes</span>
              </div>

              <div className="flex flex-wrap justify-center gap-8">
                <button
                  onClick={() => { setLegalTab('privacy'); setIsLegalModalOpen(true); }}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 transition-colors font-medium"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => { setLegalTab('terms'); setIsLegalModalOpen(true); }}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 transition-colors font-medium"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => { setLegalTab('licenses'); setIsLegalModalOpen(true); }}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 transition-colors font-medium"
                >
                  Licenses
                </button>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                © 2026 Real Value & Stakes Limited.
              </p>
            </div>
          </div>
        </footer>

        <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        <LegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalTab}
        />
      </div>
    </ErrorBoundary>
  );
}
