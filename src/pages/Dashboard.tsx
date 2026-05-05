import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { format, isAfter, subHours, parseISO } from 'date-fns';
import { Calendar, Clock, Car, ChevronRight, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';

import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  carDetails: { make: string; model: string; year: string };
  createdAt: any;
}

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      const path = 'bookings';
      try {
        const q = query(
          collection(db, path),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
        setBookings(data);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleCancel = async (bookingId: string, bookingDate: string, bookingTime: string) => {
    // Cancellation policy: 12 hours before
    const appointmentDate = new Date(`${bookingDate} ${bookingTime}`);
    const now = new Date();
    const limit = subHours(appointmentDate, 12);

    if (now > limit) {
      alert("Late cancellation: Cancellations within 12 hours of appointment may be subject to fees and will be flagged.");
    }

    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const path = `bookings/${bookingId}`;
      try {
        await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-navy min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-blue-gray pb-12">
            <div>
              <span className="text-orange font-bold text-xs uppercase tracking-[2px] mb-2 inline-block">Client Workspace</span>
              <h1 className="text-5xl">Maintenance <span className="text-orange">Log</span></h1>
            </div>
            <div className="flex gap-4">
               <div className="service-card py-4 px-6 flex flex-col min-w-[160px]">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">Total Visits</span>
                  <span className="text-2xl font-black">{bookings.length}</span>
               </div>
               <div className="bg-orange p-1 rounded-xl">
                  <div className="bg-navy rounded-lg p-5 flex items-center gap-4">
                     <div className="w-10 h-10 bg-orange rounded-lg flex items-center justify-center text-navy font-black text-lg">
                       {user?.displayName?.charAt(0) || 'C'}
                     </div>
                     <div>
                        <div className="text-xs font-bold">{user?.displayName || 'Customer'}</div>
                        <div className="text-[10px] text-text-muted font-medium">{user?.email}</div>
                     </div>
                  </div>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-blue-gray/30 rounded-[20px] p-10 border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-10 uppercase tracking-widest text-text-muted flex items-center gap-3">
                <Calendar className="text-orange" size={18} /> Recorded Sessions
              </h2>

                {loading ? (
                  <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange"></div>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-6">
                    {bookings.map((booking) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={booking.id} 
                        className="group relative bg-white/5 hover:bg-white p-6 rounded-3xl border border-transparent hover:border-navy/10 dark:hover:bg-blue-gray transition-all shadow-sm"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black uppercase",
                              booking.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-navy text-white dark:bg-blue-gray dark:text-orange'
                            )}>
                              {booking.serviceName.slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg mb-1 group-hover:text-navy dark:group-hover:text-white transition-colors">{booking.serviceName}</h3>
                              <div className="flex flex-wrap gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {booking.date}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {booking.timeSlot}</span>
                                <span className="flex items-center gap-1"><Car size={12} /> {booking.carDetails?.make || 'Unknown'} {booking.carDetails?.model || ''}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                              getStatusStyle(booking.status)
                            )}>
                              {booking.status}
                            </span>
                            
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <button 
                                onClick={() => handleCancel(booking.id, booking.date, booking.timeSlot)}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                                title="Cancel Booking"
                              >
                                <XCircle size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-blue-gray rounded-full flex items-center justify-center mx-auto mb-4 text-white/10">
                      <AlertCircle size={32} />
                    </div>
                    <p className="text-text-muted font-bold mb-6 italic tracking-widest">You haven't initiated any protocols yet.</p>
                    <button 
                      onClick={() => navigate('/booking')}
                      className="btn-primary px-10"
                    >
                      Initialize First Service
                    </button>
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Dashboard;
