import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, Chrome, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered with our protocol.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid credentials. Please verify your access key.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Access key is too weak. Minimum 6 characters required.';
      case 'auth/too-many-requests':
        return 'Access blocked due to multiple failed attempts. Try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in window closed. Please try again.';
      default:
        return 'A technical protocol error occurred. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setShowSwitchPrompt(false);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate(from);
    } catch (err: any) {
      const authErr = err as AuthError;
      setError(getFriendlyErrorMessage(authErr.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowSwitchPrompt(false);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate(from);
    } catch (err: any) {
      const authErr = err as AuthError;
      setError(getFriendlyErrorMessage(authErr.code));
      
      // Special logic for existing users trying to register
      if (!isLogin && authErr.code === 'auth/email-already-in-use') {
        setShowSwitchPrompt(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowSwitchPrompt(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-navy flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-blue-gray/10 w-full max-w-md p-10 rounded-[32px] shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden"
      >
        {/* Visual Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className="text-center mb-10 relative">
          <div className="bg-orange w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-6 text-navy font-black text-2xl shadow-xl shadow-orange/20">
            Q
          </div>
          <h1 className="text-3xl mb-2 font-black tracking-tight text-navy dark:text-white uppercase italic">
            {isLogin ? 'Control Center' : 'Protocol Join'}
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[3px]">
            {isLogin ? 'Auth Required' : 'Identity Registry'}
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest leading-relaxed">
                      {error}
                    </p>
                  </div>
                  
                  {showSwitchPrompt && (
                    <button 
                      onClick={toggleMode}
                      className="bg-red-500 text-white py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all active:scale-95"
                    >
                      Switch to Login Mode <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Protocol Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="USER@DOMAIN.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-navy/50 border border-slate-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold uppercase tracking-widest text-navy dark:text-white focus:border-orange outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Access Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-navy/50 border border-slate-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold uppercase tracking-widest text-navy dark:text-white focus:border-orange outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-5 text-sm active:scale-[0.98] transition-transform shadow-xl shadow-orange/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Execute Login' : 'Register Identity'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-white/5"></div>
            </div>
            <span className="relative bg-white dark:bg-[#1A1F2C] px-6 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[3px]">External Auth</span>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white dark:bg-navy border-2 border-slate-100 dark:border-white/5 text-navy dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-orange transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
          >
            <Chrome size={20} className="text-orange" />
            Continue with Google
          </button>

          <div className="mt-10 text-center">
            <button 
              onClick={toggleMode}
              className="text-[10px] font-black text-slate-400 hover:text-orange uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto group"
            >
              {isLogin ? (
                <>Don't have a protocol ID? <span className="text-orange group-hover:underline">Join Now</span></>
              ) : (
                <>Already in our registry? <span className="text-orange group-hover:underline">Sign In</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

