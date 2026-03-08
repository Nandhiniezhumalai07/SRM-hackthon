/**
 * MLADirectory.jsx — Constituency Representatives
 */
import React, { useState, useEffect } from 'react';
import { Landmark, Phone, MessageCircle, MapPin, Plus, Loader2, X, Trash2 } from 'lucide-react';
import { getMlas, addMla, deleteMla } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function MLADirectory() {
  const [mlas, setMlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '', constituency: '', mobile: '', address: ''
  });

  useEffect(() => {
    fetchMlas();
  }, []);

  const fetchMlas = async () => {
    setLoading(true);
    try {
      const res = await getMlas();
      setMlas(res.data || []);
    } catch (err) {
      console.error("Failed to fetch MLAs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMla = async (e) => {
    e.preventDefault();
    try {
      await addMla(formData);
      setIsModalOpen(false);
      setFormData({ name: '', constituency: '', mobile: '', address: '' });
      fetchMlas();
    } catch (err) {
      alert("Failed to add MLA");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this MLA?")) return;
    try {
      await deleteMla(id);
      fetchMlas();
    } catch (err) {
      alert("Failed to delete MLA");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-lavender-400 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-lavender-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-lavender-500/20" style={{ color: 'var(--primary)' }}>
            <Landmark className="h-3.5 w-3.5" />
            <span>Govt Directory</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
            Constituency <span style={{ color: 'var(--primary)' }}>Reps</span>
          </h1>
          <p className="text-slate-400 mt-2 font-bold tracking-wide">Contact your local MLA directly regarding unresolved hazards.</p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(167,139,250,0.3)] hover:scale-105 active:scale-95 transition-all text-slate-900 border-2"
            style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            <Plus className="h-4 w-4" />
            Add MLA
          </button>
        )}
      </div>

      {/* MLA Grid */}
      {mlas.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border-white/5">
          <Landmark className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No representatives found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mlas.map((mla) => (
            <div key={mla.id} className="glass-card rounded-[2rem] p-6 border-white/10 hover:border-lavender-500/30 transition-all duration-300 relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-lavender-500/10 rounded-full blur-[50px] -z-10 group-hover:bg-lavender-500/20 transition-all"></div>
               
               {isAdmin && (
                 <button 
                   onClick={() => handleDelete(mla.id)}
                   className="absolute top-6 right-6 p-2 rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                 >
                   <Trash2 className="h-4 w-4" />
                 </button>
               )}

               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-lavender-500/10 border border-lavender-500/20" style={{ color: 'var(--primary)' }}>
                   <Landmark className="h-6 w-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-white italic tracking-tight">{mla.name}</h3>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{mla.constituency}</span>
                 </div>
               </div>

               <div className="space-y-4 mb-8">
                 <div className="flex items-start gap-3">
                   <Phone className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                   <p className="text-sm font-bold text-slate-300 tracking-wider font-mono">{mla.mobile}</p>
                 </div>
                 <div className="flex items-start gap-3">
                   <MapPin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                   <p className="text-xs font-bold text-slate-400 leading-relaxed">{mla.address}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-3 mt-auto">
                 <a 
                   href={`tel:+91${mla.mobile.replace(/\D/g, '')}`} 
                   className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                 >
                   <Phone className="h-3.5 w-3.5" /> Call
                 </a>
                 <a 
                   href={`https://wa.me/91${mla.mobile.replace(/\D/g, '')}`} 
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                 >
                   <MessageCircle className="h-3.5 w-3.5" /> Message
                 </a>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Add MLA Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-[2.5rem] border-white/10 p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
            
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">New Representative</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Add to Directory</p>

            <form onSubmit={handleAddMla} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">MLA Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-lavender-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Constituency</label>
                <input 
                  type="text" required
                  value={formData.constituency} onChange={e => setFormData({...formData, constituency: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-lavender-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mobile Number</label>
                <input 
                  type="tel" required
                  value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-lavender-500 transition-colors"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Office Address</label>
                <textarea 
                  required rows="3"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-lavender-500 transition-colors resize-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full mt-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(167,139,250,0.3)] border-2"
                style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
              >
                Save MLA
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
