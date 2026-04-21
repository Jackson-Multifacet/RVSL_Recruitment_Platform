import * as React from 'react';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  deleteField
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Client, Message, Update } from '../types';
import { PendingDeletionOverlay } from './PendingDeletionOverlay';
import {
  Building2,
  Users,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Search,
  Briefcase,
  FileText,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  Trash2,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { ChatManager } from './ChatManager';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { ConfirmModal } from './ConfirmModal';
import { PageLoadingSpinner, ErrorState } from './ui/LoadingSpinner';
import { useUser, useErrorHandler } from '../utils/hooks';

export default function ClientDashboard({ user: userProp }: { user?: any } = {}) {
  const { user: contextUser } = useUser(); // NEW: Get user from context
  const { handleFirestoreError } = useErrorHandler();
  const currentUser = userProp || contextUser; // Fallback to context if no prop
  
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'candidates' | 'profile'>('overview');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      if (!currentUser) return;
      await updateDoc(doc(db, 'clients', currentUser.uid || currentUser.id), {
        deletionRequestedAt: new Date().toISOString()
      });
      setIsConfirmModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, 'update_client_deletion_request');
    }
  };

  const handleCancelDeletion = async () => {
    try {
      if (!currentUser) return;
      await updateDoc(doc(db, 'clients', currentUser.uid || currentUser.id), {
        deletionRequestedAt: deleteField()
      });
    } catch (error) {
      handleFirestoreError(error, 'cancel_deletion_request');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      const clientDoc = await getDoc(doc(db, 'clients', currentUser.uid || currentUser.id));
      if (clientDoc.exists()) {
        setClientProfile({ id: clientDoc.id, ...clientDoc.data() } as Client);
        if (clientDoc.data().assignedAgentId) {
          setSelectedStaffId(clientDoc.data().assignedAgentId);
        }
      }

      const staffSnapshot = await getDocs(collection(db, 'staff'));
      setStaffList(staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <PageLoadingSpinner />;
  }

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
        activeTab === id
          ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-bold text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {clientProfile?.deletionRequestedAt && (
        <PendingDeletionOverlay
          deletionRequestedAt={clientProfile.deletionRequestedAt}
          onCancel={handleCancelDeletion}
        />
      )}
      {}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 hidden md:flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-orange-600 font-display">RVSL Client</span>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem id="overview" icon={Building2} label="Overview" />
          <SidebarItem id="candidates" icon={Users} label="Our Candidates" />
          <SidebarItem id="messages" icon={MessageSquare} label="Messages" />
          <SidebarItem id="profile" icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto">
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Welcome, {clientProfile?.companyName}</h1>
                <p className="text-slate-500">Manage your recruitment needs and communicate with your agent.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Hires</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">12</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Requests</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">3</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">New Messages</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Your Assigned Agent</h2>
              {selectedStaffId ? (
                <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                    {staffList.find(s => s.id === selectedStaffId)?.fullName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {staffList.find(s => s.id === selectedStaffId)?.fullName}
                    </h3>
                    <p className="text-slate-500">Recruitment Specialist</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
                  No agent assigned yet. Please contact support.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Communication Center</h2>
            <ChatManager
              currentUserId={currentUser.uid || currentUser.id}
              userRole="client"
              preSelectedContactId={selectedStaffId || undefined}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Company Profile</h2>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
              <div className="flex flex-col items-center gap-4">
                <ProfilePhotoUpload
                  userId={currentUser.uid || currentUser.id}
                  collectionName="clients"
                  currentPhotoUrl={clientProfile?.photoUrl}
                  onUploadSuccess={(url) => setClientProfile(prev => prev ? { ...prev, photoUrl: url } : null)}
                />
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{clientProfile?.companyName}</h3>
                  <p className="text-slate-500">Client Account</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</label>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-medium">
                    {clientProfile?.contactPerson}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-medium">
                    {clientProfile?.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-medium">
                    {clientProfile?.phone}
                  </div>
                </div>
              </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-100 dark:border-red-900/20">
                    <h4 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h4>
                    <p className="text-xs text-red-500/70 mb-4">Request account deletion. Your company profile will be permanently removed after a 14-day review period.</p>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Request Deletion
                    </button>
                  </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="space-y-8">
             <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Our Candidates</h2>
                <p className="text-slate-500">View candidates assigned to your recruitment needs.</p>
              </div>
            </div>
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No candidates currently assigned to your open positions.</p>
            </div>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Request Account Deletion?"
        message="Your company profile will be scheduled for deletion in 14 days. During this period, you will be unable to use the dashboard. You can cancel this request at any time."
        onConfirm={confirmDeleteAccount}
        onCancel={() => setIsConfirmModalOpen(false)}
        type="danger"
        confirmText="Request Deletion"
      />
    </div>
  );
}
