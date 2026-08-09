import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import RainViewerTileLayer from '../utils/rainviewerTile';
import useWindVectors from '../hooks/useWindVectors';
import HeatmapCanvas from '../utils/heatmapCanvas';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type RouteWeatherMapProps = {
  center?: [number, number];
  zoom?: number;
  currentFrameTimestamp?: string | number;
  width?: number;
  height?: number;
};

export default function RouteWeatherMap({
  center = [37.7749, -122.4194],
  zoom = 8,
  currentFrameTimestamp,
  width = 800,
  height = 600
}: RouteWeatherMapProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const { frames, loading, error, getAnglesForFrame } = useWindVectors(center[0], center[1]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Advance frame animation when frames are available
  useEffect(() => {
    if (!frames || frames.length === 0) return;
    const timer = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, 1000); // 1s per frame; adjust as needed
    return () => clearInterval(timer);
  }, [frames]);

  // Draw wind vectors onto canvas when frameIndex changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear before redraw to avoid artifacts
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const angles = getAnglesForFrame(frameIndex) as number[][];
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,255,0.9)';
    ctx.lineWidth = 2;

    const cols = angles[0]?.length ?? 1;
    const rows = angles.length ?? 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const angle = angles[r][c] ?? 0;
        const cellW = canvas.width / cols;
        const cellH = canvas.height / rows;
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;
        const len = Math.min(cellW, cellH) * 0.35;

        // Draw rotated arrow
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-len * 0.6, 0);
        ctx.lineTo(len, 0);
        ctx.moveTo(len - 6, -6);
        ctx.lineTo(len, 0);
        ctx.lineTo(len - 6, 6);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }, [frameIndex, getAnglesForFrame]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        maxZoom={19}
        preferCanvas={true}
      >
        {/* Crisp base map */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxNativeZoom={19} maxZoom={19} />

        {/* We add a RainViewer layer imperatively in consumer code or via a manager if desired. */}
        {/* For simplicity we leave it to the RadarMap implementation to manage radar tiles where needed. */}
      </MapContainer>

      {/* Wind arrows canvas overlay */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Temperature heatmap canvas overlay for route (example placeholder draw) */}
      <HeatmapCanvas
        width={width}
        height={height}
        alpha={0.18}
        draw={(ctx) => {
          // Placeholder heatmap drawing (replace with real temp grid sampling)
          ctx.fillStyle = 'rgba(255,165,0,1)';
          ctx.fillRect(10, 10, 50, 50);
        }}
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );
}
