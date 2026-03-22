import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { Message } from '../types';
import { Send, User, MessageSquare, Check, CheckCheck, Loader2 } from 'lucide-react';

interface MessageSystemProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  type: 'staff-client' | 'staff-candidate';
}

export const MessageSystem: React.FC<MessageSystemProps> = ({ currentUserId, otherUserId, otherUserName, type }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    // Query 1: current user is sender, other user is receiver
    const q1 = query(
      collection(db, 'messages'),
      where('senderId', '==', currentUserId),
      where('receiverId', '==', otherUserId),
      where('type', '==', type)
    );

    // Query 2: current user is receiver, other user is sender
    const q2 = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUserId),
      where('senderId', '==', otherUserId),
      where('type', '==', type)
    );

    let messages1: Message[] = [];
    let messages2: Message[] = [];

    const updateMessages = () => {
      const allMessages = [...messages1, ...messages2];
      // Sort client-side by createdAt
      allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      setMessages(allMessages);
      setLoading(false);
      
      // Mark unread messages as read
      allMessages.forEach(msg => {
        if (msg.receiverId === currentUserId && !msg.read) {
          updateDoc(doc(db, 'messages', msg.id), { read: true });
        }
      });
    };

    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      messages1 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      updateMessages();
    }, (error) => {
      console.error('Error in messages listener 1:', error);
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      messages2 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      updateMessages();
    }, (error) => {
      console.error('Error in messages listener 2:', error);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [currentUserId, otherUserId, type]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUserId,
        receiverId: otherUserId,
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        read: false,
        type: type
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{otherUserName}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Direct Message</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p className="text-sm italic">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                isMe 
                  ? 'bg-orange-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? 'text-orange-200' : 'text-slate-400'}`}>
                  <span className="text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex gap-2">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-600/20"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};
