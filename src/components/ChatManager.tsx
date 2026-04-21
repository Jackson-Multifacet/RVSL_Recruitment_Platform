import * as React from 'react';
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { MessageSystem } from './MessageSystem';
import { Search, User, MessageSquare, Building2, Shield, Loader2, Circle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: 'admin' | 'recruiter' | 'agent' | 'candidate' | 'client';
  type: 'staff' | 'candidate' | 'client';
  photoUrl?: string;
  companyName?: string;
}

interface ChatManagerProps {
  currentUserId: string;
  userRole: 'staff' | 'candidate' | 'client';
  preSelectedContactId?: string;
}

export const ChatManager: React.FC<ChatManagerProps> = ({ currentUserId, userRole, preSelectedContactId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (preSelectedContactId && contacts.length > 0) {
      const contact = contacts.find(c => c.id === preSelectedContactId);
      if (contact) {
        setSelectedContact(contact);
      }
    }
  }, [preSelectedContactId, contacts]);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const allContacts: Contact[] = [];

        if (userRole === 'staff') {

          const candSnapshot = await getDocs(collection(db, 'candidates'));
          candSnapshot.docs.forEach(doc => {
            const data = doc.data();
            allContacts.push({
              id: doc.id,
              name: `${data.name?.firstName} ${data.name?.surname}`,
              role: 'candidate',
              type: 'candidate',
              photoUrl: data.photoUrl
            });
          });

          const clientSnapshot = await getDocs(collection(db, 'clients'));
          clientSnapshot.docs.forEach(doc => {
            const data = doc.data();
            allContacts.push({
              id: doc.id,
              name: data.companyName,
              role: 'client',
              type: 'client',
              photoUrl: data.photoUrl,
              companyName: data.companyName
            });
          });
        } else {

          const staffSnapshot = await getDocs(collection(db, 'staff'));
          staffSnapshot.docs.forEach(doc => {
            const data = doc.data();
            allContacts.push({
              id: doc.id,
              name: data.fullName,
              role: data.role,
              type: 'staff',
              photoUrl: data.photoUrl
            });
          });
        }

        setContacts(allContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [userRole]);

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUserId),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        counts[data.senderId] = (counts[data.senderId] || 0) + 1;
      });
      setUnreadCounts(counts);
    }, (error) => {
      console.error('Error in unread messages listener:', error);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {}
      <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic text-sm">
              No contacts found.
            </div>
          ) : (
            filteredContacts.map(contact => (
              <button
                key={contact.id}
                type="button"
                aria-pressed={selectedContact?.id === contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  selectedContact?.id === contact.id
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-100 dark:border-orange-900/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    {contact.photoUrl ? (
                      <img src={contact.photoUrl} alt={contact.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      contact.type === 'client' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />
                    )}
                  </div>
                  {unreadCounts[contact.id] > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {unreadCounts[contact.id]}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold truncate">{contact.name}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{contact.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {}
      <div className="md:col-span-2 h-full">
        {selectedContact ? (
          <MessageSystem
            currentUserId={currentUserId}
            otherUserId={selectedContact.id}
            otherUserName={selectedContact.name}
            type={userRole === 'staff'
              ? (selectedContact.type === 'client' ? 'staff-client' : 'staff-candidate')
              : (userRole === 'client' ? 'staff-client' : 'staff-candidate')
            }
          />
        ) : (
          <div className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your Messages</h3>
            <p className="max-w-xs">Select a contact from the list to start a conversation or view your message history.</p>
          </div>
        )}
      </div>
    </div>
  );
};
