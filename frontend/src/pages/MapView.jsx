import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Custom Icons based on Hazard Type ---
const createCustomIcon = (color, shadow) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 25px ${shadow};"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const icons = {
  Resolved: createCustomIcon('#22c55e', 'rgba(34,197,94,0.6)'),
  Medium: createCustomIcon('#eab308', 'rgba(234,179,8,0.6)'),
  High: createCustomIcon('#ef4444', 'rgba(239,68,68,0.6)'),
  Waterlogging: createCustomIcon('#3b82f6', 'rgba(59,130,246,0.6)'),
  Verifying: createCustomIcon('#a855f7', 'rgba(168,85,247,0.6)')
};

// Heatmap Overlay Component (Simulated)
const DecorativeHeatmap = ({ hotspots }) => {
    return hotspots.map((spot, i) => (
        <div key={i} className="absolute pointer-events-none z-[400]" style={{
            top: '50%', left: '50%', transform: `translate(-50%, -50%)`, // Approximate positioning for demo
            width: spot.radius, height: spot.radius,
            background: spot.prob > 0.7 ? 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0) 70%)' : 'radial-gradient(circle, rgba(234,179,8,0.3) 0%, rgba(234,179,8,0) 70%)',
            borderRadius: '50%'
        }} />
    ))
}


export default function MapView() {
  const [hazards, setHazards] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await getAllReports();
        setHazards(response.data);
        // Simulate hotspots for now if not in API
        setHotspots([
          { lat: 19.0760, lng: 72.8777, prob: 0.85, radius: 1000 },
          { lat: 19.0960, lng: 72.8977, prob: 0.60, radius: 800 },
        ]);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);
  
  const handleConfirm = async (reportId, status) => {
    try {
        const user = getSavedUser();
      if (!user.id) {
        alert("Please register your Neural Identity to verify repairs.");
        return;
      }
      
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        await confirmRepair(reportId, {
          user_id: user.id,
          confirmation_status: status,
          latitude,
          longitude
        });
        
        const response = await getAllReports();
        setHazards(response.data);
        alert(status === "Fixed" ? "Verification Protocol Logged. Neural points awarded." : "Anomaly Reported. Status reverted to Pending.");
      }, (err) => {
        alert("Location access required for verification protocol.");
      });
    } catch (error) {
      console.error("Confirmation failed:", error);
      alert(error.response?.data?.detail || "Sync failed. Retry uplink.");
    }
  };

  return (
    <div className="h-[85vh] relative flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-8 left-8 z-[500] max-w-sm pointer-events-none">
        <div className="glass-card p-10 rounded-[3rem] pointer-events-auto premium-shadow border-white/20 border-2 animate-in fade-in slide-in-from-left duration-700">
           <div className="flex items-center space-x-4 mb-6">
              <div className="w-2.5 h-10 bg-lavender-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(167,139,250,0.5)]" style={{ backgroundColor: 'var(--primary)' }}></div>
              <h1 className="text-5xl font-black-italic text-white tracking-tighter">LIVE <span className="text-lavender-400" style={{ color: 'var(--primary)' }}>ENV</span></h1>
           </div>
           <p className="text-slate-400 text-sm leading-relaxed mb-8">
             Real-time neural monitoring of local infrastructure via deep-learning hazard detection.
           </p>
           
           <div className="space-y-4">
             <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                  showHeatmap 
                  ? 'bg-yellow-500 text-slate-900 shadow-xl shadow-yellow-500/20' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Layers className={`h-5 w-5 ${showHeatmap ? 'animate-spin-slow' : ''}`} />
                  <span>AI Predictor Layer</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${showHeatmap ? 'bg-slate-900' : 'bg-red-500 animate-pulse'}`}></div>
             </button>

             <div className="glass-card bg-white/5 border-0 p-5 rounded-2xl space-y-4">
               <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Spectral Legend</h4>
               <div className="grid grid-cols-2 gap-y-3">
                  <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                    <span>CRITICAL</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                    <span>WARNING</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                    <span>AQUEOUS</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                    <span>SECURE</span>
                  </div>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/5 premium-shadow relative z-0">
        <MapContainer center={[19.0760, 72.8777]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {hazards.map((hazard) => (
            <Marker 
              key={hazard.id} 
              position={[hazard.latitude, hazard.longitude]} 
              icon={icons[hazard.status === "Marked Resolved" ? "Verifying" : (hazard.status === "Verified Resolved" ? "Resolved" : hazard.severity)] || icons["Medium"]}
            >
              <Popup className="premium-popup">
                <div className="p-4 bg-slate-900 text-white min-w-[220px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                       <h3 className="font-black text-lg tracking-tight uppercase italic leading-none mb-1">{hazard.hazard_type}</h3>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{hazard.area_name}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${hazard.status === 'Marked Resolved' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse' : (hazard.status === 'Verified Resolved' ? 'bg-green-500' : 'bg-red-500')}`}></div>
                  </div>
                  
                  <div className="space-y-3 mb-5 text-left">
                     <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Impact Assessment</span>
                        <span className="text-xs font-black text-white italic">₹{hazard.estimated_cost?.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Urgency</span>
                        <span className={`text-[10px] font-black uppercase italic ${hazard.priority === 'Critical' ? 'text-red-500' : (hazard.priority === 'Moderate' ? 'text-orange-400' : 'text-slate-400')}`}>{hazard.priority}</span>
                     </div>
                     {hazard.status === 'Marked Resolved' ? (
                       <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl">
                          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Citizen Consensus</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-white italic">{hazard.verification_count}/3 Confirmed</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3].map(i => (
                                <div key={i} className={`w-3 h-1.5 rounded-full ${i <= hazard.verification_count ? 'bg-purple-500' : 'bg-white/10'}`}></div>
                              ))}
                            </div>
                          </div>
                       </div>
                     ) : (
                       <div>
                          <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Strategic Threat Level</p>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-lavender-500" style={{ width: `${hazard.severity === 'High' ? 90 : (hazard.severity === 'Medium' ? 50 : 20)}%`, backgroundColor: 'var(--primary)' }}></div>
                          </div>
                       </div>
                     )}
                  </div>
                  
                  {hazard.status === 'Marked Resolved' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleConfirm(hazard.id, "Fixed")}
                        className="bg-green-500 text-slate-900 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-colors"
                      >
                        Fixed
                      </button>
                      <button 
                        onClick={() => handleConfirm(hazard.id, "Still Not Fixed")}
                        className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-colors"
                      >
                        Broken
                      </button>
                    </div>
                  ) : (
                    <Link to="/status" className="block w-full text-center bg-lavender-500 text-white rounded-xl py-2.5 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all" style={{ backgroundColor: 'var(--primary)' }}>
                      Neural Scan Report
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {showHeatmap && (
           <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden">
              <DecorativeHeatmap hotspots={hotspots} />
           </div>
        )}
      </div>

      {/* Floating Info Bar */}
      <div className="absolute bottom-8 right-8 z-[500] animate-in slide-in-from-bottom duration-1000">
        <div className="glass-card px-10 py-6 rounded-[2.5rem] flex items-center space-x-10 border-white/20 border-2 premium-shadow">
          <div className="flex flex-col items-center">
             <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Active Nodes</span>
             <span className="text-4xl font-black-italic text-white">{hazards.length} <span className="text-sm text-green-500 font-black">+12</span></span>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div className="flex flex-col items-center">
             <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">System Health</span>
             <span className="text-4xl font-black-italic text-lavender-400" style={{ color: 'var(--primary)' }}>98.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
