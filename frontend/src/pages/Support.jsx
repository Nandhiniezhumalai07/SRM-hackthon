import React from 'react';
import { Headset, Phone, Mail, HelpCircle, Zap, ShieldQuestion, ChevronRight, ExternalLink } from 'lucide-react';

const FAQS = [
  { q: "How do I ensure GPS accuracy?", a: "Stand in an open area and wait for the 'Neural Lock' to turn green. Avoid being under heavy tree cover or tall buildings." },
  { q: "What qualifies as a 'Critical' hazard?", a: "Any road damage over 10cm deep or structural cracks on bridges are high-priority neural events." },
  { q: "Is my personal data shared with the Govt?", a: "No. Only the telemetry (hazard photo and coordinates) is forwarded. Your identity remains protected." },
];

const TROUBLESHOOTING = [
  { item: "GPS Offset", tip: "Toggle 'Use My Location' twice to recalibrate your local neural node." },
  { item: "Upload Failure", tip: "Ensure images are under 5MB. Deep-learning models prefer high-contrast daylight photos." },
  { item: "Map Not Loading", tip: "Clear your browser cache and ensure you have an active 4G/5G data uplink." },
];

export default function Support() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Header Section */}
      <div className="text-center space-y-4 mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-lavender-500/10 blur-3xl animate-pulse"></div>
        <div className="inline-flex items-center space-x-3 bg-lavender-500/10 text-lavender-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-lavender-500/20">
          <Headset className="h-4 w-4" />
          <span>Guardian Assistance Module</span>
        </div>
        <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic">
          Help & <span className="text-lavender-400" style={{ color: 'var(--primary)' }}>Support</span> Center
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          If you face any issues while reporting hazards or using the platform, please contact our support team. We are here to ensure every node remains operational.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Contact Matrix */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -z-10 group-hover:bg-yellow-500/20 transition-all duration-700"></div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center">
              <Phone className="h-6 w-6 mr-3 text-yellow-500" /> 
              Toll-Free Support
            </h2>
            <div className="mb-10">
               <span className="text-slate-500 block uppercase text-[10px] font-black tracking-[0.3em] mb-2">24/7 Hotline</span>
               <p className="text-4xl font-black text-white italic tracking-tighter group-hover:text-yellow-500 transition-colors">0111 033 0444</p>
            </div>
            <a 
              href="tel:01110330444" 
              className="w-full premium-gradient text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center space-x-3"
            >
              <Phone className="h-5 w-5" />
              <span>Call Support</span>
            </a>
          </div>

          <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/20 transition-all duration-700"></div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center">
              <Mail className="h-6 w-6 mr-3 text-blue-500" /> 
              Neural Feedback
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">For non-critical data issues or partnership inquiries, reach our digital hub.</p>
            <a 
              href="mailto:support@roadwatch.ai" 
              className="w-full bg-white/5 border border-white/10 text-white font-black py-5 rounded-2xl hover:bg-white/10 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center space-x-3"
            >
              <span>support@roadwatch.ai</span>
              <ExternalLink className="h-4 w-4 opacity-50" />
            </a>
          </div>
        </div>

        {/* FAQs and Troubleshooting */}
        <div className="lg:col-span-2 space-y-10">
          
          <div className="glass-card p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden">
             <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 flex items-center">
               <ShieldQuestion className="h-7 w-7 mr-4 text-lavender-400" style={{ color: 'var(--primary)' }} /> 
               Common Inquiries (FAQ)
             </h2>
             <div className="space-y-6">
                {FAQS.map((faq, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-lavender-500/20 transition-all duration-300">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest mb-3 flex items-start">
                       <span className="text-lavender-400 mr-3" style={{ color: 'var(--primary)' }}>Q:</span> {faq.q}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-medium pl-6">
                       {faq.a}
                    </p>
                  </div>
                ))}
             </div>
          </div>

          <div className="glass-card p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden">
             <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 flex items-center">
               <Zap className="h-7 w-7 mr-4 text-yellow-400" /> 
               Network Troubleshooting
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TROUBLESHOOTING.map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 block">{item.item}</span>
                    <p className="text-xs font-bold text-slate-300 italic mb-0">"{item.tip}"</p>
                  </div>
                ))}
             </div>
          </div>

        </div>

      </div>

      {/* Manual Links */}
      <div className="pt-10 border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
         <div className="flex space-x-12">
            <div>
               <span className="text-slate-600 block uppercase text-[10px] font-black tracking-[0.2em] mb-2">Protocol</span>
               <a href="#" className="text-white font-bold text-xs hover:text-lavender-400 transition-colors">Privacy Policy</a>
            </div>
            <div>
               <span className="text-slate-600 block uppercase text-[10px] font-black tracking-[0.2em] mb-2">Governance</span>
               <a href="#" className="text-white font-bold text-xs hover:text-lavender-400 transition-colors">Terms of Use</a>
            </div>
         </div>
         <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">Integrated Infrastructure Protection • v2.0.42</p>
      </div>

    </div>
  );
}
