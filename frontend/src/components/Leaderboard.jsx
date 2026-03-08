/**
 * Leaderboard.jsx — City Champions Ranking
 * Uses AuthContext for user identity.
 * Falls back to "Mumbai" if user has no city set.
 */
import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, MapPin, Award, Sparkles, Loader2, UserPlus } from 'lucide-react';

const POINTS_SYSTEM = [
  { action: "Report a verified hazard", pts: "+10", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { action: "Hazard gets verified resolved", pts: "+30", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { action: "Confirm a repair", pts: "+5", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { action: "False report penalty", pts: "-20", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
];

export default function Leaderboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState(user?.city || 'Mumbai');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetCity = user?.city || city;
        const response = await getLeaderboard(targetCity);
        const data = response.data || [];
        setLeaderboard(data);

        // Find current user's rank using correct field name 'name' not 'full_name'
        if (isLoggedIn && user?.id) {
          const rank = data.findIndex(u => u.id === user.id) + 1;
          if (rank > 0) {
            setUserRank({ rank, points: data[rank - 1]?.points || user.points || 0 });
          }
        }
      } catch (err) {
        setError('Could not load leaderboard. Make sure the backend is running.');
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user?.city, user?.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto" style={{ color: 'var(--primary)' }} />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md glass-card p-10 rounded-3xl">
          <p className="text-red-400 font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-slate-400 underline hover:text-white"
          >Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-12 animate-in fade-in slide-in-from-top-8 duration-1000">

      {/* Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-lavender-500/20 blur-3xl animate-pulse"></div>
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 border border-lavender-500/20 bg-lavender-500/10" style={{ color: 'var(--primary)' }}>
          <Sparkles className="h-3.5 w-3.5" />
          <span>{user?.city || city} Neural Vanguard</span>
        </div>
        <h1 className="text-7xl font-black text-white tracking-tighter mb-6 uppercase italic">
          City <span style={{ color: 'var(--primary)' }} className="drop-shadow-[0_0_20px_rgba(167,139,250,0.4)]">Champions</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Elite citizens leveraging AI detection tech to safeguard the infrastructure of tomorrow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Main Leaderboard Table */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] border-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full translate-x-32 -translate-y-32 blur-[100px]"></div>

          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center">
              <Award className="h-7 w-7 mr-3 text-yellow-400" />
              Vanguard Rank
            </h2>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{leaderboard.length} citizens</span>
          </div>

          <div className="divide-y divide-white/5">
            {leaderboard.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">No Citizens Yet</p>
                <p className="text-slate-600 text-xs">Be the first to register in {user?.city || city}!</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-8 px-12 group hover:bg-white/5 transition-all duration-300 relative ${
                    entry.id === user?.id ? 'bg-lavender-500/5 border-l-2' : ''
                  } ${index === 0 ? 'bg-yellow-500/5' : ''}`}
                  style={entry.id === user?.id ? { borderLeftColor: 'var(--primary)' } : {}}
                >
                  {/* Rank Number */}
                  <div className="flex items-center space-x-8">
                    <div className={`text-5xl font-black tracking-tighter w-20 italic ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-slate-400' :
                      index === 2 ? 'text-amber-700' : 'text-slate-700'
                    }`}>
                      {index < 9 ? `0${index + 1}` : index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-xl border border-white/10 shadow-xl transition-transform group-hover:scale-110 ${
                        index === 0 ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-slate-800'
                      }`}>
                        {/* FIX: use entry.name not entry.full_name */}
                        {entry.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      {index < 3 && (
                        <Trophy className={`absolute -top-2 -right-2 h-5 w-5 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-slate-400' : 'text-amber-700'
                        }`} />
                      )}
                    </div>

                    {/* Name & City */}
                    <div>
                      <h3 className="font-black text-xl text-white tracking-tight uppercase group-hover:text-yellow-400 transition-colors flex items-center gap-2">
                        {/* FIX: use entry.name not entry.full_name */}
                        {entry.name}
                        {entry.id === user?.id && (
                          <span className="text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', backgroundColor: 'rgba(167,139,250,0.1)' }}>You</span>
                        )}
                      </h3>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{entry.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <span className="text-5xl font-black text-white italic tracking-tighter group-hover:text-yellow-400 transition-colors">
                      {entry.points}
                    </span>
                    <p className="text-slate-500 text-[10px] tracking-[0.4em] font-black uppercase mt-1">pts</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Points system */}
          <div className="glass-card rounded-[2.5rem] border-white/5 p-10 relative overflow-hidden">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center">
              <Medal className="h-6 w-6 mr-3 text-blue-400" />
              Protocol Matrix
            </h2>
            <div className="space-y-3">
              {POINTS_SYSTEM.map((rule, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-2xl border ${rule.bg}`}>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{rule.action}</span>
                  <span className={`text-xs font-black italic ${rule.color}`}>{rule.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User status card */}
          <div className="glass-card rounded-[2.5rem] border-white/5 p-10 bg-indigo-500/10 border-indigo-500/20 text-center">
            {isLoggedIn ? (
              <>
                <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3">Your Neural Status</p>
                {userRank ? (
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    You are <strong className="text-white italic">#{userRank.rank}</strong> in {user.city}<br />
                    with <strong className="text-yellow-400">{userRank.points} pts</strong>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Keep reporting hazards to appear on the leaderboard!
                  </p>
                )}
                <button
                  onClick={() => navigate('/report')}
                  className="w-full font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] text-slate-900 transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Deploy Report
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3">Join the Rankings</p>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Register your identity to track your ranking in the city!
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-slate-900 hover:scale-105 transition-all"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <UserPlus className="h-4 w-4" />
                  Register Now
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
