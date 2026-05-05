import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, User as UserIcon, LogOut, Menu, X, Calendar, Settings, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AdminLoginModal } from './AdminLoginModal';
import { AnnouncementBanner } from './AnnouncementBanner';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isSessionAdmin, logoutAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBanner />
      
      {isSessionAdmin && (
        <div className="bg-[#1e1e2e] text-orange py-2 px-10 flex items-center justify-between border-b border-orange/20 z-[70]">
          <div className="flex items-center gap-3">
             <ShieldCheck size={14} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[2px]">Admin Mode Active | Superuser Access</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-slate-400">SESSION: <span className="text-white">ADMIN</span></span>
            <button 
              onClick={() => {
                logoutAdmin();
                navigate('/');
              }}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[1px] hover:text-white transition-colors"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      )}

      <header className="h-[80px] border-b border-blue-gray flex items-center bg-navy sticky top-0 z-50">
        <div className="container mx-auto px-10 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tighter">
            <div className="w-8 h-8 bg-orange rounded-md flex items-center justify-center font-black text-navy">
              Q
            </div>
            QUICK FIX <span className="text-orange">AUTO</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className="text-sm font-medium uppercase tracking-[1px] hover:text-orange transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-6">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-sm font-bold text-orange hover:opacity-80 flex items-center gap-1"
                  >
                    ADMIN
                  </Link>
                )}
                <Link to="/dashboard" className="text-sm font-medium uppercase tracking-[1px] hover:text-orange">
                  HISTORY
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-bold text-text-muted hover:text-white"
                >
                  LOGOUT
                </button>
                <Link 
                  to="/booking" 
                  className="bg-orange text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-[1px] hover:opacity-90 transition-all"
                >
                  Book Now
                </Link>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-orange text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-[1px] hover:opacity-90 transition-all"
              >
                Book Now
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-brand-navy border-t border-white/10 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 flex flex-col gap-4 border-t border-white/10">
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-brand-orange font-bold">
                          Admin Panel
                        </Link>
                      )}
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
                      <button onClick={handleLogout} className="text-left text-red-400">Logout</button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login / Register</Link>
                  )}
                  <Link 
                    to="/booking" 
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-brand-orange text-center py-3 rounded-xl font-bold"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="h-[100px] bg-black/20 flex items-center border-t border-blue-gray">
        <div className="container mx-auto px-10 flex justify-between items-center">
          <div className="flex gap-16">
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-orange">15k+</span>
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Happy Clients</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-orange">4.9</span>
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Google Rating</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-orange">24/7</span>
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Support</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <p className="text-xs text-text-muted font-medium">1280 Industrial Pkwy, Suite 400</p>
            {!isAdmin && (
              <button 
                onClick={() => setIsAdminModalOpen(true)}
                className="text-[10px] text-orange/30 hover:text-orange/60 font-bold uppercase transition-colors text-right max-w-[200px]"
              >
                If you are an Admin, please initiate the secure login protocol to access the management panel.
              </button>
            )}
          </div>
        </div>
      </footer>

      <AdminLoginModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
      />
    </div>
  );
};
