import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { getDashboardStats, getAllReports } from '../api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend 
} from 'chart.js';

import { Activity, AlertTriangle, AlertCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import HazardCard from '../components/HazardCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: {
      display: false,
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: { border: { display: false } }
  }
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_hazards: 0,
    unresolved_count: 0,
    high_severity_pending: 0,
    avg_resolution_time_hours: 0
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          getDashboardStats(),
          getAllReports()
        ]);
        setStats(statsRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getWardData = () => {
    const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];
    const unresolvedData = [0, 0, 0, 0];
    const resolvedData = [0, 0, 0, 0];
    
    reports.forEach(report => {
      // Logic to assign a report to a ward (mocking by id or area_name fragment for now)
      const wardIndex = report.id % 4; 
      if (report.status === "Verified Resolved") {
        resolvedData[wardIndex]++;
      } else {
        unresolvedData[wardIndex]++;
      }
    });
    
    return {
      labels: wards,
      datasets: [
        {
          label: 'Unresolved Hazards',
          data: unresolvedData,
          backgroundColor: 'rgba(239, 68, 68, 0.4)',
          borderColor: 'rgba(239, 68, 68, 0.8)',
          borderWidth: 2,
          borderRadius: 12,
        },
        {
          label: 'Optimized',
          data: resolvedData,
          backgroundColor: 'rgba(34, 197, 94, 0.4)',
          borderColor: 'rgba(34, 197, 94, 0.8)',
          borderWidth: 2,
          borderRadius: 12,
        }
      ],
    };
  };

  const chartData = getWardData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-lavender-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-lavender-500/10 text-lavender-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-lavender-500/20">
            <Activity className="h-3 w-3" />
            <span>Neural Telemetry Live</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">Community <span className="text-lavender-400" style={{ color: 'var(--primary)' }}>Analytics</span></h1>
          <p className="text-slate-400 mt-2 text-lg">Real-time infrastructure health and locality performance metrics.</p>
        </div>
        
        <div className="glass-card px-8 py-6 rounded-3xl flex flex-wrap gap-x-12 gap-y-4 border-white/10 group hover:border-lavender-500/30 transition-all duration-500">
          <div className="relative">
            <span className="text-slate-500 block uppercase text-[9px] font-black tracking-[0.2em] mb-1">Constituency</span>
            <span className="text-white font-black text-lg group-hover:text-lavender-400 transition-colors">Mumbai West</span>
          </div>
          <div className="w-px h-10 bg-white/5 hidden md:block"></div>
          <div>
            <span className="text-slate-500 block uppercase text-[9px] font-black tracking-[0.2em] mb-1">Village hub</span>
            <span className="text-white font-black text-lg">Bandra</span>
          </div>
          <div className="w-px h-10 bg-white/5 hidden md:block"></div>
          <div>
            <span className="text-slate-500 block uppercase text-[9px] font-black tracking-[0.2em] mb-1">Sector Ward</span>
            <span className="text-lavender-400 font-black text-lg" style={{ color: 'var(--primary)' }}>Node-12</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-8 rounded-[2rem] border-white/5 group hover:bg-slate-800/60 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full translate-x-12 -translate-y-12 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-6 text-blue-400">
            <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Activity className="h-6 w-6" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">Active</span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Hazards</p>
          <p className="text-4xl font-black text-white italic">{stats.total_hazards}</p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border-white/5 group hover:bg-slate-800/60 transition-all duration-500 relative overflow-hidden text-yellow-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full translate-x-12 -translate-y-12 blur-2xl group-hover:bg-yellow-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-yellow-500/10 rounded-2xl group-hover:scale-110 transition-transform"><AlertCircle className="h-6 w-6" /></div>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Unresolved</p>
          <p className="text-4xl font-black text-white italic">{stats.unresolved_count}</p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -bottom-4 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-6 text-red-500">
            <div className="p-3 bg-red-500/10 rounded-2xl group-hover:scale-110 transition-transform animate-pulse"><AlertTriangle className="h-6 w-6" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-red-500/20 px-2 py-1 rounded-md border border-red-500/30">Action Needed</span>
          </div>
          <p className="text-xs font-bold text-red-500/60 uppercase tracking-widest mb-1">Critical Priority</p>
          <p className="text-4xl font-black text-white italic">{stats.high_severity_pending}</p>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border-white/5 group hover:bg-slate-800/60 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-x-12 -translate-y-12 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-6 text-indigo-400">
            <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform"><Clock className="h-6 w-6" /></div>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Resolution</p>
          <p className="text-4xl font-black text-white italic">{stats.avg_resolution_time_hours}h</p>
        </div>

      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center">
              <div className="w-1 h-5 bg-lavender-500 mr-3 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
              Sector Performance
            </h2>
            <div className="flex space-x-2">
               <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unresolved</span>
               </div>
               <div className="flex items-center space-x-2 ml-4">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized</span>
               </div>
            </div>
          </div>
          <div className="h-80 w-full relative">
            <Bar data={chartData} options={{
              ...CHART_OPTIONS,
              plugins: { ...CHART_OPTIONS.plugins, legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold', size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { weight: 'bold', size: 10 } } }
              }
            }} />
          </div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic mb-8 flex items-center">
            <div className="w-1 h-5 bg-lavender-500 mr-3 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
            Priority Repair Matrix
          </h2>
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
            {reports.length > 0 ? (
              reports.map((report) => (
                <HazardCard key={report.id} report={report} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <AlertCircle className="h-12 w-12 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No active telemetry</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
