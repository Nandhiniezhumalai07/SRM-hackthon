import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, UploadCloud, CheckCircle, Info, X, RotateCcw, AlertTriangle, Sparkles, Navigation, Edit2, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { detectHazard, createReport, getSavedUser } from '../api';

// Custom Glowing Marker Icon
const createGlowingIcon = () => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: var(--primary); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px rgba(167,139,250,0.8);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const glowingIcon = createGlowingIcon();

// Map Event Handler Component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={glowingIcon} /> : null;
}

// Controller to animate map movement
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function ReportHazard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [hazardType, setHazardType] = useState("Pothole");
  const [severity, setSeverity] = useState("Low");
  
  // Geolocation States
  const [location, setLocation] = useState([19.0760, 72.8777]);
  const [areaName, setAreaName] = useState("Auto-detecting GPS...");
  const [isLocating, setIsLocating] = useState(false);
  const [showManual, setShowManual] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Reverse Geocoding via Nominatim
  const fetchAreaName = async (lat, lng) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.data && res.data.display_name) {
        const parts = res.data.display_name.split(',');
        // Extract a clean area name (first 2 parts)
        const cleanName = parts.slice(0, 2).join(',').trim();
        setAreaName(cleanName || "Unknown Sector");
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      setAreaName("Manual Location Set");
    }
  };

  useEffect(() => {
    fetchAreaName(location[0], location[1]);
  }, [location]);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([latitude, longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not access GPS. Please pin your location manually.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setSeverity("Low"); // Reset severity
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  // Simulated AI Scanning for Severity
  useEffect(() => {
    if (selectedFile) {
      const timer = setTimeout(() => {
        const severities = ["Low", "Medium", "High"];
        const detected = severities[Math.floor(Math.random() * severities.length)];
        setSeverity(detected);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        let finalHazardType = hazardType;
        let finalSeverity = severity;
        let imageUrl = "";

        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const uploadRes = await detectHazard(selectedFile);
            imageUrl = uploadRes.data.image_url;
            
            // Extract values from response to avoid state race condition
            if (uploadRes.data.hazard_type) {
                finalHazardType = uploadRes.data.hazard_type;
                setHazardType(finalHazardType);
            }
            if (uploadRes.data.severity) {
                finalSeverity = uploadRes.data.severity;
                setSeverity(finalSeverity);
            }
        }

        const user = getSavedUser();
        await createReport({
            user_id: user.id || 1, 
            latitude: location[0],
            longitude: location[1],
            image_url: imageUrl,
            hazard_type: finalHazardType,
            severity: finalSeverity,
            area_name: areaName
        });

        setIsSubmitting(false);
        setSuccess(true);
        setTimeout(() => navigate('/'), 3000);
    } catch (error) {
        console.error("Error submitting report:", error);
        alert("Failed to submit report. Please check if the backend is running.");
        setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full p-12 glass-card rounded-[3rem] text-center premium-shadow border-white/10 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-lavender-500/20 border border-lavender-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(167,139,250,0.2)]">
            <CheckCircle className="h-12 w-12 text-lavender-400" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-4 italic uppercase">Neural Logged</h2>
          <div className="bg-slate-900/50 p-6 rounded-2xl mb-8 border border-white/5">
             <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest font-bold">Severity Analysis</p>
             <p className="text-3xl font-black text-red-500 italic uppercase">72 / CRITICAL</p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-lavender-400 mb-8" style={{ color: 'var(--primary)' }}>
             <Sparkles className="h-5 w-5" />
             <span className="font-black text-xl tracking-tighter uppercase italic">+12 Spectral Points</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-lavender-500 animate-progress w-full transition-all duration-[3000ms]" style={{ backgroundColor: 'var(--primary)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-lavender-500/10 blur-[100px] -z-10 animate-pulse-soft"></div>
        <div className="inline-flex items-center space-x-2 bg-lavender-500/10 text-lavender-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-lavender-500/20">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>System Entry Protocol</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">Deploy <span className="text-lavender-400" style={{ color: 'var(--primary)' }}>Report</span></h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
          Initialize localized hazard telemetry for neural processing and municipal verification.
        </p>
      </div>

      <div className="glass-card mb-10 bg-indigo-500/10 border-indigo-500/20 rounded-3xl p-8 flex items-start group hover:bg-indigo-500/15 transition-all text-sm md:text-base">
        <Info className="h-6 w-6 text-indigo-400 mt-1 mr-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
        <div className="text-indigo-100 leading-relaxed font-medium">
          <strong className="text-white uppercase tracking-wider block mb-1">Optical Recognition Engine</strong>
          Deploying an image enables the YOLOv8-v2 Neural Network to autonomously classify threats, estimate volumetric metrics, and assign municipal priority scores.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <div className="space-y-10">
          <div className="space-y-4">
            <h3 className="text-[14px] font-black-italic text-slate-500 uppercase tracking-[0.3em] pl-1">Photo Capture</h3>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden ${
                  previewUrl ? 'border-yellow-500/50 bg-white/5' : 'border-white/10 bg-white/5 hover:border-yellow-500/30 hover:bg-white/[0.08]'
              }`}
            >
              {previewUrl ? (
                  <>
                      <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
                      <button 
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute top-4 right-4 bg-red-500 text-slate-900 p-2.5 rounded-2xl shadow-xl hover:bg-red-600 transition-colors z-10"
                      >
                          <X className="h-4 w-4" />
                      </button>
                      <div className="relative z-10 flex flex-col items-center text-yellow-500">
                          <RotateCcw className="h-8 w-8 mb-2 animate-spin-slow" />
                          <span className="font-black text-[10px] uppercase tracking-widest">Recapture Image</span>
                      </div>
                  </>
              ) : (
                  <>
                      <div className="bg-slate-900/50 p-6 rounded-full border border-white/10 mb-6 group-hover:scale-110 transition-transform shadow-xl">
                          <Camera className="h-10 w-10 text-lavender-400" style={{ color: 'var(--primary)' }} />
                      </div>
                      <p className="font-black text-white uppercase italic tracking-tighter text-xl">Snap Intel</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Optical Data Feed</p>
                  </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-[14px] font-black-italic text-slate-500 uppercase tracking-[0.3em]">Geolocation Lock</h3>
              <button 
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="flex items-center space-x-2 text-[10px] font-black text-lavender-400 uppercase tracking-widest hover:text-white transition-colors"
                style={{ color: 'var(--primary)' }}
              >
                <Navigation className={`h-3 w-3 ${isLocating ? 'animate-ping' : ''}`} />
                <span>{isLocating ? 'Scanning...' : 'Use My GPS'}</span>
              </button>
            </div>
            
            <div className="h-[250px] rounded-[2.5rem] overflow-hidden border border-white/10 premium-shadow relative group">
              <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <LocationMarker position={location} setPosition={setLocation} />
                <MapController center={location} />
              </MapContainer>
              <div className="absolute bottom-4 left-4 right-4 z-[400] flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <MapPin className="h-4 w-4 text-lavender-400 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight truncate">{areaName}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowManual(!showManual)}
                  className="bg-white/10 p-2 rounded-xl text-white hover:bg-lavender-500 hover:text-slate-900 transition-all"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {showManual && (
              <div className="space-y-4 p-6 glass-card rounded-2xl animate-in slide-in-from-top duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lat</label>
                    <input 
                      type="number" step="any"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-lavender-500"
                      value={location[0]}
                      onChange={(e) => setLocation([parseFloat(e.target.value), location[1]])}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lng</label>
                    <input 
                      type="number" step="any"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-lavender-500"
                      value={location[1]}
                      onChange={(e) => setLocation([location[0], parseFloat(e.target.value)])}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Manual Area Name</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-lavender-500"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="Enter locality..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1 text-yellow-500">Hazard Classification</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-yellow-500 focus:bg-white/10 transition-all font-black text-white italic uppercase tracking-tight appearance-none cursor-pointer"
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value)}
                >
                  <option value="Pothole" className="bg-slate-900 font-bold">Pothole Matrix</option>
                  <option value="Broken road edge" className="bg-slate-900 font-bold">Edge Fragmentation</option>
                  <option value="Missing manhole cover" className="bg-slate-900 font-bold">Structural Void</option>
                  <option value="Waterlogging" className="bg-slate-900 font-bold">Aqueous Anomaly</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="h-5 w-5 text-slate-500 rotate-90" />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              severity === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              severity === 'Medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
              'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-widest block mb-1">AI Detected Severity</span>
              <span className="text-xl font-black italic uppercase tracking-tighter">{severity}</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
               <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <span>Spectral Telemetry</span>
                  <Activity className="h-3.5 w-3.5 text-lavender-400" />
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Vector X (Lat)</p>
                    <p className="text-xl font-black text-white italic tracking-tighter">{location[0].toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Vector Y (Lng)</p>
                    <p className="text-xl font-black text-white italic tracking-tighter">{location[1].toFixed(6)}</p>
                  </div>
               </div>

               <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Locality Signature</p>
                  <p className="text-sm font-black text-lavender-400 italic uppercase tracking-tight truncate" style={{ color: 'var(--primary)' }}>{areaName === "Auto-detecting GPS..." ? "Scanning Grid..." : areaName}</p>
               </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-slate-100 text-slate-900 font-black text-lg py-6 rounded-[2rem] shadow-2xl group-hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 premium-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
               {isSubmitting ? (
                 <span className="flex items-center relative z-10">
                   <svg className="animate-spin -ml-1 mr-4 h-7 w-7 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Neural Deployment...
                 </span>
               ) : (
                  <span className="flex items-center relative z-10 italic uppercase tracking-tighter text-2xl group-hover:scale-110 transition-transform">
                    Deploy Telemetry <UploadCloud className="h-7 w-7 ml-3 group-hover:translate-y-[-4px] transition-transform" />
                  </span>
               )}
            </div>
          </button>
        </div>

      </form>
    </div>
  );
}
