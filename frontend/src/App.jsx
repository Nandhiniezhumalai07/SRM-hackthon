import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { Map, AlertTriangle, LayoutDashboard, Trophy, User, Menu, X, ChevronRight,
         Activity, Headset, ShieldCheck, UserPlus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

// Pages
import MapView        from './pages/MapView';
import Dashboard      from './pages/Dashboard';
import ReportHazard   from './pages/ReportHazard';
import Profile        from './pages/Profile';
import Register       from './pages/Register';
import Login          from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Status         from './pages/Status';
import Support        from './pages/Support';
import Leaderboard    from './components/Leaderboard';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/',           label: 'Environment',  icon: Map },
    { path: '/leaderboard',label: 'Championship',  icon: Trophy },
    { path: '/dashboard',  label: 'Analytics',     icon: LayoutDashboard },
    { path: '/status',     label: 'Status',        icon: Activity },
  ];

  const getInitials = (name) => {
    if (!name) return null;
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  const initials = getInitials(user?.name);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#1e293b] flex text-slate-100 overflow-x-hidden">

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 z-[100] h-full w-80 glass-sidebar flex flex-col p-8 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        {/* Logo */}
        <div className="flex items-center space-x-4 mb-16 px-2">
          <div className="bg-lavender-500 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(167,139,250,0.4)]" style={{ backgroundColor: 'var(--primary)' }}>
            <AlertTriangle className="h-6 w-6 text-slate-900" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-black-italic tracking-tighter text-white leading-none uppercase">
              ROADWATCH <span style={{ color: 'var(--primary)' }}>AI</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-black">Guardian v2.0</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-3">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-6 py-4 rounded-2xl transition-all group font-black uppercase text-[11px] tracking-[0.2em] ${
                  isActive ? 'nav-item-active' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-4">
                <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100" />
            </NavLink>
          ))}

          {/* Admin Dashboard link — only visible to admins */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center justify-between px-6 py-4 rounded-2xl transition-all group font-black uppercase text-[11px] tracking-[0.2em] ${
                  isActive ? 'nav-item-active' : 'text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-400'
                }`
              }
            >
              <div className="flex items-center space-x-4">
                <ShieldCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Admin Panel</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100" />
            </NavLink>
          )}

          <NavLink
            to="/support"
            className={({ isActive }) =>
              `flex items-center justify-between px-6 py-4 rounded-2xl transition-all group font-black uppercase text-[11px] tracking-[0.2em] ${
                isActive ? 'nav-item-active' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <Headset className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Help &amp; Support</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100" />
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto pt-8 border-t border-white/5 space-y-3">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
          <Link
            to="/report"
            className="premium-gradient text-slate-900 w-full py-5 rounded-2xl font-black flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(167,139,250,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-[11px] uppercase tracking-[0.3em]"
          >
            <Activity className="h-4 w-4" />
            <span>Deploy Report</span>
          </Link>
        </div>
      </aside>

      {/* ── Hamburger ─────────────────────────────────────── */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-8 left-8 z-[110] bg-[#2e4482]/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 hover:bg-[#2e4482]/60 transition-all shadow-2xl group"
      >
        {isSidebarOpen
          ? <X    className="h-6 w-6 text-white" />
          : <Menu className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />}
      </button>

      {/* ── Glowing Register / Profile Icon (top-right) ───── */}
      <div className="fixed top-8 right-8 z-[110] flex items-center gap-3">

        {/* Round Register Icon with glow */}
        <Link to="/register" className="group relative">
          {/* Glow ring — pulses */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none" style={{ backgroundColor: 'var(--primary)' }} />
          {/* Hover glow blur */}
          <span className="absolute -inset-2 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: 'var(--primary)' }} />

          {/* Tooltip */}
          <span className="absolute top-full mt-3 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0 whitespace-nowrap">
            <span className="block bg-slate-900/90 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl text-white" style={{ borderColor: 'var(--primary)' }}>
              Register Here
            </span>
          </span>

          {/* Button */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110 shadow-2xl"
            style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            <UserPlus className="h-5 w-5 text-slate-900" />
          </div>
        </Link>

        {/* Profile / Avatar Icon */}
        <Link to={isLoggedIn ? '/profile' : '/login'} className="group relative">
          <div className="absolute -inset-2 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: 'var(--primary)' }} />

          {/* Tooltip */}
          <span className="absolute top-full mt-3 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0 whitespace-nowrap">
            <span className="block bg-slate-900/90 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
              {isAdmin ? '⚡ Admin' : initials ? 'My Profile' : 'Login'}
            </span>
          </span>

          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-slate-900/40 backdrop-blur-xl group-hover:scale-110 shadow-2xl ${
            isAdmin ? 'border-amber-500/60' : initials ? '' : 'border-white/10'
          }`}
            style={initials && !isAdmin ? { borderColor: 'var(--primary)' } : {}}
          >
            {isAdmin ? (
              <ShieldCheck className="h-5 w-5 text-amber-400" />
            ) : initials ? (
              <span className="text-sm font-black text-white italic">{initials}</span>
            ) : (
              <User className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </div>
        </Link>
      </div>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto p-8 pt-24 lg:pt-12">
          <Routes>
            <Route path="/"           element={<MapView />} />
            <Route path="/report"     element={<ReportHazard />} />
            <Route path="/profile"    element={<Profile />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/admin"      element={<AdminDashboard />} />
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/leaderboard"element={<Leaderboard />} />
            <Route path="/status"     element={<Status />} />
            <Route path="/support"    element={<Support />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
