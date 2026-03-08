/**
 * AdminDashboard.jsx — Admin Report Management
 * Admin can: view all reports, update status, change priority, approve/reject
 */
import React, { useState, useEffect } from 'react';
import { getAllReports, adminUpdateReport } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, CheckCircle, Clock, XCircle,
  RefreshCw, ChevronDown, Loader2, MapPin, Filter
} from 'lucide-react';

const STATUS_OPTIONS   = ['Pending', 'In Progress', 'Completed', 'Rejected'];
const PRIORITY_OPTIONS = ['Low', 'Moderate', 'Critical'];

const STATUS_STYLE = {
  'Pending':     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Completed':   'bg-green-500/10 text-green-400 border-green-500/20',
  'Rejected':    'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_STYLE = {
  'Low':      'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Moderate': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Critical': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminDashboard() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);  // report id being updated
  const [filter, setFilter]       = useState('All');

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return; }
    fetchReports();
  }, [isAdmin]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getAllReports();
      setReports(res.data || []);
    } catch { console.error('Failed to fetch reports'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (reportId, patch) => {
    setUpdating(reportId);
    try {
      const res = await adminUpdateReport(reportId, patch);
      setReports(prev => prev.map(r => r.id === reportId ? res.data : r));
    } catch (err) {
      alert(err?.response?.data?.detail || 'Update failed.');
    } finally { setUpdating(null); }
  };

  const filteredReports = filter === 'All'
    ? reports
    : reports.filter(r => (r.admin_status || r.status) === filter);

  const counts = {
    All:         reports.length,
    Pending:     reports.filter(r => (r.admin_status || r.status) === 'Pending').length,
    'In Progress': reports.filter(r => (r.admin_status || r.status) === 'In Progress').length,
    Completed:   reports.filter(r => (r.admin_status || r.status) === 'Completed').length,
    Rejected:    reports.filter(r => (r.admin_status || r.status) === 'Rejected').length,
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-green-500/20 bg-green-500/10 text-green-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Control Panel
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
            Hazard <span style={{ color: 'var(--primary)' }}>Command</span>
          </h1>
          <p className="text-slate-400 mt-1">Logged in as <span className="font-bold text-white">{user?.name}</span></p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(counts).map(([label, count]) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className={`glass-card rounded-2xl p-5 text-center border transition-all hover:scale-105 ${
              filter === label ? 'border-lavender-500/50' : 'border-white/5'
            }`}
            style={filter === label ? { borderColor: 'var(--primary)', backgroundColor: 'rgba(167,139,250,0.05)' } : {}}
          >
            <div className="text-3xl font-black text-white italic">{count}</div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</div>
          </button>
        ))}
      </div>

      {/* Filter indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Filter className="h-3.5 w-3.5" />
        Showing <span className="text-white font-bold">{filteredReports.length}</span> reports
        {filter !== 'All' && <span>• Filtered by <span className="font-bold" style={{ color: 'var(--primary)' }}>{filter}</span></span>}
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl">
          <p className="text-slate-500 font-bold">No reports found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map(report => {
            const status   = report.admin_status || report.status || 'Pending';
            const priority = report.priority || 'Low';
            const isUpdating = updating === report.id;

            return (
              <div
                key={report.id}
                className="glass-card rounded-2xl border border-white/5 p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:border-white/10 transition-all"
              >
                {/* ID + Type */}
                <div className="lg:col-span-1 text-center">
                  <span className="text-2xl font-black text-slate-600 italic">#{report.id}</span>
                </div>

                {/* Info */}
                <div className="lg:col-span-4 space-y-1">
                  <p className="font-black text-white uppercase text-sm tracking-wide">{report.hazard_type}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {report.area_name || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`}
                  </div>
                  <p className="text-[10px] text-slate-600">
                    {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Severity + Cost */}
                <div className="lg:col-span-2 space-y-1">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                    report.severity === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    report.severity === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>{report.severity}</span>
                  <p className="text-xs text-slate-400 font-bold">₹{report.estimated_cost?.toLocaleString()}</p>
                </div>

                {/* Status Dropdown */}
                <div className="lg:col-span-2">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={status}
                      disabled={isUpdating}
                      onChange={e => handleUpdate(report.id, { admin_status: e.target.value })}
                      className={`w-full appearance-none rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-widest cursor-pointer bg-slate-900 focus:outline-none focus:ring-1 transition-all ${STATUS_STYLE[status] || STATUS_STYLE['Pending']}`}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-60" />
                  </div>
                </div>

                {/* Priority Dropdown */}
                <div className="lg:col-span-2">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Priority</label>
                  <div className="relative">
                    <select
                      value={priority}
                      disabled={isUpdating}
                      onChange={e => handleUpdate(report.id, { priority: e.target.value })}
                      className={`w-full appearance-none rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-widest cursor-pointer bg-slate-900 focus:outline-none focus:ring-1 transition-all ${PRIORITY_STYLE[priority] || PRIORITY_STYLE['Low']}`}
                    >
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-60" />
                  </div>
                </div>

                {/* Approve / Reject */}
                <div className="lg:col-span-1 flex gap-2">
                  <button
                    disabled={isUpdating || report.is_approved}
                    onClick={() => handleUpdate(report.id, { is_approved: true })}
                    title="Approve"
                    className="flex-1 p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-30"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <CheckCircle className="h-4 w-4 mx-auto" />}
                  </button>
                  <button
                    disabled={isUpdating || !report.is_approved}
                    onClick={() => handleUpdate(report.id, { is_approved: false })}
                    title="Reject"
                    className="flex-1 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-30"
                  >
                    <XCircle className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
