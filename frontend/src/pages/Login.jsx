/**
 * Login.jsx — Role-based Login Page
 * Role selector: Admin / User
 * Fields: User ID + Password
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole]         = useState('user');    // 'user' | 'admin'
  const [userId, setUserId]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await loginUser({ user_login_id: userId, password, role });
      login(res.data);
      
      // Determine redirection based on role and profile completion
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else if (!res.data.profile_completed) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10" style={{ background: 'var(--primary)' }}>
            <LogIn className="h-9 w-9 text-slate-900" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
            Neural <span style={{ color: 'var(--primary)' }}>Access</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Select your role and authenticate</p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-white/5 rounded-2xl p-1.5 mb-6 border border-white/10">
          {[
            { key: 'user',  label: 'User',  icon: User },
            { key: 'admin', label: 'Admin', icon: ShieldCheck },
          ].map(r => (
            <button
              key={r.key}
              onClick={() => { setRole(r.key); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all ${
                role === r.key
                  ? 'text-slate-900 shadow-lg'
                  : 'text-slate-500 hover:text-white'
              }`}
              style={role === r.key ? { backgroundColor: 'var(--primary)' } : {}}
            >
              <r.icon className="h-4 w-4" />
              {r.label}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="glass-card rounded-3xl p-8 space-y-5 border border-white/10">

          {/* User ID */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {role === 'admin' ? 'Admin ID' : 'User ID'}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder={role === 'admin' ? 'admin123' : 'your_user_id'}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold text-sm outline-none focus:border-lavender-500 focus:bg-white/10 transition-all placeholder-slate-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white font-bold text-sm outline-none focus:border-lavender-500 focus:bg-white/10 transition-all placeholder-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-4 py-3 text-xs font-bold">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest text-slate-900 transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <><LogIn className="h-4 w-4" /> Login as {role === 'admin' ? 'Admin' : 'User'}</>
            )}
          </button>

          {/* Register link (users only) */}
          {role === 'user' && (
            <p className="text-center text-xs text-slate-500">
              No account?{' '}
              <Link to="/register" className="font-black hover:text-white transition-colors" style={{ color: 'var(--primary)' }}>
                Register Here
              </Link>
            </p>
          )}
        </form>

        {/* Admin hint */}
        {role === 'admin' && (
          <p className="text-center text-xs text-slate-600 mt-4">
            Default: <span className="text-slate-400 font-bold">admin123</span> / <span className="text-slate-400 font-bold">admin@123</span>
          </p>
        )}
      </div>
    </div>
  );
}
