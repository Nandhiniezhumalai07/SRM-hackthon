import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, CheckCircle, Search, CheckSquare, Flag, Hammer, Clock, Info, ShieldCheck, Loader2, ChevronDown, AlertTriangle } from 'lucide-react';

const STATUS_STAGES = [
  { id: 1, label: "Submitted", icon: Activity, desc: "Hazard report successfully logged with telemetry." },
  { id: 2, label: "Under Review", icon: Search, desc: "AI validation and municipal verification in progress." },
  { id: 3, label: "Hazard Verified", icon: CheckSquare, desc: "Structural threat confirmed for resolution." },
  { id: 4, label: "Sent to Government", icon: Flag, desc: "Forwarded to local municipal engineering department." },
  { id: 5, label: "In Progress", icon: Hammer, desc: "Repair crews deployed to the localized coordinate." },
  { id: 6, label: "Completed", icon: CheckCircle, desc: "Road condition restored and verified via neural feedback." },
];

export default function Status() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredStage, setHoveredStage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:8000/reports/');
        setReports(response.data);
        if (response.data.length > 0) {
          setSelectedReport(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching reports for status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getStageIndex = (status) => {
    switch (status) {
      case 'Submitted': return 1;
      case 'Pending': return 1; // Fallback for old data
      case 'Under Review': return 2;
      case 'Hazard Verified': return 3;
      case 'Sent to Government': return 4;
      case 'In Progress': return 5;
      case 'Completed': return 6;
      case 'Verified Resolved': return 6; // Fallback for old data
      default: return 1;
    }
  };

  const statusVal = selectedReport?.admin_status || selectedReport?.status || 'Submitted';
  const isRejected = statusVal === 'Rejected';
  
  const currentStage = selectedReport ? getStageIndex(statusVal) : 1;
  const progressPercentage = isRejected ? 0 : Math.round(((currentStage - 1) / (STATUS_STAGES.length - 1)) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-lavender-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-lavender-500/10 text-lavender-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-lavender-500/20">
            <ShieldCheck className="h-3 w-3" />
            <span>Neural Lifecycle Tracking</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">
            Hazard <span className="text-lavender-400" style={{ color: 'var(--primary)' }}>Status</span>
          </h1>
          
          {/* Report Selector Dropdown */}
          <div className="relative mt-6 max-w-xs">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full glass-card px-4 py-3 rounded-xl border-white/10 flex items-center justify-between text-white font-bold text-sm uppercase tracking-widest"
            >
              <span>{selectedReport ? `ID: #${selectedReport.id} - ${selectedReport.hazard_type}` : 'Select Report'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-[600] max-h-60 overflow-y-auto custom-scrollbar">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                  >
                    ID: #{report.id} - {report.hazard_type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`glass-card px-10 py-8 rounded-[2.5rem] flex items-center space-x-8 border-white/10 group transition-all duration-500 ${isRejected ? 'border-red-500/30' : 'hover:border-lavender-500/30'}`}>
           <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-white/5"
                />
                {!isRejected && (
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={2 * Math.PI * 36 * (1 - progressPercentage / 100)}
                    className="text-lavender-500 transition-all duration-1000 ease-out"
                    style={{ color: 'var(--primary)' }}
                  />
                )}
                {isRejected && (
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={2 * Math.PI * 36 * 0}
                    className="text-red-500"
                  />
                )}
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xl font-black text-white italic ${isRejected ? 'text-red-400' : ''}`}>
                {isRejected ? 'X' : `${progressPercentage}%`}
              </span>
           </div>
           <div>
              <span className="text-slate-500 block uppercase text-[10px] font-black tracking-[0.2em] mb-1">Global Progress</span>
              <span className={`font-black text-2xl tracking-tighter uppercase italic ${isRejected ? 'text-red-500' : 'text-white'}`}>
                {isRejected ? 'Rejected' : progressPercentage < 100 ? 'Verification Phase' : 'Resolved'}
              </span>
           </div>
        </div>
      </div>

      {/* Main Tracker Card */}
      <div className={`glass-card p-12 lg:p-16 rounded-[3.5rem] border-white/5 relative overflow-hidden premium-shadow ${isRejected ? 'border-red-500/20' : ''}`}>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] -z-10 animate-pulse-soft ${isRejected ? 'bg-red-500/5' : 'bg-lavender-500/5'}`}></div>
        
        <div className="flex items-center justify-between mb-20">
          <div className="flex items-center space-x-4">
            <div className={`w-2 h-10 rounded-full ${isRejected ? 'bg-red-500' : 'bg-lavender-500'}`} style={!isRejected ? { backgroundColor: 'var(--primary)' } : {}}></div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Active Resolution Vector</h3>
          </div>
          {!isRejected && (
            <div className="hidden sm:flex items-center space-x-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }}></div>
                 <span className="text-white">Neural Processing</span>
              </div>
            </div>
          )}
        </div>

        {isRejected ? (
          /* Rejected State UI */
          <div className="py-16 text-center animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="h-12 w-12 text-red-500" />
             </div>
             <h3 className="text-3xl font-black text-white uppercase italic mb-3">⚠ Report Rejected update this</h3>
             <p className="text-slate-400 text-sm tracking-widest uppercase mb-8">This hazard report was flagged and closed by administration.</p>
             <button onClick={() => window.location.href='/support'} className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all border border-red-500/20">
               Contact Support
             </button>
          </div>
        ) : (
          /* Normal Progress Vector UI */
          <div className="relative pb-16">
            {/* Desktop Progress Line */}
            <div className="absolute top-7 left-12 right-12 h-1 bg-white/5 -z-10 rounded-full hidden lg:block">
              <div 
                className="h-full bg-gradient-to-r transition-all duration-1000 ease-in-out" 
                style={{ 
                  width: `${((currentStage - 1) / (STATUS_STAGES.length - 1)) * 100}%`,
                  backgroundImage: 'linear-gradient(to right, #22c55e, var(--primary))' 
                }}
              ></div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12 lg:gap-4">
              {STATUS_STAGES.map((stage) => {
                const isCompleted = stage.id < currentStage;
                const isActive = stage.id === currentStage;
                const Icon = stage.icon;

                return (
                  <div 
                    key={stage.id} 
                    className="flex flex-col items-center group relative w-full lg:w-auto"
                    onMouseEnter={() => setHoveredStage(stage.id)}
                    onMouseLeave={() => setHoveredStage(null)}
                  >
                    {/* Node */}
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 relative z-10 ${
                      isCompleted ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' :
                      isActive ? 'bg-lavender-500/20 shadow-[0_0_30px_rgba(167,139,250,0.5)] scale-110 border-2' :
                      'bg-slate-800 border-white/10 border-2 text-slate-600 opacity-60'
                    }`}
                    style={isActive ? { borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'rgba(167,139,250,0.2)' } : {}}>
                      <Icon className={`h-7 w-7 ${isActive ? 'animate-bounce-soft' : ''}`} />
                      {isActive && (
                         <div className="absolute -inset-3 rounded-[2rem] blur-2xl animate-pulse" style={{ backgroundColor: 'rgba(167,139,250,0.15)' }}></div>
                      )}
                    </div>

                    {/* Label & Context */}
                    <div className="mt-8 text-center px-4">
                      <p className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                        isCompleted ? 'text-green-500' :
                        isActive ? 'text-white' :
                        'text-slate-500'
                      }`}>
                        {stage.label}
                      </p>
                      {isActive && (
                        <span className="text-[9px] font-bold uppercase tracking-tight mt-2 block animate-pulse" style={{ color: 'var(--primary)' }}>
                          In-Transit
                        </span>
                      )}
                    </div>

                    {/* Tooltip (Desktop Only) */}
                    {hoveredStage === stage.id && (
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200 hidden lg:block">
                        <p className="text-[10px] text-white font-black text-center leading-relaxed italic uppercase tracking-wider">
                          {stage.desc}
                        </p>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-white/10 rotate-45"></div>
                      </div>
                    )}

                    {/* Mobile Description */}
                    <p className="lg:hidden text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight text-center max-w-[150px]">
                      {stage.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Metrics Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="p-3 rounded-2xl" style={{ color: 'var(--primary)', backgroundColor: 'rgba(167,139,250,0.1)' }}>
                <Info className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Department</p>
                <p className="text-sm font-black text-white italic uppercase tracking-tight">Municipal Engineering • {selectedReport?.area_name || 'Sector-12'}</p>
              </div>
           </div>

           <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="p-3 rounded-2xl" style={{ color: 'var(--primary)', backgroundColor: 'rgba(167,139,250,0.1)' }}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time to Resolution</p>
                <p className="text-sm font-black text-white italic uppercase tracking-tight">
                  {isRejected ? 'N/A' : (selectedReport?.priority === 'Critical' ? '14:20 HRS REMAINING' : (selectedReport?.priority === 'Moderate' ? '48:00 HRS REMAINING' : '72:00 HRS REMAINING'))}
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
