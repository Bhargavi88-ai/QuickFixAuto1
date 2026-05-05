import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Star, Clock, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { SERVICES } from '../constants';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero & Booking Preview Section */}
      <section className="relative min-h-[calc(100vh-180px)] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-center">
            
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <span className="text-orange font-bold text-sm uppercase tracking-[2px] mb-4">
                Maintenance Reimagined
              </span>
              <h1 className="text-6xl lg:text-[80px] font-extrabold leading-[1.1] mb-8 tracking-tighter">
                Precision Care<br />For Every <span className="text-orange">Road.</span>
              </h1>
              <p className="text-lg text-text-muted mb-10 max-w-lg leading-relaxed">
                Certified mechanics. Transparent pricing. Fast digital booking. Experience car maintenance built for the modern world.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {SERVICES.slice(0, 4).map((service, i) => (
                  <div key={service.id} className="service-card group hover:border-orange/30">
                    <h3 className="text-base font-bold mb-1">{service.name}</h3>
                    <p className="text-xs text-text-muted">{service.duration} mins • Professional Care</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Booking Preview Pane (Simulated) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="booking-panel"
            >
              <div className="flex gap-2 mb-2">
                <div className="h-1 flex-1 bg-orange rounded-full"></div>
                <div className="h-1 flex-1 bg-orange rounded-full"></div>
                <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
              </div>
              
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-navy mb-1">Schedule Service</h2>
                <p className="text-sm text-slate-500 font-medium">Select a date for your Engine Diagnostics</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Slots</label>
                <div className="grid grid-cols-7 gap-1 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <div key={i} className="text-[10px] font-black text-slate-300 mb-2">{d}</div>
                  ))}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "py-2 text-xs font-bold rounded-lg cursor-pointer",
                        i === 6 ? "bg-orange text-white" : "text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Car Details</label>
                <div className="flex gap-2">
                  <input readOnly value="Toyota" className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold text-navy" />
                  <input readOnly value="Camry (2022)" className="flex-[1.5] bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold text-navy" />
                </div>
              </div>

              <Link to="/booking" className="btn-primary flex items-center justify-center mt-4">
                Confirm Service Date
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-navy text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl mb-8 leading-tight">Ready to experience <br /> superior auto care?</h2>
          <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto">
            Book your slot online in less than 2 minutes. We'll handle the rest while you enjoy a coffee in our professional lounge.
          </p>
          <Link
            to="/booking"
            className="inline-block bg-brand-orange text-white px-10 py-5 rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-brand-orange/40"
          >
            Schedule Your Visit
          </Link>
        </div>
      </section>

      {/* Location/Hours Info */}
      <section className="py-12 bg-brand-gray border-t border-brand-navy/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center gap-12 text-sm font-bold">
            <div className="flex items-center gap-4">
              <MapPin className="text-brand-orange" />
              <span>123 Auto Lane, Tech City</span>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="text-brand-orange" />
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="text-brand-orange" />
              <span>Mon-Sat: 8am - 6pm</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
