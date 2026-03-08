/**
 * CompleteProfile.jsx — Neural ID Configuration Gateway
 * Forced step immediately after registration. Traps user until completed.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Mail, Phone, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { updateUserProfile } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function CompleteProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill existing data from AuthContext
  const [form, setForm] = useState({
    name:         user?.name || '',
    city:         user?.city || '',
    email:        user?.email || '',
    phone:        user?.phone || '',
    constituency: user?.constituency || '',
    village:      user?.village || '',
    ward:         user?.ward || '',
    panchayat:    user?.panchayat || '',
    bio:          user?.bio || ''
  });

  // If they somehow land here and already completed it, boot them to dashboard
  useEffect(() => {
    if (user?.profile_completed) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Send update patch to backend (which also flips profile_completed = True)
      const res = await updateUserProfile(user.id, form);
      
      // 2. Sync local context
      updateUser(res.data);
      
      // 3. Let AuthContext effect catch it, or manually redirect:
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to activate Neural ID. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden text-slate-100">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lavender-500/10 rounded-full blur-[120px] pointer-events-none -z-10" style={{ backgroundColor: 'var(--primary)' }} />

      <div className="w-full max-w-4xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400 font-black uppercase tracking-widest text-[10px] mb-6">
            <Cpu className="h-4 w-4" />
            <span>Neural ID Generation</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
            Activate <span style={{ color: 'var(--primary)' }}>Profile</span>
          </h1>
          <p className="text-slate-400 font-bold max-w-lg mx-auto leading-relaxed">
            Welcome to RoadWatch AI. To access the dashboard and begin reporting hazards, you must complete your Guardian Neural ID.
          </p>
        </div>

        {/* Main Card */}
        <form onSubmit={handleSubmit} className="glass-card border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-slate-900/40">
           
           <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

           {error && (
             <div className="mb-8 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wide">
               <ShieldAlert className="h-4 w-4 shrink-0" />
               {error}
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-6 flex items-center gap-2">
                  <User className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Personal Data
                </h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name *</label>
                  <input required type="text" name="name" value={form.name} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bio (Optional)</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors resize-none" placeholder="Tell us about your community..." />
                </div>
              </div>

              {/* Right Column: Location Data */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-6 flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Demographics
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">City *</label>
                  <input required type="text" name="city" value={form.city} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Constituency</label>
                    <input type="text" name="constituency" value={form.constituency} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ward No.</label>
                    <input type="text" name="ward" value={form.ward} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Village Hub</label>
                  <input type="text" name="village" value={form.village} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gram Panchayat</label>
                  <input type="text" name="panchayat" value={form.panchayat} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-lavender-500 transition-colors" />
                </div>

              </div>

           </div>

           {/* Submit Button */}
           <div className="mt-12 pt-8 border-t border-white/5 relative z-10 flex justify-end">
             <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-12 py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest text-slate-900 border-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(167,139,250,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
                style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
             >
               {loading ? (
                 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                 </svg>
               ) : (
                 <><CheckCircle2 className="h-5 w-5" /> Activate Neural ID</>
               )}
             </button>
           </div>
        </form>

      </div>
    </div>
  );
}
