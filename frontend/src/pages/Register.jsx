/**
 * Register.jsx — New User Registration Page
 * Fields: User ID, Password, Name, Phone, Email
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Phone, Mail, UserPlus, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { registerUser } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ user_login_id: '', password: '', name: '', phone: '', email: '', city: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_login_id || !form.password || !form.name) {
      setError('User ID, Password and Name are required.'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await registerUser(form);
      login(res.data);
      setSuccess(true);
      setTimeout(() => navigate('/activate-profile'), 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4 glass-card p-12 rounded-3xl">
          <CheckCircle className="h-16 w-16 mx-auto" style={{ color: 'var(--primary)' }} />
          <h2 className="text-3xl font-black text-white italic uppercase">Registered!</h2>
          <p className="text-slate-400">Welcome, {form.name}. Redirecting...</p>
        </div>
      </div>
    );
  }

  const fields = [
    { name: 'user_login_id', label: 'User ID *', icon: User, placeholder: 'unique_username', type: 'text' },
    { name: 'password',      label: 'Password *', icon: Lock, placeholder: '••••••••',        type: showPwd ? 'text' : 'password', action: () => setShowPwd(!showPwd), actionIcon: showPwd ? EyeOff : Eye },
    { name: 'name',          label: 'Full Name *', icon: User, placeholder: 'Your name',       type: 'text' },
    { name: 'phone',         label: 'Phone',       icon: Phone, placeholder: '+91 98765 43210', type: 'tel' },
    { name: 'email',         label: 'Email',       icon: Mail,  placeholder: 'you@example.com', type: 'email' },
    { name: 'city',          label: 'City',        icon: User,  placeholder: 'Mumbai',           type: 'text' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10" style={{ background: 'var(--primary)' }}>
            <UserPlus className="h-9 w-9 text-slate-900" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
            Create <span style={{ color: 'var(--primary)' }}>Account</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Register as a citizen guardian</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-5 border border-white/10">
          {fields.map(f => (
            <div key={f.name} className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{f.label}</label>
              <div className="relative">
                <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white font-bold text-sm outline-none focus:border-lavender-500 focus:bg-white/10 transition-all placeholder-slate-600"
                />
                {f.action && (
                  <button type="button" onClick={f.action} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    <f.actionIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-4 py-3 text-xs font-bold">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest text-slate-900 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading
              ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : <><UserPlus className="h-4 w-4" /> Create Account</>
            }
          </button>

          <p className="text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-black hover:text-white transition-colors" style={{ color: 'var(--primary)' }}>
              Login Here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
