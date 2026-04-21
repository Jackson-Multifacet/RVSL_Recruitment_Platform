import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Users, Briefcase, Newspaper, MessageSquare, Plus, Search, Filter,
  MoreVertical, Edit2, Trash2, CheckCircle2, XCircle, Clock,
  TrendingUp, Calendar, MapPin, DollarSign, ChevronRight, Download,
  BarChart3, PieChart as PieChartIcon, Activity, User, AlertCircle, Mail
} from 'lucide-react';
import {
  collection, query, getDocs, orderBy, limit, addDoc, updateDoc,
  doc, deleteDoc, where, getDoc, onSnapshot
} from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { toast } from 'react-hot-toast';
import { auth, db, storage } from '../firebase';
import { useUser, useErrorHandler } from '../utils/hooks';
import { sendEmail, emailTemplates } from '../services/emailService';
import { ChatManager } from './ChatManager';
import { ConfirmModal } from './ConfirmModal';
import { PageLoadingSpinner, SkeletonLoader } from './ui/LoadingSpinner';

const COLORS = ['#ea580c', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b'];

const STAGES = ['Screening', 'Interview', 'Offered', 'Placed'];

/**
 * StaffDashboard - Refactored with custom hooks
 * KEY IMPROVEMENTS:
 * - Integrated useUser hook for context-based auth (backward compatible with props)
 * - Maintains real-time subscriptions via onSnapshot
 */
export function StaffDashboard({ user: userProp }: { user?: any } = {}) {
  const { user: contextUser } = useUser(); // NEW: Get user from context
  const { handleFirestoreError } = useErrorHandler();
  const currentUser = userProp || contextUser; // Fallback to context if no prop
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'candidates' | 'jobs' | 'updates' | 'messages'>('analytics');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isAddingJob, setIsAddingJob] = useState(false);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, type: 'danger' | 'success' | 'info'}>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  useEffect(() => {

    const unsubCandidates = onSnapshot(collection(db, 'candidates'), (snapshot) => {
      setCandidates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'candidates');
    });

    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'jobs');
    });

    const unsubUpdates = onSnapshot(query(collection(db, 'updates'), orderBy('createdAt', 'desc')), (snapshot) => {
      setUpdates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'updates');
    });

    const unsubApps = onSnapshot(collection(db, 'applications'), (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'applications');
    });

    return () => {
      unsubCandidates();
      unsubJobs();
      unsubUpdates();
      unsubApps();
    };
  }, []);

  const analyticsData = useMemo(() => {
    const stageCount = STAGES.reduce((acc, stage) => {
      acc[stage] = applications.filter(app => app.status === stage).length;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(stageCount).map(([name, value]) => ({ name, value }));

    const barData = jobs.slice(0, 5).map(job => ({
      name: job.title.substring(0, 15) + '...',
      applications: applications.filter(app => app.jobId === job.id).length
    }));

    return { pieData, barData, totalCandidates: candidates.length, totalJobs: jobs.length, totalApps: applications.length };
  }, [applications, jobs, candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const fullName = `${c.name?.firstName || ''} ${c.name?.surname || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                            c.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'deletion' && c.deletionRequestedAt);
      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, filterStatus]);

  const exportToCSV = () => {
    if (filteredCandidates.length === 0) {
      toast.error('No candidates to export');
      return;
    }

    const headers = ['Full Name', 'Email', 'Phone', 'Gender', 'DOB', 'Nationality', 'State of Origin', 'LGA', 'Address', 'Status', 'Joined Date'];

    const csvContent = [
      headers.join(','),
      ...filteredCandidates.map(c => {
        const apps = applications.filter(a => a.candidateId === c.id);
        const status = apps.length > 0 ? apps[0].status : 'No Active Application';
        const joinedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';

        return [
          `"${c.fullName || c.name?.firstName + ' ' + c.name?.surname || ''}"`,
          `"${c.email || ''}"`,
          `"${c.phone || ''}"`,
          `"${c.gender || ''}"`,
          `"${c.dob || ''}"`,
          `"${c.nationality || ''}"`,
          `"${c.stateOfOrigin || ''}"`,
          `"${c.lga || ''}"`,
          `"${c.address || ''}"`,
          `"${status}"`,
          `"${joinedDate}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported successfully');
  };

  const handleUpdateAppStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applications', appId), { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);

      const app = applications.find(a => a.id === appId);
      if (app) {
        const candidate = candidates.find(c => c.id === app.candidateId);
        const job = jobs.find(j => j.id === app.jobId);

        if (candidate && candidate.email && job) {
          const template = emailTemplates.statusUpdate(
            candidate.fullName || candidate.name?.firstName || 'Candidate',
            newStatus
          );

          await sendEmail({
            to: candidate.email,
            subject: template.subject,
            html: template.html
          }).catch(err => console.error('Failed to send status update email:', err));
        }
      }
    } catch (error) {
      handleFirestoreError(error, 'update_application_status');
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <PageLoadingSpinner />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">Staff Command Center</h1>
          <p className="text-slate-500 font-medium">Manage the recruitment pipeline and platform updates</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'candidates', label: 'Talent Pool', icon: Users },
            { id: 'jobs', label: 'Vacancies', icon: Briefcase },
            { id: 'updates', label: 'Feed', icon: Newspaper },
            { id: 'messages', label: 'Inbox', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Candidates', value: analyticsData.totalCandidates, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Active Jobs', value: analyticsData.totalJobs, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Total Applications', value: analyticsData.totalApps, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Placements', value: applications.filter(a => a.status === 'Placed').length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className={`w-12 h-12 ${stat.bg} dark:bg-opacity-10 rounded-2xl flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-orange-600" /> Pipeline Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {analyticsData.pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-500">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" /> Top Jobs by Applications
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="applications" fill="#ea580c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400 ml-2" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-sm font-bold"
              >
                <option value="all">All Candidates</option>
                <option value="deletion">Pending Deletion</option>
              </select>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map(candidate => (
              <div key={candidate.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-orange-500 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt={candidate.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                      ) : (
                        <User className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {candidate.fullName}
                        {candidate.deletionRequestedAt && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full uppercase font-black">Pending Deletion</span>}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(candidate.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {candidate.address}</span>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="flex-1 max-w-xl">
                    {applications.filter(a => a.candidateId === candidate.id).map(app => (
                      <div key={app.id} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase text-slate-400">{jobs.find(j => j.id === app.jobId)?.title}</span>
                          <span className="text-[10px] font-black uppercase text-orange-600">{app.status}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {STAGES.map((stage, i) => (
                            <button
                              key={stage}
                              onClick={() => handleUpdateAppStatus(app.id, stage)}
                              className={`h-2 flex-1 rounded-full transition-all ${
                                STAGES.indexOf(app.status) >= i ? 'bg-orange-600' : 'bg-slate-100 dark:bg-slate-800'
                              } hover:opacity-80`}
                              title={`Move to ${stage}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    {applications.filter(a => a.candidateId === candidate.id).length === 0 && (
                      <p className="text-xs text-slate-400 italic">No active applications</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="animate-in zoom-in-95 duration-500">
          <ChatManager currentUserId={currentUser.uid || currentUser.id} userRole="staff" />
        </div>
      )}

      {}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
