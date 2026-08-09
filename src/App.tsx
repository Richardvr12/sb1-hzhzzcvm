import React, { useState } from 'react';
import {
  Play,
  Pause,
  Layers,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  Search,
  MapPin,
  Clock2
} from 'lucide-react';
import RadarMap from './components/RadarMap';
import RouteWeatherMap from './components/RouteWeatherMap';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'interactive' | 'route'>('live');
  const [searchQ, setSearchQ] = useState('');
  const [locationStatus, setLocationStatus] = useState<string>('Unknown');
  const [opticalProb, setOpticalProb] = useState(42);
  const [gateShear, setGateShear] = useState(5);
  const [vehicleProfile, setVehicleProfile] = useState<'Passenger Car' | 'Semi-Truck' | 'RV' | 'Motorcycle'>('Passenger Car');

  function handleSearch() {
    // placeholder: wire to geocoding/search later
    setLocationStatus(`Searching for: ${searchQ}`);
  }

  function useDeviceLocation() {
    setLocationStatus('Requesting device location...');
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocationStatus(`Lat:${pos.coords.latitude.toFixed(3)} Lon:${pos.coords.longitude.toFixed(3)}`),
      (err) => setLocationStatus(`Location error: ${err.message}`)
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#071024] text-slate-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-cyan-400 w-7 h-7" />
          <div>
            <h1 className="text-xl font-extrabold tracking-wide text-cyan-300">EDGE-AI WEATHER FUSION</h1>
            <div className="text-xs text-slate-400">Client-Side WebGPU • ONNX WASM • Radar Fusion</div>
          </div>
          <div className="ml-4 px-2 py-1 rounded-md bg-gradient-to-r from-cyan-700/30 to-emerald-700/20 border border-cyan-600 text-cyan-300 text-xs font-medium">
            <span className="mr-2 inline-block bg-cyan-400 text-[#021017] px-2 py-0.5 rounded text-[11px]">WebGPU Accelerated</span>
            <span className="text-[11px]">Status</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 w-1/2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="w-full bg-[#041425] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter city, address, or coordinates"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#021017] rounded-md font-semibold"
          >
            Search
          </button>
          <button
            onClick={useDeviceLocation}
            className="px-3 py-2 bg-[#022231] border border-slate-800 rounded-md text-slate-300 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-cyan-300" />
            Current Device Location
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-2 px-6 py-3 bg-[#05122a] border-b border-slate-800">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition ${
            activeTab === 'live' ? 'bg-gradient-to-r from-cyan-600 to-emerald-500 text-[#041017]' : 'bg-[#021420] text-slate-300'
          }`}
        >
          Live Threat & Local Sensors
        </button>
        <button
          onClick={() => setActiveTab('interactive')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition ${
            activeTab === 'interactive' ? 'bg-gradient-to-r from-cyan-600 to-emerald-500 text-[#041017]' : 'bg-[#021420] text-slate-300'
          }`}
        >
          Interactive Radar & Predictive Loop
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition ${
            activeTab === 'route' ? 'bg-gradient-to-r from-cyan-600 to-emerald-500 text-[#041017]' : 'bg-[#021420] text-slate-300'
          }`}
        >
          Route Weather & Live Drive Navigation
        </button>

        <div className="ml-auto flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock2 className="w-4 h-4 text-cyan-300" />
            <span>Realtime</span>
          </div>
          <div className="px-2 py-1 rounded bg-[#021420] border border-slate-800 text-slate-300">{locationStatus}</div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-full mx-auto">
          {/* Tab Panels */}
          <section className={`${activeTab === 'live' ? 'block' : 'hidden'}`}>
            {/* Live Threat & Local Sensors View */}
            <div className="grid grid-cols-3 gap-4">
              {/* Left column: controls & metrics */}
              <div className="col-span-1 bg-[#071b2b] rounded-lg p-4 border border-slate-800 shadow-md">
                <h2 className="text-cyan-300 font-semibold mb-2">Sensor & Fusion Controls</h2>
                <div className="mb-4">
                  <label className="text-sm text-slate-300">Optical Convective Cloud Prob. ({opticalProb}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={opticalProb}
                    onChange={(e) => setOpticalProb(Number(e.target.value))}
                    className="w-full mt-2 accent-cyan-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="text-sm text-slate-300">NEXRAD Level II Gate Shear ({gateShear} m/s)</label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={gateShear}
                    onChange={(e) => setGateShear(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-400"
                  />
                </div>

                <h3 className="text-slate-200 font-semibold mt-4 mb-2">Fused Hazard Index</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded bg-[#021018] border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Fused Hazard</div>
                    <div className="text-2xl font-bold text-cyan-300">3.4</div>
                  </div>
                  <div className="p-3 rounded bg-[#021018] border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Raw NOAA Temp</div>
                    <div className="text-2xl font-bold text-amber-300">18°C</div>
                  </div>
                  <div className="p-3 rounded bg-[#021018] border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Bias Corrected Temp</div>
                    <div className="text-2xl font-bold text-emerald-300">17.2°C</div>
                  </div>
                  <div className="p-3 rounded bg-[#021018] border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Local SLR Ratio</div>
                    <div className="text-2xl font-bold text-cyan-300">0.82</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-slate-200 font-semibold mb-2">Forecast Breakdown</h3>
                  <table className="w-full text-sm text-slate-300">
                    <thead>
                      <tr className="text-xs text-slate-400">
                        <th className="text-left pb-2">Hour</th>
                        <th className="text-left pb-2">Precip</th>
                        <th className="text-left pb-2">Temp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1">+1</td>
                        <td className="py-1">0.2"</td>
                        <td className="py-1">18°C</td>
                      </tr>
                      <tr>
                        <td className="py-1">+2</td>
                        <td className="py-1">0.0"</td>
                        <td className="py-1">17°C</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <h3 className="text-slate-200 font-semibold mb-2">Local Telemetry & Fusion Analysis</h3>
                  <textarea className="w-full h-28 bg-[#020f15] text-slate-300 p-2 rounded border border-slate-800" readOnly value={`Telemetry: GPS OK\nSensors: OK\nFusion: stable`} />
                </div>
              </div>

              {/* Middle column: sensor widgets */}
              <div className="col-span-1 bg-[#071b2b] rounded-lg p-4 border border-slate-800 shadow-md">
                <h2 className="text-cyan-300 font-semibold mb-2">Environmental Health</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded bg-[#021018] border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Air Quality (AQI)</div>
                    <div className="text-xl font-bold text-emerald-300">42</div>
                  </div>
                  <div className="p-3 rounded bg-[#021018] border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">UV Index</div>
                    <div className="text-xl font-bold text-amber-300">3</div>
                  </div>
                  <div className="p-3 rounded bg-[#021018] border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Humidity</div>
                    <div className="text-xl font-bold text-cyan-300">68%</div>
                  </div>
                  <div className="p-3 rounded bg-[#021018] border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Pollen</div>
                    <div className="text-xl font-bold text-amber-300">Low</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-slate-200 font-semibold mb-2">Sun / Moon / Pressure</h3>
                  <div className="grid grid-cols-3 gap-2 text-center text-slate-300 text-sm">
                    <div className="p-2 rounded bg-[#021018] border border-slate-800">Sunrise<br/><strong className="text-cyan-300">06:12</strong></div>
                    <div className="p-2 rounded bg-[#021018] border border-slate-800">Moon<br/><strong className="text-emerald-300">Waxing</strong></div>
                    <div className="p-2 rounded bg-[#021018] border border-slate-800">Pressure<br/><strong className="text-amber-300">1012 hPa</strong></div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-slate-200 font-semibold mb-2">Optical Cloud Scanner</h3>
                  <div className="h-36 bg-[#011018] border border-slate-800 rounded p-2 text-slate-300">Scanner output / preview (placeholder)</div>
                </div>
              </div>

              {/* Right column: terminal & logs */}
              <div className="col-span-1 bg-[#071b2b] rounded-lg p-4 border border-slate-800 shadow-md">
                <h2 className="text-cyan-300 font-semibold mb-2">Terminal Log Window</h2>
                <pre className="h-96 overflow-auto bg-[#020f15] p-3 rounded border border-slate-800 text-xs text-slate-300">{`[2026-08-09T04:00Z] Fusion: Initialized\n[2026-08-09T04:01Z] Radar tiles OK\n[2026-08-09T04:02Z] Wind vectors received`}</pre>
              </div>
            </div>
          </section>

          <section className={`${activeTab === 'interactive' ? 'block' : 'hidden'}`}>
            {/* Interactive Radar & Predictive Loop */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 bg-[#071b2b] rounded-lg p-4 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-cyan-300 font-semibold">Interactive Radar & Predictive Loop</h2>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" defaultChecked /> Satellite
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" defaultChecked /> Precipitation
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" defaultChecked /> Wind Vectors
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" defaultChecked /> Temp Heatmap
                    </label>
                  </div>
                </div>

                <div className="h-[640px] rounded border border-slate-800 overflow-hidden">
                  {/* Embed RadarMap component */}
                  <RadarMap width={1200} height={640} />
                </div>
              </div>
            </div>
          </section>

          <section className={`${activeTab === 'route' ? 'block' : 'hidden'}`}>
            {/* Route Weather & Live Drive Navigation */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 bg-[#071b2b] rounded-lg p-4 border border-slate-800 shadow-md">
                <h2 className="text-cyan-300 font-semibold mb-2">Route Planner & 4D Weather Calculator</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-300">Start Point</label>
                    <input className="w-full mt-1 p-2 rounded bg-[#011018] border border-slate-800 text-slate-300" placeholder="Start address or coords" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Destination Address</label>
                    <input className="w-full mt-1 p-2 rounded bg-[#011018] border border-slate-800 text-slate-300" placeholder="Destination address or coords" />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300">Vehicle Risk Profile</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(['Passenger Car','Semi-Truck','RV','Motorcycle'] as const).map((v) => (
                        <button key={v} onClick={() => setVehicleProfile(v)} className={`px-3 py-2 rounded ${vehicleProfile===v? 'bg-cyan-500 text-[#021017]':'bg-[#021420] text-slate-300'} border border-slate-800`}>{v}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button className="w-full py-2 bg-emerald-500 text-[#021017] rounded font-semibold">Calculate Route & Weather</button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-slate-200 font-semibold mb-2">4D Weather Results</h3>
                  <div className="text-sm text-slate-300">ETA: 02:14 | Avg Risk: Moderate | Storm Intersections: 1</div>
                </div>
              </div>

              <div className="col-span-2 bg-[#071b2b] rounded-lg p-4 border border-slate-800 shadow-md">
                <h2 className="text-cyan-300 font-semibold mb-2">Route Map & Live Drive Navigation</h2>
                <div className="h-[640px] rounded border border-slate-800 overflow-hidden">
                  {/* Embed RouteWeatherMap component */}
                  <RouteWeatherMap width={1000} height={640} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="px-6 py-4 bg-[#03111a] border-t border-slate-800 text-sm text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded bg-[#021420] border border-slate-800">Engine: <span className="text-cyan-300 font-medium">ON</span></div>
          <div className="px-2 py-1 rounded bg-[#021420] border border-slate-800">GPU: <span className="text-emerald-300 font-medium">Available</span></div>
        </div>

        <div className="text-slate-500">© EDGE-AI WEATHER FUSION</div>
      </footer>
    </div>
  );
}
