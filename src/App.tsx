import * as React from 'react';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { LogOut, Sun, Moon, Menu, X, Home, Briefcase, Bell, Phone, Mail, UserPlus } from 'lucide-react';
import { UserProvider, useUser, useIsStaff, useIsCandidate, useAuth } from './context/UserContext';
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

type PageType = 'home' | 'jobs' | 'updates' | 'contact' | 'newsletter' | 'register';

const MENU_ITEMS: { id: PageType; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'jobs', label: 'Browse Jobs', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'updates', label: 'Updates', icon: <Bell className="w-5 h-5" /> },
  { id: 'contact', label: 'Contact Us', icon: <Phone className="w-5 h-5" /> },
  { id: 'newsletter', label: 'Newsletter', icon: <Mail className="w-5 h-5" /> },
  { id: 'register', label: 'Register', icon: <UserPlus className="w-5 h-5" /> },
];

function AppContent() {
  const { user, logout, isLoading } = useUser();
  const isStaff = useIsStaff();
  const isCandidate = useIsCandidate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'licenses'>('privacy');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize theme from localStorage or system preference
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col lg:flex-row">
        <Toaster position="top-right" />
        
        {/* DESKTOP SIDEBAR */}
        {!user && (
          <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
            {/* Sidebar Header */}
            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
                <div className="w-10 h-10 overflow-hidden flex items-center justify-center p-1">
                  <img src="/logo.png" alt="RVSL Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-orange-600 font-display">RVSL</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Recruitment</span>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {MENU_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={toggleTheme}
                className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {theme === 'light' ? (
                  <><Moon className="w-4 h-4" /> Dark Mode</>
                ) : (
                  <><Sun className="w-4 h-4" /> Light Mode</>
                )}
              </button>
            </div>
          </aside>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">
          {/* HEADER for Mobile */}
          <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
            <div className="px-4 h-16 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}>
                <div className="w-10 h-10 overflow-hidden flex items-center justify-center p-1">
                  <img src="/logo.png" alt="RVSL Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-lg tracking-tight text-orange-600 font-display">RVSL</span>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Toggle Theme"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>

                {user ? (
                  <button
                    onClick={logout}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="hidden sm:block px-3 py-2 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="sm:hidden p-2 text-slate-600 dark:text-slate-400"
                    >
                      {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Drawer Menu */}
            {!user && isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/30 z-30 sm:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Drawer */}
                <div className="fixed top-16 left-0 right-0 max-w-sm w-[80vw] max-h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 overflow-y-auto sm:hidden">
                  <nav className="p-4 space-y-2">
                    {MENU_ITEMS.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setCurrentPage(item.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          currentPage === item.id
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.icon}
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                      className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                      Login
                    </button>
                  </nav>
                </div>
              </>
            )}
          </header>

          {/* Page Content */}
          <main className="flex-1">
            {!user ? (
              <>
                {currentPage === 'home' && <Hero onLogin={() => setIsLoginModalOpen(true)} />}
                {currentPage === 'jobs' && <JobFeed />}
                {currentPage === 'updates' && <UpdatesFeed />}
                {currentPage === 'contact' && <ClientContact />}
                {currentPage === 'newsletter' && <Newsletter />}
                {currentPage === 'register' && <RegistrationForm />}
              </>
            ) : isStaff ? (
              <StaffDashboard />
            ) : isCandidate ? (
              <CandidateDashboard />
            ) : (
              <ClientDashboard />
            )}
          </main>

          <RealAssistant />

          {/* FOOTER */}
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
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
        </div>

        {/* Modals */}
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

/**
 * App - Root component with UserProvider
 * Wraps entire app to provide user context
 */
export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
