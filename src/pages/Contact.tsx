import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

const Contact = () => {
  return (
    <div className="bg-navy min-h-screen py-24">
      <div className="container mx-auto px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div>
                <span className="text-orange font-bold text-xs uppercase tracking-[2px] mb-4 inline-block">Support Terminal</span>
                <h1 className="text-6xl mb-6 tracking-tighter leading-tight">Connect with <br /><span className="text-orange">Mission Control</span></h1>
                <p className="text-text-muted text-lg max-w-lg">Whether you have a question about service or need an urgent repair, our team is standing by.</p>
              </div>

              <div className="space-y-10">
                {[
                  { icon: Phone, title: "Direct Comms", caption: "(555) 123-4567", sub: "Mon-Sat, 8am - 6pm" },
                  { icon: Mail, title: "Data Transmission", caption: "hello@quickfixauto.com", sub: "Priority response" },
                  { icon: MapPin, title: "Geographic Location", caption: "1280 Industrial Pkwy, Suite 400", sub: "Access Terminal" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="w-12 h-12 bg-blue-gray rounded-xl flex items-center justify-center text-text-muted group-hover:bg-orange group-hover:text-navy transition-all duration-300">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{item.title}</h4>
                      <div className="text-lg font-bold text-white mb-1">{item.caption}</div>
                      <div className="text-[10px] text-orange font-bold uppercase tracking-widest">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="booking-panel p-10 lg:p-12 mb-auto"
            >
              <h3 className="text-2xl font-bold mb-8 text-navy tracking-tight">Transmission Form</h3>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-xs font-bold uppercase tracking-widest focus:border-orange transition-all placeholder:text-slate-300 outline-none text-navy" placeholder="IDENTITY NAME" />
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-xs font-bold uppercase tracking-widest focus:border-orange transition-all placeholder:text-slate-300 outline-none text-navy" placeholder="EMAIL ADDRESS" />
                </div>

                <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-xs font-bold uppercase tracking-widest focus:border-orange transition-all outline-none text-navy appearance-none">
                  <option>General Inquiry</option>
                  <option>Booking Problem</option>
                  <option>Custom Quote</option>
                  <option>Feedback</option>
                </select>

                <textarea rows={5} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-xs font-bold uppercase tracking-widest focus:border-orange transition-all outline-none resize-none text-navy placeholder:text-slate-300" placeholder="MESSAGE DATA" />

                <button className="btn-primary w-full text-sm">
                  Execute Transmission
                </button>
              </form>
            </motion.div>
          </div>
          
          <div className="mt-24 rounded-[30px] overflow-hidden grayscale contrast-125 h-96 relative border border-white/5 shadow-2xl">
             <div className="absolute inset-0 bg-navy/40 pointer-events-none"></div>
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjYiTiAxMjLCsDI1JzA5LjgiVw!5e0!3m2!1sen!2sus!4v1!5m2!1sen!2sus" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade">
             </iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
