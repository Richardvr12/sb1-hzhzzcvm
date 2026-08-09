import React, { useEffect, useRef, useState } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import TerminalLog from './components/TerminalLog';
import { createPredictorWorker } from './utils/predictorClient';

export default function App() {
  const [view, setView] = useState('main');
  const [predictionLog, setPredictionLog] = useState(() => {
    try { const raw = localStorage.getItem('predictionLog'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [liveRunning, setLiveRunning] = useState(false);
  const [threatScore, setThreatScore] = useState(0);
  const workerRef = useRef(null);

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
      // we might want to change UI state or trigger notifications here
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
        <h2>Vanguard UI — Live Radar & Predictive Navigation</h2>
      </header>
      <div style={{ display: 'flex', flex: 1 }}>
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Dashboard view={view} setView={setView} startLiveFusion={startLiveFusion} stopLiveFusion={stopLiveFusion} liveRunning={liveRunning} threatScore={threatScore} />
          <div style={{ padding: 8 }}>
            {view === 'main' && <MapView appendLog={(m) => appendLog(m)} />}
            {view === 'radar' && <MapView appendLog={(m) => appendLog(m)} />}
            {view === 'route' && <MapView appendLog={(m) => appendLog(m)} />}
          </div>
        </main>

        <aside style={{ width: 420, borderLeft: '1px solid #eee', padding: 12, boxSizing: 'border-box' }}>
          <h3>Terminal Log</h3>
          <TerminalLog entries={predictionLog} />
          <div style={{ marginTop: 12 }}>
            <h4>Threat Output</h4>
            <div style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}>{(threatScore||0).toFixed(3)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
