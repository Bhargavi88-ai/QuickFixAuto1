/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages (to be created)
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ children, requireAdmin }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange"></div>
    </div>
  );
  
  if (!user && requireAdmin) return <Navigate to="/login" />;
  
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy px-10">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <X size={40} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4">Access Denied</h2>
          <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">
            Sorry, Admin features are only available after logging in as Admin. 
            Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/booking" element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
