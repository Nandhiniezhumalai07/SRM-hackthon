/**
 * Profile.jsx — Citizen Identity Registration & Login
 * 
 * Uses AuthContext for global state management.
 * If user already exists (isLoggedIn), shows their current profile.
 * Otherwise shows the registration form.
 */
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, AlignLeft, CheckCircle, Save, Sparkles, ShieldCheck, Globe, Milestone, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, isLoggedIn, login, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    city: user?.city || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    constituency: user?.constituency || '',
    village: user?.village || '',
    ward: user?.ward || '',
    panchayat: user?.panchayat || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city) {
      alert('Name and City are required fields.');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await createUser(formData);
      login(response.data); // ← Updates global auth state instantly
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate('/leaderboard'), 2500);
    } catch (error) {
      console.error('Error creating profile:', error);
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      if (status === 409 || detail?.toLowerCase().includes('unique')) {
        alert('This email is already registered. Please use a different email.');
      } else if (!status) {
        alert('Cannot reach backend. Make sure the server is running on port 8000.');
      } else {
        alert(`Registration failed: ${detail || error.message}`);
      }
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/profile');
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full p-12 glass-card rounded-[3rem] text-center border-white/10 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-lavender-500/20 border border-lavender-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-12 w-12" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-3 italic uppercase">Identity Synced</h2>
          <p className="text-slate-400 mb-6">Welcome, <span className="text-white font-black">{formData.name}</span>. Redirecting...</p>
          <div className="flex items-center justify-center space-x-2 mb-6" style={{ color: 'var(--primary)' }}>
            <Sparkles className="h-5 w-5" />
            <span className="font-black text-xl tracking-tighter uppercase italic">+0 Spectral Points</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full animate-progress w-full transition-all duration-[2500ms]" style={{ backgroundColor: 'var(--primary)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ── Already Logged In View ─────────────────────────────────────────────────
  if (isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-green-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Identity Active</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">
            Neural <span style={{ color: 'var(--primary)' }}>Registry</span>
          </h1>
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl text-white border-2" style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase">{user.name}</h2>
              <p className="text-slate-400 text-sm">{user.city} • {user.points || 0} pts</p>
              <p className="text-slate-500 text-xs mt-1">{user.email}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            {[
              { label: 'Constituency', value: user.constituency },
              { label: 'Village', value: user.village },
              { label: 'Ward', value: user.ward },
              { label: 'Panchayat', value: user.panchayat },
              { label: 'Phone', value: user.phone },
            ].filter(f => f.value).map(f => (
              <div key={f.label}>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.label}</p>
                <p className="text-sm font-bold text-white">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button
              onClick={() => { logout(); }}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-500/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            <button
              onClick={() => navigate('/report')}
              className="flex-2 flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-slate-900 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Sparkles className="h-4 w-4" />
              Deploy Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ─────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-lavender-500/10 blur-[100px] -z-10"></div>
        <div className="inline-flex items-center space-x-2 bg-lavender-500/10 text-lavender-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-lavender-500/20">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Citizen Registration</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">
          Neural <span style={{ color: 'var(--primary)' }}>Registry</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
          Initialize your citizen identity to report hazards, earn points, and join the leaderboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Core Identity</h3>
          {[
            { label: 'Full Name *', name: 'name', icon: User, placeholder: 'Your legal name', type: 'text', required: true },
            { label: 'City *', name: 'city', icon: MapPin, placeholder: 'Mumbai, Delhi, etc.', type: 'text', required: true },
            { label: 'Email Address', name: 'email', icon: Mail, placeholder: 'you@example.com', type: 'email' },
            { label: 'Phone Number', name: 'phone', icon: Phone, placeholder: '+91 98765 43210', type: 'tel' },
          ].map(field => (
            <div key={field.name} className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
              <div className="relative">
                <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-sm outline-none focus:border-lavender-500 focus:bg-white/10 transition-all placeholder-slate-600"
                  style={{ '--tw-ring-color': 'var(--primary)' }}
                />
              </div>
            </div>
          ))}

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bio</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 h-4 w-4 text-slate-500" />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief description..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-sm outline-none focus:border-lavender-500 focus:bg-white/10 transition-all placeholder-slate-600 resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Jurisdiction Anchoring</h3>
          {[
            { label: 'Constituency ID', name: 'constituency', icon: Globe, placeholder: 'e.g. 73-Vanur' },
            { label: 'Village Hub', name: 'village', icon: MapPin, placeholder: 'Village name' },
            { label: 'Ward Signal', name: 'ward', icon: Milestone, placeholder: 'Ward No.' },
            { label: 'Council Metadata', name: 'panchayat', icon: ShieldCheck, placeholder: 'Gram Panchayat name' },
          ].map(field => (
            <div key={field.name} className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
              <div className="relative">
                <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-sm outline-none focus:border-lavender-500 focus:bg-white/10 transition-all placeholder-slate-600"
                />
              </div>
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group mt-4"
          >
            <div className="absolute inset-0 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}></div>
            <div className="relative bg-slate-100 text-slate-900 font-black text-lg py-6 rounded-[2rem] shadow-2xl group-hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 premium-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isSubmitting ? (
                <span className="flex items-center relative z-10">
                  <svg className="animate-spin mr-4 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </span>
              ) : (
                <span className="flex items-center relative z-10 italic uppercase tracking-tighter text-2xl group-hover:scale-110 transition-transform">
                  Activate Neural ID <Save className="h-7 w-7 ml-3 group-hover:translate-y-[-4px] transition-transform" />
                </span>
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
