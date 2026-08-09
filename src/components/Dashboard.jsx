import React, { useEffect, useState } from 'react';
import darkClouds from '../assets/weather-brands/dark_clouds.png';
import snowActive from '../assets/weather-brands/snow_active.png';
import coldExposure from '../assets/weather-brands/cold_exposure.png';
import lightningStrike from '../assets/weather-brands/lightning_strike.png';

export default function Dashboard({ view, setView, startLiveFusion, stopLiveFusion, liveRunning, threatScore, weatherState }) {
  // Map weather states to branding assets and text
  const weatherBranding = {
    THUNDERSTORM_RISK: {
      bg: darkClouds,
      header: 'THUNDERSTORM MITIGATION'
    },
    BLIZZARD: {
      bg: snowActive,
      header: 'BLIZZARD SAFETY PROTOCOL'
    },
    COLD_EXPOSURE: {
      bg: coldExposure,
      header: 'COLD EXPOSURE ALERT'
    },
    LIGHTNING: {
      bg: lightningStrike,
      header: 'LIGHTNING STRIKE WARNING'
    }
  };

  // Default gradient fallback (used when an image is missing or for clear/sunny states)
  const defaultGradient = 'linear-gradient(180deg, rgba(6,12,34,0.9), rgba(12,22,40,0.85))';

  const branding = weatherBranding[weatherState] || { bg: null, header: 'Vanguard Dashboard' };

  // bgToUse will be either the resolved branding.bg (if it loads) or null -> fall back to gradient
  const [bgToUse, setBgToUse] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setBgToUse(null);

    if (branding && branding.bg) {
      // attempt to preload the image and only use it if it successfully loads
      const img = new Image();
      img.src = branding.bg;
      img.onload = () => {
        if (!cancelled) setBgToUse(branding.bg);
      };
      img.onerror = () => {
        // image failed to load; keep bgToUse as null to use gradient fallback
        if (!cancelled) setBgToUse(null);
      };
    } else {
      // explicit no image for this state -> keep null to use gradient
      setBgToUse(null);
    }

    return () => { cancelled = true; };
  }, [weatherState, branding]);

  const headerStyle = {
    backgroundImage: bgToUse
      ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${bgToUse})`
      : defaultGradient,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>{branding.header}</h2>
      </div>

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
