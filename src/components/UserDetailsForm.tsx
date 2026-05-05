import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Car, Hash, Gauge, MessageSquare, Check, X, Loader2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface UserDetailsFormProps {
  initialData?: any;
  onNext: (data: any) => void;
  loading?: boolean;
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon: any;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (name: string) => void;
  status: 'neutral' | 'error' | 'success';
  error?: string;
}

const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, required = false, value, onChange, onBlur, status, error }: InputFieldProps) => {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <div className="relative group">
        <div className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
          status === 'error' ? "text-red-400" : status === 'success' ? "text-green-500" : "text-slate-300 group-focus-within:text-orange"
        )}>
          <Icon size={14} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          className={cn(
            "input-standard",
            status === 'error' ? "border-red-200 focus:border-red-400 dark:border-red-500/30" : 
            status === 'success' ? "border-green-100 focus:border-green-300 dark:border-green-500/30" : 
            "border-slate-100 dark:border-white/10"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {status === 'error' && <X size={14} className="text-red-400 animate-in zoom-in duration-300" />}
          {status === 'success' && <Check size={14} className="text-green-500 animate-in zoom-in duration-300" />}
        </div>
      </div>
      {status === 'error' && (
        <p className="text-[10px] text-red-500 font-bold ml-1 animate-in slide-in-from-top-1 duration-200">{error}</p>
      )}
    </div>
  );
};

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ initialData, onNext, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    carMake: '',
    carModel: '',
    year: '',
    licensePlate: '',
    mileage: '',
    specialNotes: ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      // Handle both fullName and name for backward compatibility/flexibility
      const personalInfo = initialData.personal || {};
      setFormData(prev => ({
        ...prev,
        fullName: personalInfo.fullName || personalInfo.name || prev.fullName,
        email: personalInfo.email || prev.email,
        phone: personalInfo.phone || prev.phone,
        carMake: initialData.car?.make || prev.carMake,
        carModel: initialData.car?.model || prev.carModel,
        year: initialData.car?.year?.toString() || prev.year,
        licensePlate: initialData.car?.licensePlate || prev.licensePlate,
        mileage: initialData.car?.mileage?.toString() || prev.mileage,
      }));
    }
  }, [initialData]);

  // Derived validation state - calculated on every render
  const errors: Record<string, string> = (() => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    // Flexible phone validation: count only digits
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (digitsOnly.length !== 10) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.carMake.trim()) {
      newErrors.carMake = 'Car make is required';
    }

    if (!formData.carModel.trim()) {
      newErrors.carModel = 'Car model is required';
    }

    const yearVal = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    if (!formData.year.trim()) {
      newErrors.year = 'Manufacture year is required';
    } else if (isNaN(yearVal) || yearVal < 1980 || yearVal > currentYear + 1) {
      newErrors.year = `Enter a valid year (1980–${currentYear + 1})`;
    }

    return newErrors;
  })();

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const getInputStatus = (name: string) => {
    if (!touched[name]) return 'neutral';
    return errors[name] ? 'error' : 'success';
  };

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xs font-black text-orange uppercase tracking-[2px] mb-6 flex items-center gap-2">
          <User size={14} /> Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField 
            label="Full Name" 
            name="fullName" 
            placeholder="JOHN DOE" 
            icon={User} 
            required 
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            status={getInputStatus('fullName')}
            error={errors.fullName}
          />
          <InputField 
            label="Phone Number" 
            name="phone" 
            type="tel" 
            placeholder="10-DIGIT MOBILE" 
            icon={Phone} 
            required 
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            status={getInputStatus('phone')}
            error={errors.phone}
          />
          <div className="md:col-span-2">
            <InputField 
              label="Email Address" 
              name="email" 
              type="email" 
              placeholder="EMAIL@EXAMPLE.COM" 
              icon={Mail} 
              required 
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              status={getInputStatus('email')}
              error={errors.email}
            />
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-100">
        <h3 className="text-xs font-black text-orange uppercase tracking-[2px] mb-6 flex items-center gap-2">
          <Car size={14} /> Car Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <InputField 
            label="Car Make" 
            name="carMake" 
            placeholder="E.G. TOYOTA" 
            icon={Car} 
            required 
            value={formData.carMake}
            onChange={handleChange}
            onBlur={handleBlur}
            status={getInputStatus('carMake')}
            error={errors.carMake}
          />
          <InputField 
            label="Car Model" 
            name="carModel" 
            placeholder="E.G. CAMRY" 
            icon={Car} 
            required 
            value={formData.carModel}
            onChange={handleChange}
            onBlur={handleBlur}
            status={getInputStatus('carModel')}
            error={errors.carModel}
          />
          <InputField 
            label="Year" 
            name="year" 
            type="number" 
            placeholder="2022" 
            icon={Clock} 
            required 
            value={formData.year}
            onChange={handleChange}
            onBlur={handleBlur}
            status={getInputStatus('year')}
            error={errors.year}
          />
          <InputField 
            label="License Plate" 
            name="licensePlate" 
            placeholder="ABC-1234" 
            icon={Hash} 
            value={formData.licensePlate}
            onChange={handleChange}
            onBlur={handleBlur}
            status={getInputStatus('licensePlate')}
            error={errors.licensePlate}
          />
          <div className="md:col-span-2">
            <InputField 
              label="Mileage (km)" 
              name="mileage" 
              type="number" 
              placeholder="CURRENT ODOMETER" 
              icon={Gauge} 
              value={formData.mileage}
              onChange={handleChange}
              onBlur={handleBlur}
              status={getInputStatus('mileage')}
              error={errors.mileage}
            />
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-100">
        <h3 className="text-xs font-black text-orange uppercase tracking-[2px] mb-6 flex items-center gap-2">
          <MessageSquare size={14} /> Additional Notes
        </h3>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Notes</label>
          <textarea
            name="specialNotes"
            value={formData.specialNotes}
            onChange={handleChange}
            rows={4}
            placeholder="Any specific issues or requests for the mechanic?"
            className="input-standard-no-icon resize-none"
          />
        </div>
      </div>

      <div className="pt-10">
        <button
          onClick={() => onNext(formData)}
          disabled={!isValid || loading}
          className={cn(
            "btn-primary w-full flex items-center justify-center gap-3 py-5 text-sm uppercase tracking-widest",
            (!isValid || loading) && "opacity-20 cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Processing Transmission
            </>
          ) : (
            "Continue to Review"
          )}
        </button>
      </div>
    </div>
  );
};

export default UserDetailsForm;
