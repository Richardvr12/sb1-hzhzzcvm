import React, { useState } from 'react'
import { Play, Pause, Layers, Navigation, AlertTriangle, ShieldCheck, Search } from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('6hr');
  const [timelineVal, setTimelineVal] = useState(0);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header Search Bar */}
      <header className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-cyan-400 w-6 h-6" />
          <h1 className="font-bold text-lg text-cyan-400 tracking-wide">VANGUARD-W UI</h1>
        </div>
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search location or route..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </header>

      {/* Main Map View Area */}
      <main className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-lg w-72">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Engine</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Online</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">AI Nowcasting & NOAA HRRR</p>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => setActiveTab('6hr')}
              className={`flex-1 py-1 text-xs rounded-md font-medium transition ${activeTab === '6hr' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
            >
              High-Res 6-Hr Radar
            </button>
            <button 
              onClick={() => setActiveTab('72hr')}
              className={`flex-1 py-1 text-xs rounded-md font-medium transition ${activeTab === '72hr' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
            >
              72-Hr Forecast
            </button>
          </div>
        </div>

        {/* Dynamic Hazard Rerouting Alert */}
        <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3 backdrop-blur max-w-xs">
          <AlertTriangle className="text-amber-400 w-5 h-5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-400 block">Dynamic Reroute Active</span>
            <span className="text-slate-300">Bypassing storm cell (48 dBZ) & 35mph crosswinds.</span>
          </div>
        </div>

        <p className="text-slate-500 font-mono text-sm">Leaflet Canvas & Radar Tile Service Initialized</p>
      </main>

      {/* Timeline Controls Drawer */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <span className="text-xs font-mono text-slate-400">00:00 ETA +{timelineVal}m</span>
          </div>

          <input 
            type="range" 
            min="0" 
            max="120" 
            value={timelineVal} 
            onChange={(e) => setTimelineVal(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-2">
            <button className="px-2 py-1 bg-slate-800 border border-slate-700 text-xs rounded text-slate-300">1x</button>
            <button className="p-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded"><Layers className="w-4 h-4" /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}
