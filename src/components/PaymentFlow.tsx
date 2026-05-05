import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, CreditCard, Smartphone, Landmark, Wallet, CheckCircle2, 
  XCircle, ArrowLeft, Loader2, Download, Home, AlertCircle, ShieldCheck,
  Smartphone as PhoneIcon, SmartphoneNfc as GPayIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';

interface PaymentFlowProps {
  amount: number;
  merchantName: string;
  onSuccess: (txnId: string) => void;
  onCancel: () => void;
}

type PaymentStep = 'method' | 'upi' | 'processing' | 'success' | 'failure';
type UPIMethod = 'phonepe' | 'paytm' | 'gpay' | 'other';

export const PaymentFlow: React.FC<PaymentFlowProps> = ({ amount, merchantName, onSuccess, onCancel }) => {
  const [step, setStep] = useState<PaymentStep>('method');
  const [selectedUPI, setSelectedUPI] = useState<UPIMethod | null>(null);
  const [upiId, setUpiId] = useState('');
  const [processingText, setProcessingText] = useState('Initiating payment...');
  const [progress, setProgress] = useState(0);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [txnDetails, setTxnDetails] = useState({
    refNo: '',
    txnId: '',
    timestamp: ''
  });

  // Generate random IDs for realism
  useEffect(() => {
    if (step === 'processing') {
      const texts = [
        'Initiating payment...',
        'Connecting to bank...',
        'Verifying UPI ID...',
        'Transferring funds...',
        'Finalizing transaction...'
      ];
      
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < texts.length - 1) {
          currentIdx++;
          setProcessingText(texts[currentIdx]);
          setProgress((prev) => Math.min(prev + 20, 100));
        } else {
          clearInterval(interval);
          if (simulateFailure) {
            setStep('failure');
          } else {
            setStep('success');
          }
        }
      }, 1000);

      const ref = Math.floor(Math.random() * 900000000000) + 100000000000;
      const id = 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const now = new Date().toLocaleString();
      
      setTxnDetails({
        refNo: ref.toString(),
        txnId: id,
        timestamp: now
      });

      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-navy rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5">
      <AnimatePresence mode="wait">
        {/* STEP 1: METHOD SELECTION */}
        {step === 'method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 md:p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={onCancel}
                className="p-2 hover:bg-slate-100 dark:hover:bg-blue-gray rounded-full transition-colors"
                title="Go Back"
              >
                <ArrowLeft size={20} className="text-slate-500" />
              </button>
              <div>
                <h2 className="text-lg font-black text-navy dark:text-white uppercase tracking-tight">Select Payment</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{merchantName}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-blue-gray/20 p-5 rounded-2xl mb-8 flex justify-between items-center border border-slate-100 dark:border-white/5">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Amount Payable</span>
              <span className="text-2xl font-black text-navy dark:text-white">{formatCurrency(amount)}</span>
            </div>

            <div className="space-y-3">
              <MethodItem 
                icon={Smartphone} 
                label="UPI" 
                sub="PhonePe, Paytm, Google Pay" 
                onClick={() => setStep('upi')} 
                hot
              />
              <MethodItem 
                icon={CreditCard} 
                label="Cards" 
                sub="Visa, Mastercard, RuPay" 
                onClick={() => {}} 
              />
              <MethodItem 
                icon={Landmark} 
                label="Net Banking" 
                sub="All Indian Banks" 
                onClick={() => {}} 
              />
              <MethodItem 
                icon={Wallet} 
                label="Digital Wallets" 
                sub="Amazon Pay, Mobikwik" 
                onClick={() => {}} 
              />
            </div>
            
            <div className="mt-10">
              <button 
                disabled
                className="w-full py-4 rounded-2xl bg-orange/10 text-orange font-black uppercase text-xs tracking-widest cursor-not-allowed opacity-50"
              >
                Proceed to Pay
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: UPI SELECTION */}
        {step === 'upi' && (
          <motion.div
            key="upi"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8"
          >
            <button onClick={() => setStep('method')} className="flex items-center gap-2 text-slate-400 hover:text-navy dark:hover:text-white transition-colors mb-8 text-[10px] font-black uppercase tracking-widest">
              <ArrowLeft size={14} /> Back to methods
            </button>

            <h2 className="text-xl font-black text-navy dark:text-white uppercase tracking-tight mb-2">Choose UPI App</h2>
            <p className="text-xs text-slate-500 mb-8 italic">Instant & Secure checkout powered by NPCL</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <UPIApp 
                type="phonepe" 
                active={selectedUPI === 'phonepe'} 
                onClick={() => setSelectedUPI('phonepe')} 
              />
              <UPIApp 
                type="paytm" 
                active={selectedUPI === 'paytm'} 
                onClick={() => setSelectedUPI('paytm')} 
              />
              <UPIApp 
                type="gpay" 
                active={selectedUPI === 'gpay'} 
                onClick={() => setSelectedUPI('gpay')} 
              />
              <UPIApp 
                type="other" 
                active={selectedUPI === 'other'} 
                onClick={() => setSelectedUPI('other')} 
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">UPI ID / VPA</label>
                <input 
                  type="text"
                  placeholder="username@ybl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-blue-gray/30 border border-slate-100 dark:border-white/10 py-4 px-6 rounded-2xl text-xs font-bold text-navy dark:text-white outline-none focus:border-orange transition-all"
                />
              </div>
              
              <button 
                onClick={() => setStep('processing')}
                disabled={!selectedUPI || (selectedUPI === 'other' && !upiId)}
                className={cn(
                  "btn-primary w-full py-5 text-sm active:scale-95 shadow-xl shadow-orange/20",
                  (!selectedUPI) && "opacity-20 cursor-not-allowed"
                )}
              >
                Pay {formatCurrency(amount)}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PROCESSING */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-10">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle
                  cx="48" cy="48" r="44"
                  fill="none" stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100 dark:text-white/5"
                />
                <motion.circle
                  cx="48" cy="48" r="44"
                  fill="none" stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="276"
                  initial={{ strokeDashoffset: 276 }}
                  animate={{ strokeDashoffset: 276 - (276 * progress / 100) }}
                  className="text-orange"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="text-orange animate-spin" size={32} />
              </div>
            </div>

            <h3 className="text-xl font-black text-navy dark:text-white uppercase tracking-tight mb-2 animate-pulse">
              {processingText}
            </h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Do not close this window</p>

            <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
              <ShieldCheck size={14} className="text-green-500" /> Secure Encryption Active
            </div>
          </motion.div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="bg-green-500 p-10 pb-20 text-center text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CheckCircle2 size={120} />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
              >
                <CheckCircle2 size={40} className="text-white" />
              </motion.div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Success!</h2>
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Payment of {formatCurrency(amount)} successful</p>
            </div>

            <div className="bg-white dark:bg-navy p-8 -mt-10 rounded-t-[40px] relative shadow-2xl">
              <div className="space-y-6 pt-4 mb-10">
                <ReceiptItem label="Paid To" value={merchantName} bold />
                <ReceiptItem label="Transaction ID" value={txnDetails.txnId} />
                <ReceiptItem label="UPI Ref No." value={txnDetails.refNo} />
                <ReceiptItem label="Timestamp" value={txnDetails.timestamp} />
                <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />
                <ReceiptItem label="Payment App" value={selectedUPI ? selectedUPI.toUpperCase() : 'UPI'} />
                <div className="flex justify-between items-center bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                  <span className="text-[10px] font-black uppercase text-green-600 tracking-widest">Transaction Status</span>
                  <span className="flex items-center gap-2 text-xs font-black text-green-600 uppercase">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">
                  <Download size={14} /> Receipt
                </button>
                <button 
                  onClick={() => onSuccess(txnDetails.txnId)}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-navy dark:bg-orange text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange/20"
                >
                  <Home size={14} /> Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: FAILURE */}
        {step === 'failure' && (
          <motion.div
            key="failure"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center"
          >
            <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle size={48} className="text-red-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-navy dark:text-white uppercase tracking-tight mb-4">Payment Failed!</h2>
            <div className="bg-red-50 dark:bg-red-500/5 p-6 rounded-2xl border border-red-100 dark:border-red-500/10 mb-8">
              <div className="flex items-center gap-3 text-red-600 justify-center mb-2">
                <AlertCircle size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Technical Error</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Bank declined the transaction due to server timeout or insufficient funds.
              </p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => setStep('method')}
                className="btn-primary w-full py-5 text-sm uppercase tracking-widest shadow-xl shadow-orange/20"
              >
                Retry Payment
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy transition-colors"
              >
                Choose Another Method
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER LOGOS & SIMULATION TOGGLE */}
      {step !== 'processing' && step !== 'success' && step !== 'failure' && (
        <div className="bg-slate-50 dark:bg-blue-gray/5 py-6 px-8 flex flex-col gap-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-center gap-6 opacity-40">
             <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-3 grayscale invert dark:invert-0" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png" alt="Paytm" className="h-3 grayscale invert dark:invert-0" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/PhonePe_Logo.svg" alt="PhonePe" className="h-3 grayscale invert dark:invert-0" />
          </div>
          
          <label className="flex items-center justify-between gap-3 cursor-pointer group">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500 transition-colors">Simulate Failed Payment</span>
            <div 
              onClick={() => setSimulateFailure(!simulateFailure)}
              className={cn(
                "w-8 h-4 rounded-full relative transition-colors",
                simulateFailure ? "bg-red-500" : "bg-slate-200 dark:bg-white/10"
              )}
            >
              <div className={cn(
                "absolute top-0.5 bottom-0.5 w-3 rounded-full bg-white transition-all",
                simulateFailure ? "left-4.5" : "left-0.5"
              )} />
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

const MethodItem = ({ icon: Icon, label, sub, onClick, hot }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-orange/20 hover:bg-orange/5 transition-all group"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-100 dark:bg-blue-gray rounded-xl flex items-center justify-center text-slate-500 group-hover:text-orange transition-colors">
        <Icon size={20} />
      </div>
      <div className="text-left">
        <p className="text-xs font-black text-navy dark:text-white uppercase tracking-tight">{label}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{sub}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {hot && <span className="bg-orange/10 text-orange text-[8px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">Fast Checkout</span>}
      <ChevronRight size={16} className="text-slate-300 group-hover:text-orange transition-colors" />
    </div>
  </button>
);

const UPIApp = ({ type, active, onClick }: { type: UPIMethod, active: boolean, onClick: () => void }) => {
  const colors = {
    phonepe: "bg-[#5f259f]",
    paytm: "bg-[#00baf2]",
    gpay: "bg-[#34a853]",
    other: "bg-slate-800"
  };

  const labels = {
    phonepe: "PhonePe",
    paytm: "Paytm",
    gpay: "Google Pay",
    other: "Other VPA"
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all",
        active ? "border-orange bg-orange/5" : "border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-blue-gray/20"
      )}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-" + type + "/20", colors[type])}>
        {type === 'phonepe' && <Smartphone size={24} />}
        {type === 'paytm' && <Landmark size={24} />}
        {type === 'gpay' && <GPayIcon size={24} />}
        {type === 'other' && <PhoneIcon size={24} />}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-navy dark:text-white">{labels[type]}</span>
    </button>
  );
};

const ReceiptItem = ({ label, value, bold }: any) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-[9px] font-black uppercase text-slate-400 tracking-[2px]">{label}</span>
    <span className={cn("font-bold text-navy dark:text-white", bold && "font-black")}>{value}</span>
  </div>
);
