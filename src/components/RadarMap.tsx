import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RainViewerTileLayer from '../utils/rainviewerTile';
import HeatmapCanvas from '../utils/heatmapCanvas';

type RadarMapProps = {
  center?: [number, number];
  zoom?: number;
  currentFrameTimestamp?: string | number;
  width?: number;
  height?: number;
};

function RadarLayerManager({ time }: { time?: string | number }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const RadarLayerClass: any = RainViewerTileLayer;
    const radarLayer = new RadarLayerClass('', {
      time: time ?? '0',
      maxNativeZoom: 7,
      maxZoom: 18,
      tileSize: 256,
      opacity: 0.6,
      errorTileUrl: ''
    });

    // Suppress missing tile images visually by blanking the tile src on error
    (radarLayer as any).on('tileerror', (e: any) => {
      try {
        if (e && e.tile) e.tile.src = '';
      } catch (_) {}
    });

    radarLayer.addTo(map as any);
    layerRef.current = radarLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, time]);

  return null;
}

export default function RadarMap({
  center = [37.7749, -122.4194],
  zoom = 5,
  currentFrameTimestamp,
  width = 800,
  height = 600
}: RadarMapProps) {
  return (
    <div style={{ position: 'relative', width, height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        maxZoom={19}
        minZoom={2}
        zoomControl={true}
        preferCanvas={true}
      >
        {/* Base map with crisp close zooms */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxNativeZoom={19}
          maxZoom={19}
        />
        <RadarLayerManager time={currentFrameTimestamp} />
      </MapContainer>

      {/* Heatmap canvas overlay: the draw function should consume your temperature grid */}
      <HeatmapCanvas
        width={width}
        height={height}
        alpha={0.18}
        draw={(ctx) => {
          // Example placeholder draw: translucent red rectangle (replace with heatmap pixels)
          ctx.fillStyle = 'red';
          ctx.fillRect(0, 0, width, height);
        }}
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
