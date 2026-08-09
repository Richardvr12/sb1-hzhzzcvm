import React, { useEffect, useRef, useState } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import TerminalLog from './components/TerminalLog';
import { createPredictorWorker } from './utils/predictorClient';
import WeatherBackgroundWrapper from './components/WeatherBackgroundWrapper';
import './styles/app.css';

export default function App() {
  const [view, setView] = useState('main');
  const [predictionLog, setPredictionLog] = useState(() => {
    try { const raw = localStorage.getItem('predictionLog'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [liveRunning, setLiveRunning] = useState(false);
  const [threatScore, setThreatScore] = useState(0);
  const workerRef = useRef(null);

  // Weather background state (demo controls)
  const [weatherCondition, setWeatherCondition] = useState('clear');
  const [temperature, setTemperature] = useState(68);

  useEffect(() => { try { localStorage.setItem('predictionLog', JSON.stringify(predictionLog)); } catch (e) {} }, [predictionLog]);

  useEffect(() => {
    return () => { if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; } };
  }, []);

  const appendLog = (msg) => {
    const entry = { ts: Date.now(), msg };
    setPredictionLog((p) => [entry, ...p].slice(0, 500));
  };

  const startLiveFusion = () => {
    if (workerRef.current) return;
    const client = createPredictorWorker((tele) => {
      appendLog(`Telemetry score=${tele.score.toFixed(3)} (${tele.details})`);
      setThreatScore(tele.score);
    }, (th) => {
      appendLog(`Threat detected severity=${th.severity.toFixed(3)} note=${th.note}`);
    });
    client.start();
    workerRef.current = client;
    setLiveRunning(true);
    appendLog('Predictive engine started');
  };

  const stopLiveFusion = () => {
    if (!workerRef.current) return;
    workerRef.current.stop();
    workerRef.current.terminate();
    workerRef.current = null;
    setLiveRunning(false);
    appendLog('Predictive engine stopped');
  };

  // derive a simple weather state for dashboard branding from demo weatherCondition
  let weatherState = null;
  if (weatherCondition === 'thunderstorm') weatherState = 'THUNDERSTORM_RISK';
  else if (weatherCondition === 'snow') weatherState = 'BLIZZARD';
  else if (weatherCondition === 'cold') weatherState = 'COLD_EXPOSURE';
  else if (weatherCondition === 'rain' || weatherCondition === 'thunderstorm') weatherState = 'LIGHTNING';

  return (
    <WeatherBackgroundWrapper weatherCondition={weatherCondition} temperature={temperature}>
      <div className="frosted" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="header-bar">
          <div className="logo-title">
            <div className="logo-mark">VL</div>
            <div>
              <div className="title-main">Vanguard-W Edge-AI Weather</div>
              <div className="title-sub">V-L Weather</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Weather:</label>
            <select value={weatherCondition} onChange={(e) => setWeatherCondition(e.target.value)}>
              <option value="clear">Clear</option>
              <option value="partly cloudy">Partly Cloudy</option>
              <option value="rain">Rain</option>
              <option value="thunderstorm">Thunderstorm</option>
              <option value="snow">Snow</option>
              <option value="cold">Cold</option>
              <option value="cloudy">Cloudy</option>
            </select>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Temp (°F):</label>
            <input type="number" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={{ width: 72 }} />
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, padding: 12, gap: 12 }}>
          <main style={{ flex: 1, overflow: 'auto' }}>
            <Dashboard view={view} setView={setView} startLiveFusion={startLiveFusion} stopLiveFusion={stopLiveFusion} liveRunning={liveRunning} threatScore={threatScore} weatherState={weatherState} />
            <div style={{ padding: 8 }}>
              {view === 'main' && <MapView appendLog={(m) => appendLog(m)} />}
              {view === 'radar' && <MapView appendLog={(m) => appendLog(m)} />}
              {view === 'route' && <MapView appendLog={(m) => appendLog(m)} />}
            </div>
          </main>

          <aside style={{ width: 420, borderLeft: '1px solid rgba(255,255,255,0.04)', padding: 12, boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, color: '#fff' }}>Terminal Log</h3>
            <div className="terminal">
              <TerminalLog entries={predictionLog} />
            </div>
            <div style={{ marginTop: 12 }}>
              <h4 style={{ color: '#fff' }}>Threat Output</h4>
              <div style={{ padding: 8, border: '1px solid rgba(57,255,20,0.12)', borderRadius: 6, color: 'var(--neon-green)' }}>{(threatScore||0).toFixed(3)}</div>
            </div>
          </aside>
        </div>
      </div>
    </WeatherBackgroundWrapper>
  );
}
