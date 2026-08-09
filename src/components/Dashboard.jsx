import React from 'react';

export default function Dashboard({ view, setView, startLiveFusion, stopLiveFusion, liveRunning, threatScore }) {
  return (
    <div style={{ padding: 12 }}>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setView('main')} disabled={view==='main'}>Main User Interface</button>
        <button onClick={() => setView('radar')} disabled={view==='radar'}>Active Radar View</button>
        <button onClick={() => setView('route')} disabled={view==='route'}>Navigation Route Radar</button>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <h3>Run Live Threat Fusion</h3>
          <p>Live predictive engine running: {liveRunning ? 'Yes' : 'No'}</p>
          <button onClick={startLiveFusion} disabled={liveRunning}>Start</button>
          <button onClick={stopLiveFusion} disabled={!liveRunning}>Stop</button>
          <div style={{ marginTop: 8 }}>Current Threat Score: <strong>{(threatScore||0).toFixed(2)}</strong></div>
        </div>

        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <h3>7-day Forecast</h3>
          <p>Forecast cards placeholder — integrate your weather API here.</p>
        </div>

        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <h3>Air Quality</h3>
          <p>Air quality card placeholder.</p>
        </div>

        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <h3>Pollen</h3>
          <p>Pollen data placeholder.</p>
        </div>

        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <h3>Supabase Telemetry</h3>
          <p>Telemetry placeholder — wire up Supabase client if desired.</p>
        </div>

        <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <h3>WebGPU Camera Scanner</h3>
          <p>WebGPU camera scanner placeholder for mobile camera diagnostics.</p>
        </div>
      </div>
    </div>
  );
}
