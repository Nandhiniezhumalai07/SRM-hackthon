import React from 'react';
import { AlertTriangle, TrendingUp, Info, Wrench, ShieldAlert, IndianRupee } from 'lucide-react';

const SEVERITY_STYLES = {
  Low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  High: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const PRIORITY_STYLES = {
  Low: { color: 'text-slate-400', bg: 'bg-slate-500/10' },
  Moderate: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  Critical: { color: 'text-red-500', bg: 'bg-red-500/10', pulse: true },
};

export default function HazardCard({ report }) {
  const sevStyle = SEVERITY_STYLES[report.severity] || SEVERITY_STYLES.Low;
  const prioStyle = PRIORITY_STYLES[report.priority] || PRIORITY_STYLES.Low;

  return (
    <div className={`glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden group hover:border-lavender-500/30 transition-all duration-500`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-lavender-500/5 rounded-full blur-3xl -z-10 group-hover:bg-lavender-500/10 transition-all"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-2xl ${sevStyle.bg} ${sevStyle.color} border ${sevStyle.border}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase italic tracking-tight text-xl">{report.hazard_type}</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Report ID: #{report.id}</p>
          </div>
        </div>
        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${prioStyle.bg} ${prioStyle.color} border border-white/5 flex items-center space-x-2`}>
           {prioStyle.pulse && <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></div>}
           <span>{report.priority} PRIORITY</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Severity Assessment</span>
           <span className={`text-sm font-black uppercase italic ${sevStyle.color}`}>{report.severity}</span>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Estimated Cost</span>
           <div className="flex items-center space-x-1">
              <IndianRupee className="h-3 w-3 text-white" />
              <span className="text-sm font-black text-white italic">{report.estimated_cost?.toLocaleString()}</span>
           </div>
        </div>
      </div>

      <div className="bg-lavender-500/5 border border-lavender-500/20 p-4 rounded-2xl mb-2">
         <div className="flex items-center space-x-3 mb-2">
            <Wrench className="h-4 w-4 text-lavender-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Recommended Action</span>
         </div>
         <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
            {report.recommended_action}
         </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
         <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>Added {new Date(report.created_at).toLocaleDateString()}</span>
         </div>
         <button className="text-lavender-400 hover:text-white transition-colors flex items-center space-x-1 group/btn">
            <span>Neural Details</span>
            <TrendingUp className="h-3 w-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
         </button>
      </div>
    </div>
  );
}

// Simple Clock icon for internal use
function Clock({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
