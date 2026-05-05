import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../constants';
import { Clock, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

const Services = () => {
  return (
    <div className="bg-navy min-h-screen py-24">
      <div className="container mx-auto px-10">
        <div className="max-w-3xl mb-16">
          <span className="text-orange font-bold text-xs uppercase tracking-[2px] mb-4 inline-block">Service Catalog</span>
          <h1 className="text-6xl mb-6">Expert Maintenance</h1>
          <p className="text-text-muted text-lg max-w-xl">
            Precision care for every component. Our certified technicians use state-of-the-art equipment to ensure your vehicle performs at its peak.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="service-card flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-orange/10 text-orange rounded-lg flex items-center justify-center mb-6">
                  <service.icon size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">{service.name}</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-8">
                  {service.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xl font-black">{formatCurrency(service.price)}</div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{service.duration} MINS</div>
                </div>
                <Link
                  to="/booking"
                  state={{ serviceId: service.id }}
                  className="bg-orange p-3 rounded-lg text-white hover:opacity-90 transition-all"
                >
                  <Clock size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
