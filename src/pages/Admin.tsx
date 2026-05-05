import React, { useEffect, useState } from 'react';
import { 
  collection, query, getDocs, orderBy, updateDoc, doc, limit, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Calendar, Users, ListFilter, Check, X, ShieldAlert, TrendingUp, Search, 
  CreditCard, Megaphone, Loader2, RefreshCw, UserCheck, UserMinus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';

type Tab = 'bookings' | 'users' | 'transactions' | 'announcements';

interface Booking {
  id: string;
  userName: string;
  userEmail: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  carDetails: { make: string; model: string; year: string };
  createdAt: any;
}

interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  status: 'active' | 'suspended';
  createdAt: any;
}

interface Transaction {
  id: string;
  userName: string;
  amount: number;
  serviceName: string;
  date: any;
  status: 'succeeded' | 'failed' | 'pending';
}

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Announcement state
  const [announcement, setAnnouncement] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Bookings
      const bookingsPath = 'bookings';
      try {
        const bookingsQ = query(collection(db, bookingsPath), orderBy('createdAt', 'desc'), limit(50));
        const bookingsSnap = await getDocs(bookingsQ);
        setBookings(bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[]);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, bookingsPath);
      }

      // Fetch Users
      const usersPath = 'users';
      try {
        const usersSnap = await getDocs(collection(db, usersPath));
        setUsers(usersSnap.docs.map(d => ({ uid: d.id, ...d.data() })) as AppUser[]);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, usersPath);
      }

      // Fetch Transactions (fallback to empty if collection doesn't exist)
      const transPath = 'transactions';
      try {
        const transSnap = await getDocs(query(collection(db, transPath), orderBy('date', 'desc'), limit(50)));
        setTransactions(transSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[]);
      } catch (e) {
        // Only error if it's a permission issue, ignore if collection missing
        if (e instanceof Error && e.message.includes('permission-denied')) {
          handleFirestoreError(e, OperationType.LIST, transPath);
        }
        setTransactions([]);
      }

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      const path = `bookings/${id}`;
      await updateDoc(doc(db, 'bookings', id), { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleUpdateUserStatus = async (uid: string, status: AppUser['status']) => {
    try {
      const path = `users/${uid}`;
      await updateDoc(doc(db, 'users', uid), { status });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status } : u));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return;
    setSendingAnnouncement(true);
    const path = 'announcements';
    try {
      await addDoc(collection(db, path), {
        message: announcement,
        createdAt: serverTimestamp(),
      });
      setAnnouncement('');
      alert("Announcement broadcasted successfully!");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const stats = {
    revenue: transactions.filter(t => t.status === 'succeeded').reduce((acc, t) => acc + (t.amount || 0), 0) || 
             bookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + (b.price || 0), 0),
    activeUsers: users.filter(u => u.status !== 'suspended').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length
  };

  const filteredBookings = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    const search = searchTerm.toLowerCase();
    return b.userName?.toLowerCase().includes(search) || 
           b.userEmail?.toLowerCase().includes(search) ||
           b.serviceName?.toLowerCase().includes(search);
  });

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    return u.fullName?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search);
  });

  return (
    <div className="bg-navy min-h-screen py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-blue-gray">
          <div>
            <div className="flex items-center gap-2 text-orange font-bold uppercase tracking-[2px] text-[10px] mb-3">
               <ShieldAlert size={14} className="text-orange" /> Control Center v2.0
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              ADMIN <span className="text-orange tracking-tighter italic">DASHBOARD</span>
            </h1>
          </div>

          <div className="flex gap-4 flex-wrap">
            <StatCard label="Total Revenue" value={formatCurrency(stats.revenue)} icon={TrendingUp} highlighted />
            <StatCard label="Active Personnel" value={stats.activeUsers.toString()} icon={Users} />
            <StatCard label="System Load" value={`${stats.pendingBookings} PENDING`} icon={Calendar} />
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-white/5 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={Calendar} label="Bookings" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Users" />
          <TabButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={CreditCard} label="Transactions" />
          <TabButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} icon={Megaphone} label="Broadcast" />
          <button 
            onClick={fetchData} 
            className="p-4 text-slate-500 hover:text-white transition-colors" 
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Search Bar (shared by Booking and Users) */}
        {(activeTab === 'bookings' || activeTab === 'users') && (
          <div className="relative w-full max-w-md mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder={`SEARCH ${activeTab.toUpperCase()}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-blue-gray/30 border border-white/10 py-4 pl-12 pr-4 rounded-xl outline-none focus:border-orange transition-all text-xs font-bold uppercase tracking-widest text-white"
            />
          </div>
        )}

        <main>
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="text-orange animate-spin" size={40} />
               <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">Synchronizing Local Database</span>
             </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'bookings' && (
                <motion.div 
                  key="bookings" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-gray/20 rounded-[30px] p-8 border border-white/5 shadow-2xl overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xs font-black uppercase tracking-[2px] text-slate-400">Booking Management Interface</h3>
                    <div className="flex gap-2">
                       {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                         <button 
                           key={f}
                           onClick={() => setFilter(f)}
                           className={cn(
                             "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                             filter === f ? "bg-orange text-white" : "bg-white/5 text-slate-500 hover:text-white"
                           )}
                         >
                           {f}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase tracking-[2px] text-slate-600 border-b border-white/5">
                          <th className="pb-8">Identity</th>
                          <th className="pb-8">Mission Type</th>
                          <th className="pb-8">Timestamp</th>
                          <th className="pb-8">Condition</th>
                          <th className="pb-8 text-right">Directives</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredBookings.map(b => (
                          <tr key={b.id} className="group hover:bg-white/[0.02]">
                            <td className="py-6">
                              <div className="font-bold text-white text-sm">{b.userName || 'Unknown'}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{b.userEmail}</div>
                            </td>
                            <td className="py-6">
                              <div className="font-bold text-orange/90 text-sm">{b.serviceName}</div>
                              <div className="text-[10px] text-slate-500 uppercase">{b.carDetails?.make} {b.carDetails?.model}</div>
                            </td>
                            <td className="py-6">
                              <div className="font-bold text-white text-sm">{b.date}</div>
                              <div className="text-[10px] text-slate-500">{b.timeSlot}</div>
                            </td>
                            <td className="py-6">
                               <StatusBadge status={b.status} />
                            </td>
                            <td className="py-6 text-right">
                               <div className="flex justify-end gap-2">
                                 {b.status === 'pending' && (
                                   <ActionButton icon={Check} onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')} color="green" />
                                 )}
                                 {b.status === 'confirmed' && (
                                   <ActionButton icon={TrendingUp} onClick={() => handleUpdateBookingStatus(b.id, 'completed')} color="blue" />
                                 )}
                                 {b.status !== 'cancelled' && b.status !== 'completed' && (
                                   <ActionButton icon={X} onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')} color="red" />
                                 )}
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div 
                  key="users" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-gray/20 rounded-[30px] p-8 border border-white/5 shadow-2xl"
                >
                  <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black uppercase tracking-[2px] text-slate-600 border-b border-white/5">
                         <th className="pb-8">Username / ID</th>
                         <th className="pb-8">Email Frequency</th>
                         <th className="pb-8">Account Standing</th>
                         <th className="pb-8 text-right">Action Log</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-white/[0.02]">
                          <td className="py-6 font-bold text-white">{u.fullName || 'User'}</td>
                          <td className="py-6 text-slate-400 text-sm">{u.email}</td>
                          <td className="py-6">
                             <span className={cn(
                               "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block",
                               u.status === 'suspended' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"
                             )}>
                               {u.status || 'active'}
                             </span>
                          </td>
                          <td className="py-6 text-right">
                             {u.status === 'suspended' ? (
                               <button onClick={() => handleUpdateUserStatus(u.uid, 'active')} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg">
                                 <UserCheck size={18} />
                               </button>
                             ) : (
                               <button onClick={() => handleUpdateUserStatus(u.uid, 'suspended')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                 <UserMinus size={18} />
                               </button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'transactions' && (
                 <motion.div 
                   key="transactions" 
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="bg-blue-gray/20 rounded-[30px] p-8 border border-white/5 shadow-2xl"
                 >
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black uppercase tracking-[2px] text-slate-400 italic">Financial Transaction Log</h3>
                      <div className="bg-orange/10 px-6 py-3 rounded-2xl border border-orange/20">
                         <span className="text-[10px] block font-bold text-orange uppercase tracking-widest mb-1">Total System Revenue</span>
                         <span className="text-2xl font-black text-white">{formatCurrency(stats.revenue)}</span>
                      </div>
                   </div>

                   <div className="overflow-hidden bg-navy/30 rounded-2xl border border-white/5">
                      <table className="w-full text-left">
                        <thead className="bg-white/5">
                           <tr className="text-[9px] font-black uppercase tracking-[2px] text-slate-400">
                             <th className="p-4">Transaction ID</th>
                             <th className="p-4">Entity</th>
                             <th className="p-4">Volume</th>
                             <th className="p-4">Standing</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {transactions.length > 0 ? (
                            transactions.map(t => (
                              <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-xs font-mono text-slate-500">{t.id.slice(0, 8)}...</td>
                                <td className="p-4">
                                   <div className="text-xs font-bold text-white">{t.userName}</div>
                                   <div className="text-[10px] text-slate-500">{t.serviceName}</div>
                                </td>
                                <td className="p-4 font-black text-orange">{formatCurrency(t.amount)}</td>
                                <td className="p-4">
                                   <span className={cn(
                                     "text-[8px] font-black uppercase tracking-widest",
                                     t.status === 'succeeded' ? "text-green-400" : "text-red-400"
                                   )}>{t.status}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                               <td colSpan={4} className="py-20 text-center text-slate-600 font-bold italic tracking-widest uppercase text-[10px]">
                                 No automated transitions recorded. Revenue calculated from completed mandates.
                               </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                   </div>
                 </motion.div>
              )}

              {activeTab === 'announcements' && (
                 <motion.div 
                   key="announcements" 
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="max-w-2xl mx-auto bg-blue-gray/20 rounded-[30px] p-10 border border-white/5 shadow-2xl"
                 >
                    <div className="text-center mb-10">
                       <div className="w-20 h-20 bg-orange/10 text-orange rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <Megaphone size={36} />
                       </div>
                       <h2 className="text-2xl font-black text-white uppercase tracking-tight">System-Wide Broadcast</h2>
                       <p className="text-slate-400 text-sm mt-3 leading-relaxed">Type your message below. This will appear as a high-visibility banner across the entire application interface for all active users.</p>
                    </div>

                    <div className="space-y-6">
                       <textarea 
                         className="w-full h-40 bg-navy/50 border border-white/10 rounded-2xl p-6 text-white text-sm font-medium outline-none focus:border-orange transition-all resize-none placeholder:text-slate-600 shadow-inner"
                         placeholder="IDENTIFYING PROTOCOL MESSAGE..."
                         value={announcement}
                         onChange={e => setAnnouncement(e.target.value)}
                       />

                       <button 
                         onClick={handleSendAnnouncement}
                         disabled={sendingAnnouncement || !announcement.trim()}
                         className={cn(
                           "btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-xl shadow-orange/20",
                           (sendingAnnouncement || !announcement.trim()) && "opacity-20 cursor-not-allowed"
                         )}
                       >
                         {sendingAnnouncement ? <Loader2 className="animate-spin" size={20} /> : <><Megaphone size={18} /> Initiate Broadcast</>}
                       </button>

                       <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-[2px]">Warning: Broadcasts are recorded and immutable in the central archive.</p>
                    </div>
                 </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, highlighted = false }: any) => (
  <div className={cn(
    "service-card py-5 px-8 flex flex-col justify-center min-w-[200px] border transform transition-all hover:scale-105",
    highlighted ? "bg-orange/5 border-orange/20 shadow-lg shadow-orange/5" : "bg-blue-gray/20 border-white/5"
  )}>
    <div className="flex items-center gap-3 mb-2">
       <div className={cn("p-1.5 rounded-lg", highlighted ? "bg-orange/10 text-orange" : "bg-white/5 text-slate-500")}>
          <Icon size={14} />
       </div>
       <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</span>
    </div>
    <span className={cn("text-2xl font-black tracking-tighter", highlighted ? "text-orange" : "text-white")}>{value}</span>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-[2px] transition-all relative whitespace-nowrap group",
      active ? "text-orange" : "text-slate-500 hover:text-white"
    )}
  >
    <Icon size={16} className={cn("transition-transform group-hover:scale-110", active && "scale-110")} />
    {label}
    {active && (
      <motion.div 
        layoutId="activeTab" 
        className="absolute bottom-0 left-0 w-full h-[3px] bg-orange rounded-full" 
      />
    )}
  </button>
);

const ActionButton = ({ icon: Icon, onClick, color }: any) => {
  const colors = {
    green: "text-green-400 hover:bg-green-400 hover:text-navy border-green-500/20 shadow-lg shadow-green-400/5",
    red: "text-red-400 hover:bg-red-400 hover:text-navy border-red-500/20 shadow-lg shadow-red-400/5",
    blue: "text-blue-400 hover:bg-blue-400 hover:text-navy border-blue-400/20 shadow-lg shadow-blue-400/5",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl transition-all border bg-white/5 active:scale-90",
        colors[color as keyof typeof colors]
      )}
    >
      <Icon size={14} />
    </button>
  );
};

const StatusBadge = ({ status }: { status: Booking['status'] }) => {
  const styles = {
    pending: "text-orange border-orange/20 shadow-[0_0_10px_rgba(255,107,0,0.1)] bg-orange/5",
    confirmed: "text-green-400 border-green-500/20 bg-green-400/5",
    completed: "text-blue-400 border-blue-500/20 bg-blue-400/5",
    cancelled: "text-slate-600 border-white/5 bg-white/5",
  };

  return (
    <span className={cn(
      "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block",
      styles[status]
    )}>
      {status}
    </span>
  );
};

export default Admin;
