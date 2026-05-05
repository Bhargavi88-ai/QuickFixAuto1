import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Car, Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate(from);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate(from);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="booking-panel w-full max-w-md p-10"
      >
        <div className="text-center mb-8">
          <div className="bg-orange w-12 h-12 rounded-lg mx-auto flex items-center justify-center mb-6 text-navy font-black text-xl">
            Q
          </div>
          <h1 className="text-3xl mb-2 font-bold tracking-tight text-navy">{isLogin ? 'Control Center' : 'Protocol Join'}</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Authorized Access Only</p>
        </div>

        <div className="">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black mb-6 border border-red-100 uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="relative">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-xs font-bold uppercase tracking-widest text-navy focus:border-orange outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="relative">
              <input 
                type="password" 
                placeholder="ACCESS KEY"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-xs font-bold uppercase tracking-widest text-navy focus:border-orange outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Execute Login' : 'Register Identity')}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-[2px]">Alternate Protocol</span>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-100 text-navy py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
          >
            <Chrome size={18} className="text-orange" />
            Continue with Google
          </button>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-brand-navy/40 hover:text-brand-orange transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
