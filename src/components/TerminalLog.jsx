import React from 'react';

export default function TerminalLog({ entries }) {
  return (
    <div style={{ background: '#0b0b0b', color: '#e6e6e6', padding: 8, borderRadius: 6, fontFamily: 'monospace', fontSize: 12, height: 200, overflowY: 'auto' }}>
      {entries.length === 0 ? <div style={{opacity:0.7}}>Terminal empty — predictions and telemetry will appear here.</div> : null}
      {entries.map((e, i) => (
        <div key={i} style={{ padding: '2px 0' }}>[{new Date(e.ts).toLocaleTimeString()}] {e.msg}</div>
      ))}
    </div>
  );
}
