import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAsAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAsAdmin(username, password);
    if (success) {
      onClose();
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-orange" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-navy transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange/10 text-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Admin Authentication</h2>
              <p className="text-slate-500 text-sm mt-2">Access restricted to authorized personnel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Identifier</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="USERNAME"
                    className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-xl text-xs font-bold text-navy outline-none focus:border-orange transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-xl text-xs font-bold text-navy outline-none focus:border-orange transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center"
                >
                  {error}
                </motion.p>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  className="btn-primary w-full py-4 text-sm font-black"
                >
                  Confirm Login
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[2px] hover:text-navy transition-colors"
                >
                  Cancel Protocol
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
