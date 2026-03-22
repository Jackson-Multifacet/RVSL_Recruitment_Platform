import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, MessageSquare, Bell, User, Plus, X, Settings, 
  FileText, Users, Trash2, ChevronRight, CheckCircle2, Clock, 
  AlertCircle, Search, Filter, Bookmark
} from 'lucide-react';
import { 
  doc, getDoc, getDocs, query, collection, where, orderBy, 
  limit, setDoc, updateDoc, deleteDoc, increment, addDoc, deleteField 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { ChatManager } from './ChatManager';
import { Newsletter } from './Newsletter';
import { ConfirmModal } from './ConfirmModal';
import { PendingDeletionOverlay } from './PendingDeletionOverlay';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'Screening' | 'Interview' | 'Offered' | 'Placed';
  createdAt: string;
}

interface Update {
  id: string;
  title: string;
  content: string;
  type: 'Vacancy' | 'Article' | 'News';
  mediaUrl?: string;
  createdAt: string;
  bookmarkCount?: number;
}

interface Comment {
  id: string;
  updateId: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  content: string;
  createdAt: string;
}

interface CandidateDashboardProps {
  user: any;
}

const STAGES = ['Screening', 'Interview', 'Offered', 'Placed'];

export function CandidateDashboard({ user }: CandidateDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, any>>({});
  const [updates, setUpdates] = useState<Update[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'updates' | 'profile' | 'alerts' | 'messages'>('applications');
  const [assignedAgent, setAssignedAgent] = useState<any>(null);
  const [updateFilter, setUpdateFilter] = useState<'all' | 'bookmarked'>('all');
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newsletterPrefs, setNewsletterPrefs] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, type: 'danger' | 'success' | 'info'}>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const profileDoc = await getDoc(doc(db, 'candidates', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }

        // Fetch newsletter preferences
        if (user.email) {
          const newsDoc = await getDoc(doc(db, 'newsletter', user.email));
          if (newsDoc.exists()) {
            setNewsletterPrefs(newsDoc.data().preferences);
          }
        }

        // Fetch applications
        const q = query(collection(db, 'applications'), where('candidateId', '==', user.uid));
        const appSnapshot = await getDocs(q);
        const appList = appSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setApplications(appList);

        // Fetch jobs for these applications
        const jobIds = Array.from(new Set(appList.map(app => app.jobId)));
        const jobMap: Record<string, any> = {};
        for (const jobId of jobIds) {
          const jobDoc = await getDoc(doc(db, 'jobs', jobId));
          if (jobDoc.exists()) {
            jobMap[jobId] = jobDoc.data();
          }
        }
        setJobs(jobMap);

        // Fetch updates
        const updateSnapshot = await getDocs(query(collection(db, 'updates'), orderBy('createdAt', 'desc'), limit(20)));
        const updateList = updateSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Update[];
        setUpdates(updateList);

        // Fetch user bookmarks
        const bookmarkSnapshot = await getDocs(query(collection(db, 'bookmarks'), where('userId', '==', user.uid)));
        const bookmarkMap: Record<string, boolean> = {};
        bookmarkSnapshot.docs.forEach(doc => {
          bookmarkMap[doc.data().updateId] = true;
        });
        setBookmarks(bookmarkMap);

        // Fetch assigned agent
        if (profileDoc.exists() && profileDoc.data().assignedAgentId) {
          const agentDoc = await getDoc(doc(db, 'staff', profileDoc.data().assignedAgentId));
          if (agentDoc.exists()) {
            setAssignedAgent({ id: agentDoc.id, ...agentDoc.data() });
          }
        }

      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'candidate_dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.uid]);

  const handleToggleBookmark = async (updateId: string) => {
    if (!user) return;
    const isBookmarked = bookmarks[updateId];
    const bookmarkId = `${user.uid}_${updateId}`;
    
    try {
      if (isBookmarked) {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
        await updateDoc(doc(db, 'updates', updateId), {
          bookmarkCount: increment(-1)
        });
        setBookmarks(prev => {
          const next = { ...prev };
          delete next[updateId];
          return next;
        });
        toast.success('Removed from bookmarks');
      } else {
        await setDoc(doc(db, 'bookmarks', bookmarkId), {
          userId: user.uid,
          updateId,
          createdAt: new Date().toISOString()
        });
        await updateDoc(doc(db, 'updates', updateId), {
          bookmarkCount: increment(1)
        });
        setBookmarks(prev => ({ ...prev, [updateId]: true }));
        toast.success('Added to bookmarks');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bookmarks/${bookmarkId}`);
    }
  };

  const fetchComments = async (updateId: string) => {
    try {
      const q = query(collection(db, 'updates', updateId, 'comments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const commentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
      setComments(commentList);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpdate || !newComment.trim() || !user) return;
    setIsCommenting(true);
    try {
      const commentData = {
        updateId: selectedUpdate.id,
        authorId: user.uid,
        authorName: profile?.fullName || user.displayName || 'Anonymous',
        authorPhotoUrl: profile?.photoUrl || '',
        content: newComment,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'updates', selectedUpdate.id, 'comments'), commentData);
      setComments([{ id: docRef.id, ...commentData }, ...comments]);
      setNewComment('');
      toast.success('Comment posted');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `updates/${selectedUpdate.id}/comments`);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Request Account Deletion?',
      message: 'Your account will be scheduled for deletion in 14 days. During this period, you will be unable to use the app. You can cancel this request at any time.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const userId = auth.currentUser?.uid;
          if (!userId) return;
          await updateDoc(doc(db, 'candidates', userId), {
            deletionRequestedAt: new Date().toISOString()
          });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          toast.success('Deletion request submitted');
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `candidates/${auth.currentUser?.uid}`);
        }
      }
    });
  };

  const handleCancelDeletion = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      await updateDoc(doc(db, 'candidates', userId), {
        deletionRequestedAt: deleteField()
      });
      toast.success('Deletion request cancelled');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `candidates/${auth.currentUser?.uid}`);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {profile?.deletionRequestedAt && (
        <PendingDeletionOverlay 
          deletionRequestedAt={profile.deletionRequestedAt} 
          onCancel={handleCancelDeletion} 
        />
      )}
      
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ProfilePhotoUpload userId={user.uid} collectionName="candidates" currentPhotoUrl={profile?.photoUrl} />
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Welcome, {profile?.fullName || user.displayName}</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage your applications and stay updated</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[
              { id: 'applications', label: 'Applications' },
              { id: 'updates', label: 'Updates Feed' },
              { id: 'profile', label: 'My Profile' },
              { id: 'alerts', label: 'Job Alerts' },
              { id: 'messages', label: 'Message Agent' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'messages' && (
        <div className="max-w-5xl mx-auto">
          <ChatManager currentUserId={user.uid} userRole="candidate" />
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="mb-8">
            <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Job Alert Preferences</h3>
            <p className="text-slate-500 dark:text-slate-400">Set your preferences to receive notifications about matching job opportunities.</p>
          </div>
          <Newsletter userEmail={user.email} initialPreferences={newsletterPrefs} />
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-6">You haven't applied for any jobs yet.</p>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold">Browse Jobs</button>
            </div>
          ) : (
            applications.map(app => (
              <div key={app.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider 
                        ${app.status === 'Placed' ? 'bg-emerald-100 text-emerald-700' : 
                          app.status === 'Offered' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'Interview' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                        {app.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{jobs[app.jobId]?.title || 'Unknown Job'}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {jobs[app.jobId]?.location}</div>
                      <div className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {jobs[app.jobId]?.type}</div>
                    </div>
                  </div>
                  
                  <div className="md:w-64 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latest Update</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                      {app.status === 'Screening' ? 'Your application is currently being reviewed by our team.' : 
                       app.status === 'Interview' ? 'Congratulations! You have been shortlisted for an interview.' :
                       app.status === 'Offered' ? 'An offer has been extended to you. Check your email.' :
                       app.status === 'Placed' ? 'You have successfully been placed in this role!' : 'Status updated.'}
                    </p>
                  </div>
                </div>

                {/* Candidate Progress Tracker (Stepper) */}
                <div className="relative pt-4 pb-8">
                  <div className="absolute top-8 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  <div 
                    className="absolute top-8 left-0 h-1 bg-orange-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${(STAGES.indexOf(app.status) / (STAGES.length - 1)) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {STAGES.map((stage, index) => {
                      const isCompleted = STAGES.indexOf(app.status) >= index;
                      const isCurrent = STAGES.indexOf(app.status) === index;
                      
                      return (
                        <div key={stage} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                            isCompleted ? 'bg-orange-600 text-white' : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                            isCurrent ? 'text-orange-600' : 'text-slate-400'
                          }`}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'updates' && (
        <div className="space-y-8">
          <div className="flex items-center gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
            <button 
              onClick={() => setUpdateFilter('all')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${updateFilter === 'all' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All Updates
            </button>
            <button 
              onClick={() => setUpdateFilter('bookmarked')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${updateFilter === 'bookmarked' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Saved for Later
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {updates
                .filter(u => updateFilter === 'all' || bookmarks[u.id])
                .map(update => (
              <div key={update.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                {update.mediaUrl && (
                  <div className="h-48 overflow-hidden">
                    <img src={update.mediaUrl} alt={update.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      update.type === 'Vacancy' ? 'bg-emerald-500 text-white' : 
                      update.type === 'Article' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {update.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(update.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{update.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">{update.content}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => { setSelectedUpdate(update); fetchComments(update.id); }}
                        className="flex items-center gap-1 text-slate-400 hover:text-orange-600 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-bold">Comments</span>
                      </button>
                      <button 
                        onClick={() => handleToggleBookmark(update.id)}
                        className={`flex items-center gap-1 transition-colors ${bookmarks[update.id] ? 'text-orange-600' : 'text-slate-400 hover:text-orange-600'}`}
                      >
                        <Bell className={`w-4 h-4 ${bookmarks[update.id] ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold">{update.bookmarkCount || 0}</span>
                      </button>
                    </div>
                    {update.type === 'Vacancy' && (
                      <button className="text-xs font-bold text-orange-600 hover:underline">Quick Apply</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comments Section */}
          <div className="sticky top-8 h-fit">
            {selectedUpdate ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white">Comments</h3>
                  <button onClick={() => setSelectedUpdate(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
                </div>
                
                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {comment.authorPhotoUrl ? (
                          <img src={comment.authorPhotoUrl} alt={comment.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl rounded-tl-none">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{comment.authorName}</span>
                          <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-8 text-slate-400 italic text-sm">No comments yet. Be the first!</div>
                  )}
                </div>

                <form onSubmit={handlePostComment} className="relative">
                  <textarea 
                    placeholder="Write a comment..."
                    required
                    rows={3}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                  />
                  <button 
                    type="submit"
                    disabled={isCommenting || !newComment.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-500 italic">Select an update to view and post comments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">My Profile</h3>
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-6 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-all flex items-center gap-2"
            >
              {isEditingProfile ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                const user = auth.currentUser;
                if (!user) return;
                await setDoc(doc(db, 'candidates', user.uid), {
                  ...profile,
                  updatedAt: new Date().toISOString()
                }, { merge: true });
                setIsEditingProfile(false);
                toast.success('Profile updated successfully');
              } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, `candidates/${auth.currentUser?.uid}`);
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-8">
              <div className="flex flex-col items-center gap-4 mb-8">
                <ProfilePhotoUpload userId={auth.currentUser!.uid} collectionName="candidates" currentPhotoUrl={profile?.photoUrl} />
                <p className="text-xs text-slate-400">Click to update profile photo</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={profile?.fullName || ''} 
                    onChange={e => setProfile({...profile, fullName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                  <select 
                    value={profile?.gender || ''} 
                    onChange={e => setProfile({...profile, gender: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                  <input 
                    type="date" 
                    value={profile?.dob || ''} 
                    onChange={e => setProfile({...profile, dob: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nationality</label>
                  <input 
                    type="text" 
                    value={profile?.nationality || ''} 
                    onChange={e => setProfile({...profile, nationality: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marital Status</label>
                  <select 
                    value={profile?.maritalStatus || ''} 
                    onChange={e => setProfile({...profile, maritalStatus: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    value={profile?.phone || ''} 
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</label>
                  <input 
                    type="tel" 
                    value={profile?.whatsapp || ''} 
                    onChange={e => setProfile({...profile, whatsapp: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                  <input 
                    type="text" 
                    value={profile?.address || ''} 
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highest Qualification</label>
                  <select 
                    value={profile?.highestQualification || ''} 
                    onChange={e => setProfile({...profile, highestQualification: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Qualification</option>
                    <option value="SSCE / O'Level">SSCE / O'Level</option>
                    <option value="OND / ND">OND / ND</option>
                    <option value="NCE">NCE</option>
                    <option value="Diploma">Diploma</option>
                    <option value="HND">HND</option>
                    <option value="BSc / BA / BEng / BTech">BSc / BA / BEng / BTech</option>
                    <option value="MSc / MA / MBA">MSc / MA / MBA</option>
                    <option value="PhD">PhD</option>
                    <option value="Other (Below BSc)">Other (Below BSc)</option>
                    <option value="Other (BSc and above)">Other (BSc and above)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Years of Experience</label>
                  <input 
                    type="number" 
                    value={profile?.yearsOfExperience || ''} 
                    onChange={e => setProfile({...profile, yearsOfExperience: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Mode</label>
                  <select 
                    value={profile?.jobMode || ''} 
                    onChange={e => setProfile({...profile, jobMode: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Mode</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Salary</label>
                  <input 
                    type="text" 
                    value={profile?.expectedSalary || ''} 
                    onChange={e => setProfile({...profile, expectedSalary: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. N150,000 - N200,000"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" /> Next of Kin Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next of Kin Name</label>
                    <input 
                      type="text" 
                      value={profile?.nextOfKin?.name || ''} 
                      onChange={e => setProfile({...profile, nextOfKin: { ...profile?.nextOfKin, name: e.target.value }})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Relationship</label>
                    <input 
                      type="text" 
                      value={profile?.nextOfKin?.relationship || ''} 
                      onChange={e => setProfile({...profile, nextOfKin: { ...profile?.nextOfKin, relationship: e.target.value }})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next of Kin Phone</label>
                    <input 
                      type="tel" 
                      value={profile?.nextOfKin?.phone || ''} 
                      onChange={e => setProfile({...profile, nextOfKin: { ...profile?.nextOfKin, phone: e.target.value }})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Changes...' : 'Update Profile'}
              </button>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-600" /> Personal Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-medium">{profile?.fullName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Gender</span>
                      <span className="font-medium">{profile?.gender}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Date of Birth</span>
                      <span className="font-medium">{profile?.dob}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Nationality</span>
                      <span className="font-medium">{profile?.nationality}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Marital Status</span>
                      <span className="font-medium">{profile?.maritalStatus}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-600" /> Contact Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-medium">{profile?.phone}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">WhatsApp</span>
                      <span className="font-medium">{profile?.whatsapp}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium">{profile?.email}</span>
                    </div>
                    <div className="py-2">
                      <span className="text-slate-500 block mb-1">Address</span>
                      <span className="font-medium leading-relaxed">{profile?.address}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-orange-600" /> Professional
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Qualification</span>
                      <span className="font-medium">{profile?.highestQualification}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Experience</span>
                      <span className="font-medium">{profile?.yearsOfExperience} Years</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Job Mode</span>
                      <span className="font-medium">{profile?.jobMode}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Expected Salary</span>
                      <span className="font-medium">{profile?.expectedSalary}</span>
                    </div>
                    {profile?.resumeUrl && (
                      <div className="py-2">
                        <a 
                          href={profile.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-orange-600 font-bold hover:underline"
                        >
                          <FileText className="w-4 h-4" /> View Resume
                        </a>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600" /> Next of Kin
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Name</span>
                      <span className="font-medium">{profile?.nextOfKin?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Relationship</span>
                      <span className="font-medium">{profile?.nextOfKin?.relationship}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-medium">{profile?.nextOfKin?.phone}</span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 border border-red-100 dark:border-red-900/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h4>
                      <p className="text-sm text-red-500/70">Request account deletion. Your data will be permanently removed after a 14-day review period.</p>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Request Deletion
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        confirmText={confirmModal.type === 'danger' ? 'Delete' : 'OK'}
      />
    </div>
  );
}
