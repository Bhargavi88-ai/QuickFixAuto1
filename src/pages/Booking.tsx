import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { SERVICES } from '../constants';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { Check, Calendar as CalendarIcon, Clock, Car as CarIcon, ShieldCheck, Loader2, ChevronLeft, ChevronRight, User as UserIcon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import UserDetailsForm from '../components/UserDetailsForm';
import { saveUserProfile, saveCarDetails, attachToBooking, prefillDetails } from '../firebase/firestore';
import { PaymentFlow } from '../components/PaymentFlow';

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM'
];

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Booking() {
  const { user, userData: contextUserData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(location.state?.serviceId || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [details, setDetails] = useState<any>(null);
  const [prefilledData, setPrefilledData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>(TIME_SLOTS);

  // Auto-fill for returning users
  useEffect(() => {
    async function loadPrefill() {
      if (user?.uid) {
        try {
          const data = await prefillDetails(user.uid);
          setPrefilledData(data);
        } catch (e) {
          console.error("Prefill failure:", e);
        }
      }
    }
    loadPrefill();
  }, [user]);

  // Load available slots dynamically from Firebase when date is selected
  useEffect(() => {
    async function fetchOccupiedSlots() {
      if (!selectedDate) return;
      
      const path = 'bookings';
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const q = query(
          collection(db, path),
          where('date', '==', dateStr),
          where('status', 'in', ['pending', 'confirmed'])
        );
        
        const snapshot = await getDocs(q);
        const occupied = snapshot.docs.map(doc => doc.data().timeSlot);
        setAvailableSlots(TIME_SLOTS.filter(slot => !occupied.includes(slot)));
      } catch (error) {
        // We log permission errors but don't strictly crash the UI for availability
        if (error instanceof Error && error.message.includes('permission-denied')) {
          handleFirestoreError(error, OperationType.LIST, path);
        }
        setAvailableSlots(TIME_SLOTS);
      }
    }

    if (selectedDate) {
      fetchOccupiedSlots();
    }
  }, [selectedDate]);

  const service = SERVICES.find(s => s.id === selectedService);

  const resetBooking = () => {
    console.log(">>> Resetting booking protocol for new session...");
    setStep(1);
    setSelectedService('');
    setSelectedDate(null);
    setSelectedTime('');
    setDetails(null);
    setBookingRef('');
    setHasError(false);
  };

  const handleDetailsSubmit = (formData: any) => {
    console.log(">>> Step 4 Completed: Data Received", formData);
    if (!formData) {
      console.warn(">>> Step Transition Blocked: Missing form data");
      return;
    }
    setDetails(formData);
    setStep(5);
    console.log(">>> Progressing to Step 05: Review Manifest");
  };

  const handlePaymentSuccess = async (txnId: string) => {
    console.log(">>> Payment Verified. Finalizing Booking Protocol...", txnId);
    await finalizeBooking(txnId);
  };

  const finalizeBooking = async (txnId?: string) => {
    console.log(">>> Initiating Final Confirmation Protocol...");
    if (!user || !selectedDate || !service || !details) {
      console.warn(">>> Protocol Aborted: Missing critical data packets.", { 
        user: !!user, 
        selectedDate: !!selectedDate, 
        service: !!service, 
        details: !!details 
      });
      alert("Missing required information. Please go back and ensure all details are filled.");
      return;
    }
    
    setLoading(true);
    setHasError(false);
    
    const bookingsPath = 'bookings';
    const txnPath = 'transactions';

    try {
      console.log(">>> Phase 1: Recording Initial Booking and Transaction in Firestore...");
      // 1. Initial Booking Record
      const bookingData = {
        userId: user.uid,
        userName: details.fullName,
        userEmail: details.email,
        serviceId: selectedService,
        serviceName: service.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTime,
        duration: service.duration,
        price: service.price,
        status: 'pending',
        paymentStatus: 'paid',
        transactionId: txnId || '',
        customerDetails: { fullName: details.fullName, email: details.email, phone: details.phone },
        carDetails: { make: details.carMake, model: details.carModel, year: details.year },
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, bookingsPath), bookingData);
      const bookingId = docRef.id;
      console.log(">>> Booking Document established:", bookingId);

      // Record Transaction
      if (txnId) {
        await addDoc(collection(db, txnPath), {
          bookingId,
          userId: user.uid,
          amount: service.price,
          txnId: txnId,
          method: 'UPI',
          date: serverTimestamp(),
          status: 'success'
        });
      }
      
      // 2. Save User Profile & Car Details (Parallel)
      console.log(">>> Phase 2: Synchronizing User Profile and Car Units...");
      try {
        await Promise.all([
          saveUserProfile(user.uid, details),
          saveCarDetails(user.uid, details),
          attachToBooking(bookingId, details)
        ]);
        console.log(">>> Synchronous operations completed.");
      } catch (subError) {
        console.error("Sub-operation failed, but initial booking was recorded:", subError);
        // We don't crash here if the initial booking succeeded, but we should log it
      }

      const shortRef = bookingId.slice(0, 8).toUpperCase();
      setBookingRef(shortRef);
      
      // 3. Trigger Confirmation Email via Cloud Function (Mocked API)
      console.log(">>> Phase 3: Dispatching Confirmation Transmission...");
      try {
        const emailResponse = await fetch('/api/trigger-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking_confirmation',
            bookingData: { 
              ...bookingData, 
              customerDetails: { fullName: details.fullName, email: details.email, phone: details.phone },
              carDetails: { make: details.carMake, model: details.carModel, year: details.year },
              reference: shortRef 
            },
            userEmail: details.email
          }),
        });
        
        if (!emailResponse.ok) {
          console.warn(">>> Transmission Channel Warning: Email trigger returned status", emailResponse.status);
        } else {
          console.log(">>> Transmission successful.");
        }
      } catch (emailError) {
        console.error(">>> Transmission Error (Degraded State):", emailError);
      }
      
      console.log(">>> Proceeding to Success Protocol...");
      setStep(7);
    } catch (error) {
      console.error(">>> CRITICAL SYSTEM FAILURE during finalization:", error);
      if (error instanceof Error && error.message.includes('permission-denied')) {
        handleFirestoreError(error, OperationType.CREATE, bookingsPath);
      }
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-10">
        <div className="max-w-6xl mx-auto">
          
            <div className={cn("mb-16 flex justify-between items-end", (step >= 6 || loading || hasError) && "hidden")}>
            <div>
              <span className="text-orange font-bold text-xs uppercase tracking-[2px] mb-2 inline-block">Maintenance Protocol</span>
              <h1 className="text-5xl text-white">Service <span className="text-orange">Registration</span></h1>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className={cn("h-1 w-8 rounded-full transition-all duration-300", step >= s ? "bg-orange" : "bg-white/10")} />
              ))}
            </div>
          </div>

          <div className={cn(
            "grid grid-cols-1 gap-12 items-start transition-all duration-500",
            (step >= 6 || loading || hasError) ? "lg:grid-cols-1 max-w-2xl mx-auto" : "lg:grid-cols-[1.5fr_1fr]"
          )}>
            <div className={cn("booking-panel p-10", (step >= 6 || loading || hasError) && "text-center py-20 bg-transparent border-0 shadow-none")}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="animate-spin text-orange" size={48} />
                    <h2 className="text-2xl font-bold text-navy uppercase tracking-widest">Processing Registration</h2>
                    <p className="text-slate-400">Synchronizing your maintenance session with our backend servers...</p>
                  </motion.div>
                ) : hasError ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                       <ShieldCheck className="text-red-500 rotate-180" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-navy">System Malfunction</h2>
                    <p className="text-slate-500">Something went wrong during the transmission. Please check your connection and try again.</p>
                    <div className="pt-4">
                      <button onClick={() => setHasError(false)} className="btn-primary px-10 py-4 uppercase tracking-widest text-xs">Retry Transmission</button>
                    </div>
                  </motion.div>
                ) : step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-bold mb-8 text-navy flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-orange text-navy flex items-center justify-center font-black text-sm">01</span>
                      Select Service
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {SERVICES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedService(s.id); setStep(2); }}
                          className={cn(
                            "text-left p-6 rounded-xl border-2 transition-all flex items-center gap-4 group",
                            selectedService === s.id ? "border-orange bg-orange/5" : "border-slate-50 hover:border-slate-200"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", selectedService === s.id ? "bg-orange text-white" : "bg-slate-100 text-slate-400")}>
                            <s.icon size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-navy">{s.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-widest">{s.duration} MINS • {formatCurrency(s.price)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex items-center gap-4 mb-8">
                       <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
                       <h2 className="text-2xl font-bold text-navy flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-orange text-navy flex items-center justify-center font-black text-sm">02</span>
                        Select Date
                      </h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const date = addDays(startOfToday(), i + 1);
                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        return (
                          <button
                            key={i}
                            onClick={() => { setSelectedDate(date); setStep(3); }}
                            className={cn(
                              "flex-shrink-0 w-24 py-6 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                              isSelected ? "bg-navy text-white border-navy shadow-xl" : "bg-white border-slate-50 hover:border-slate-200"
                            )}
                          >
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-40">{format(date, 'EEE')}</span>
                            <span className="text-2xl font-black">{format(date, 'd')}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-40">{format(date, 'MMM')}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex items-center gap-4 mb-8">
                       <button onClick={() => setStep(2)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
                       <h2 className="text-2xl font-bold text-navy flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-orange text-navy flex items-center justify-center font-black text-sm">03</span>
                        Select Time Slot
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => { setSelectedTime(time); setStep(4); }}
                          className={cn(
                            "py-4 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                            selectedTime === time ? "bg-navy text-white border-navy shadow-lg" : "bg-white border-slate-50 hover:border-slate-200 text-slate-400"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex items-center gap-4 mb-10">
                       <button onClick={() => setStep(3)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
                       <h2 className="text-2xl font-bold text-navy flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-orange text-navy flex items-center justify-center font-black text-sm">04</span>
                        User Details
                      </h2>
                    </div>
                    <UserDetailsForm initialData={prefilledData} onNext={handleDetailsSubmit} loading={loading} />
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                     <div className="flex items-center gap-4 mb-8">
                       <button onClick={() => setStep(4)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
                       <h2 className="text-2xl font-bold text-navy flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-orange text-navy flex items-center justify-center font-black text-sm">05</span>
                        Review Manifest
                       </h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-2xl p-8 space-y-6 border border-slate-100">
                        <div className="grid grid-cols-2 gap-8 text-left">
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service</div>
                            <div className="font-bold text-navy">{service?.name || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</div>
                            <div className="font-bold text-navy">{selectedDate ? format(selectedDate, 'MMM d, yyyy') : "N/A"} • {selectedTime || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</div>
                            <div className="font-bold text-navy">{details?.fullName || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</div>
                            <div className="font-bold text-navy">{details?.year} {details?.carMake} {details?.carModel}</div>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                           <span className="text-lg font-bold text-navy">Total Investment</span>
                           <span className="text-3xl font-black text-orange">{formatCurrency(service?.price || 0)}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-10 leading-relaxed">
                        By proceeding, you authorize transmission of data as outlined in our service terms. 12-hour cancellation protocol enforced.
                      </p>

                      <button onClick={() => setStep(6)} disabled={loading} className="btn-primary w-full py-5 text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-orange/20">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Proceed to Payment <ChevronRight size={18} /></>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 6 && (
                  <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                    <PaymentFlow 
                      amount={service?.price || 0}
                      merchantName="AutoCare Pro Services"
                      onSuccess={handlePaymentSuccess}
                      onCancel={() => setStep(5)}
                    />
                  </motion.div>
                )}

                {step === 7 && (
                  <motion.div 
                    key="step7" 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="space-y-8 py-4"
                  >
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck size={40} />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-navy mb-4 tracking-tight">Booking Confirmed Successfully</h1>
                      <div className="h-1 w-20 bg-orange mx-auto mb-6 rounded-full" />
                      <p className="text-slate-500 leading-relaxed max-w-md mx-auto italic">
                        Your maintenance session for <span className="font-bold text-navy">{service?.name || "the selected service"}</span> has been scheduled and synchronized with our diagnostic systems.
                      </p>
                      <p className="text-xs text-slate-400 mt-4 uppercase tracking-[2px] font-bold">
                        Digital manifest dispatched to <span className="text-orange underline">{details?.email || user?.email}</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center">
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Protocol ID</div>
                         <div className="text-xl font-black text-navy font-mono">{bookingRef || "GENERATING..."}</div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center">
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Status</div>
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                           <div className="text-xl font-black text-green-500 uppercase">Registered</div>
                         </div>
                      </div>
                    </div>

                    <div className="bg-orange/5 p-6 rounded-2xl border border-orange/10 text-left">
                      <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-4">Summary Manifest</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Scheduled Date</span>
                          <span className="font-bold text-navy">{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '---'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Time Slot</span>
                          <span className="font-bold text-navy">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Total Charged</span>
                          <span className="font-bold text-orange">{formatCurrency(service?.price || 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <button 
                        onClick={() => navigate('/dashboard')} 
                        className="btn-primary w-full py-5 text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                      >
                        View My Bookings
                      </button>
                      <button 
                        onClick={resetBooking} 
                        className="w-full py-4 text-[10px] font-black uppercase tracking-[3px] text-slate-300 hover:text-orange transition-colors"
                      >
                        Schedule Another Service
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tracking Panel / Session Log */}
            {!loading && !hasError && step < 6 && (
              <div className="sticky top-32">
                <div className="booking-panel p-8 bg-blue-gray/10 backdrop-blur-xl border-white/10 text-white border-2">
                   <h3 className="text-xl font-bold mb-8 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="text-orange" size={20} /> Current State
                   </h3>
                   
                   <div className="space-y-8">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Protocol</div>
                           <div className="font-bold text-white tracking-tighter truncate max-w-[150px]">{service?.name || "Initializing..."}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Step</div>
                           <div className="font-black text-orange">0{step} / 05</div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        {[
                          { label: 'Timeline', val: selectedDate ? format(selectedDate, 'MMM d, yyyy') : '---', icon: CalendarIcon },
                          { label: 'Reserved Slot', val: selectedTime || '---', icon: Clock },
                          { label: 'Identified Unit', val: details ? `${details.year} ${details.carMake}` : '---', icon: CarIcon },
                          { label: 'Verified Lead', val: details?.fullName || '---', icon: UserIcon },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30"><item.icon size={14} /></div>
                             <div>
                                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">{item.label}</div>
                                <div className="text-xs font-bold text-white/80">{item.val}</div>
                             </div>
                          </div>
                        ))}
                     </div>

                     <div className="pt-8 border-t border-white/10">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Transmission Channel</div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Active Channel</div>
                          <div className="text-xs font-black truncate text-white">{details?.email || user?.email || "pending..."}</div>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
