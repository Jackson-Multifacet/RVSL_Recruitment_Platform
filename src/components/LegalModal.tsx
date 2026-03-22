import * as React from 'react';
import { X, Shield, FileText, Scale, Copyright } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'privacy' | 'terms' | 'licenses';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  if (!isOpen) return null;

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms & Conditions', icon: Scale },
    { id: 'licenses', label: 'Licenses', icon: Copyright },
  ] as const;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Legal Information</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Real Value & Stakes Limited</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id 
                  ? 'text-orange-600' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-950/30">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                <p className="text-slate-600 dark:text-slate-400">Last Updated: March 18, 2026</p>
                
                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">1. Introduction</h4>
                  <p>Real Value & Stakes Limited ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our recruitment platform.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">2. Information We Collect</h4>
                  <p>We collect information that you provide directly to us, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Personal Identification:</strong> Name, email address, phone number, and physical address.</li>
                    <li><strong>Professional Information:</strong> CVs, resumes, employment history, skills, and qualifications.</li>
                    <li><strong>Company Information:</strong> Company name, contact person, and recruitment requirements for clients.</li>
                    <li><strong>Authentication Data:</strong> Login credentials provided via Google Authentication.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">3. How We Use Your Information</h4>
                  <p>We use the collected information for various purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>To facilitate the recruitment process between candidates and clients.</li>
                    <li>To provide and maintain our platform's functionality.</li>
                    <li>To communicate with you regarding applications, job alerts, and platform updates.</li>
                    <li>To improve our services and user experience.</li>
                    <li>To comply with legal obligations.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">4. Data Security</h4>
                  <p>We implement robust security measures, including encryption and secure database rules, to protect your personal data. However, no method of transmission over the internet is 100% secure.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">5. Your Rights</h4>
                  <p>You have the right to access, correct, or delete your personal information. You can manage your profile settings within the dashboard or contact us for assistance.</p>
                </section>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Terms & Conditions</h3>
                <p className="text-slate-600 dark:text-slate-400">Last Updated: March 18, 2026</p>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h4>
                  <p>By accessing or using the Real Value & Stakes platform, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">2. User Accounts</h4>
                  <p>Users are responsible for maintaining the confidentiality of their accounts and for all activities that occur under their accounts. You must notify us immediately of any unauthorized use.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">3. Recruitment Services</h4>
                  <p>Our platform acts as a facilitator for recruitment. We do not guarantee employment for candidates or the suitability of candidates for clients. All hiring decisions are the sole responsibility of the respective parties.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">4. Prohibited Conduct</h4>
                  <p>Users agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide false or misleading information.</li>
                    <li>Interfere with the platform's security or functionality.</li>
                    <li>Use the platform for any illegal or unauthorized purpose.</li>
                    <li>Harass or harm other users.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">5. Limitation of Liability</h4>
                  <p>Real Value & Stakes Limited shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform.</p>
                </section>
              </div>
            )}

            {activeTab === 'licenses' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Licenses & Attributions</h3>
                
                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Software License</h4>
                  <p>The Real Value & Stakes platform is a proprietary software developed by Real Value & Stakes Limited. All rights reserved.</p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Open Source Attributions</h4>
                  <p>We leverage several open-source libraries to provide a high-quality experience:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>React:</strong> Licensed under the MIT License.</li>
                    <li><strong>Tailwind CSS:</strong> Licensed under the MIT License.</li>
                    <li><strong>Lucide React:</strong> Licensed under the ISC License.</li>
                    <li><strong>Firebase SDK:</strong> Licensed under the Apache License 2.0.</li>
                    <li><strong>Motion:</strong> Licensed under the MIT License.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Assets</h4>
                  <p>Icons provided by Lucide. Images provided by Unsplash and Picsum Photos under their respective licenses.</p>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
