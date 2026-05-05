import React from 'react';
import { motion } from 'motion/react';
import { Car, Wrench, Users, ShieldCheck, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-navy min-h-screen">
      <section className="py-24 overflow-hidden relative border-b border-blue-gray">
         <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
         <div className="container mx-auto px-10 relative z-10">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="max-w-3xl"
            >
              <span className="text-orange font-bold text-xs uppercase tracking-[2px] mb-4 inline-block">The Protocol</span>
              <h1 className="text-5xl md:text-7xl mb-6">Mastering the <span className="text-orange">Automotive</span> Matrix</h1>
              <p className="text-text-muted text-lg leading-relaxed max-w-xl">
                Founded in 2012, Quick Fix Auto has evolved from a local garage to a tech-driven service powerhouse, serving over 15,000 recorded vehicle sessions.
              </p>
            </motion.div>
         </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
             <div className="relative">
                <img 
                  src="https://picsum.photos/seed/mechanic/800/1000" 
                  alt="Mechanic" 
                  className="rounded-[30px] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-10 -right-10 bg-orange p-10 rounded-[20px] hidden lg:block text-navy">
                   <div className="text-5xl font-black mb-1">12+</div>
                   <div className="font-bold uppercase text-[10px] tracking-widest">Years of Precision</div>
                </div>
             </div>
             
             <div className="space-y-12">
                <h2 className="text-4xl md:text-5xl tracking-tighter">Engineering Trust, <br /> At High <span className="text-orange">Frequency.</span></h2>
                <div className="space-y-10">
                   {[
                     { 
                       title: "Advanced System Diagnostics", 
                       text: "Factory-grade computational analysis for modern vehicle ecosystems.",
                       icon: <ShieldCheck className="text-orange" />
                     },
                     { 
                       title: "Certified Matrix Technicians", 
                       text: "Exhaustive training protocols in mechanical optimization.",
                       icon: <Users className="text-orange" />
                     },
                     { 
                       title: "Industrial Grade Hardware", 
                       text: "OEM-standard components for long-term structural integrity.",
                       icon: <Wrench className="text-orange" />
                     }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-6 group">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-gray rounded-xl flex items-center justify-center group-hover:bg-orange group-hover:text-navy transition-all duration-300">
                           {item.icon}
                        </div>
                        <div>
                           <h4 className="font-bold text-lg mb-1 tracking-tight">{item.title}</h4>
                           <p className="text-text-muted text-sm leading-relaxed">{item.text}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-brand-gray">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl mb-16">The Minds Behind the Wrench</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { name: "John Weaver", role: "Master Technician", img: "https://picsum.photos/seed/team1/400/500" },
                 { name: "Sarah Engine", role: "Diagnostics lead", img: "https://picsum.photos/seed/team2/400/500" },
                 { name: "Mike Brake", role: "Service Manager", img: "https://picsum.photos/seed/team3/400/500" }
               ].map((person, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ y: -10 }}
                   className="bg-white p-6 rounded-[2.5rem] shadow-sm"
                 >
                    <img src={person.img} className="rounded-3xl mb-6 w-full aspect-[4/5] object-cover" referrerPolicy="no-referrer" />
                    <h4 className="text-xl font-bold">{person.name}</h4>
                    <p className="text-brand-orange text-xs font-black uppercase tracking-widest mt-1">{person.role}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default About;
