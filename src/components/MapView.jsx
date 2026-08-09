import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { nominatimSearch } from '../utils/geocode';
import { fetchRainviewerFrames, tileUrlForFrame, sampleRadarIntensityAtLatLng } from '../utils/rainviewer';

const DEFAULT_CENTER = [37.7749, -122.4194];

function MapControls({ onSearchResult, onUseCurrentLocation }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  async function onSearch(e) {
    e && e.preventDefault();
    if (!q) return;
    try {
      const results = await nominatimSearch(q);
      setSuggestions(results);
      if (results.length) onSearchResult([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
    } catch (err) {
      console.error('Geocode error', err);
    }
  }

  return (
    <div className="map-controls">
      <form onSubmit={onSearch}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search places (OpenStreetMap)" />
        <button type="submit">Search</button>
        <button type="button" onClick={onUseCurrentLocation}>Current Location</button>
      </form>
      <ul className="suggestions">
        {suggestions.map((s, i) => (
          <li key={i}>
            <button onClick={() => onSearchResult([parseFloat(s.lat), parseFloat(s.lon)])}>
              {s.display_name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MapView() {
  const mapRef = useRef(null);
  const [position, setPosition] = useState(null); // last searched / selected position
  const [userLocation, setUserLocation] = useState(null); // live device GPS
  const [isNavigating, setIsNavigating] = useState(false); // follow-user mode
  const isNavigatingRef = useRef(isNavigating);
  const [radarFrames, setRadarFrames] = useState([]);
  const [radarFrameIndex, setRadarFrameIndex] = useState(0);
  const radarLayerRef = useRef(null);
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const [routeRiskSegments, setRouteRiskSegments] = useState([]);
  const [predictionLog, setPredictionLog] = useState(() => {
    try {
      const raw = localStorage.getItem('predictionLog');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // keep ref in sync with state so watchPosition callback reads latest
  useEffect(() => { isNavigatingRef.current = isNavigating; }, [isNavigating]);

  // persist prediction log
  useEffect(() => {
    try { localStorage.setItem('predictionLog', JSON.stringify(predictionLog)); } catch (e) {}
  }, [predictionLog]);

  useEffect(() => {
    (async () => {
      try {
        const frames = await fetchRainviewerFrames();
        setRadarFrames(frames);
      } catch (err) {
        console.warn('Failed to fetch radar frames', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!radarFrames.length) return;
    const id = setInterval(() => setRadarFrameIndex((i) => (i + 1) % radarFrames.length), 700);
    return () => clearInterval(id);
  }, [radarFrames]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !radarFrames.length) return;
    const frame = radarFrames[radarFrameIndex];
    const url = tileUrlForFrame(frame);
    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current);
    }
    radarLayerRef.current = L.tileLayer(url, { opacity: 0.5, pane: 'overlayPane' });
    radarLayerRef.current.addTo(map);
  }, [radarFrameIndex, radarFrames]);

  // Start geolocation watch on mount to continuously track device movement.
  // Only pan/follow when isNavigating is true; preserve user's manual zoom level.
  useEffect(() => {
    if (!navigator.geolocation) return undefined;
    let watchId = null;

    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);

          if (isNavigatingRef.current && mapRef.current) {
            try {
              // Use flyTo with animate to keep user's zoom level and provide smooth movement
              const currentZoom = mapRef.current.getZoom();
              mapRef.current.flyTo([latitude, longitude], currentZoom, { animate: true, duration: 0.8 });
            } catch (err) {
              // Fallback to setView preserving zoom if flyTo is unsupported
              const currentZoom = mapRef.current.getZoom();
              mapRef.current.setView([latitude, longitude], currentZoom);
            }
          }
        },
        (err) => console.error('geolocation watch error', err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    } catch (e) {
      console.warn('geolocation.watchPosition not available', e);
    }

    return () => {
      if (watchId != null && navigator.geolocation && typeof navigator.geolocation.clearWatch === 'function') {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  function handleMapCreated(mapInstance) {
    mapRef.current = mapInstance;
    if (!mapInstance.getPane('overlayPane')) mapInstance.createPane('overlayPane');
  }

  async function onSearchResult(latlng) {
    setPosition(latlng);
    // keep current zoom level, center on searched location
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setView(latlng, currentZoom);
    }
    setPredictionLog((p) => [`Searched: ${latlng.join(', ')}`, ...p].slice(0, 200));
  }

  function onUseCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        setPosition(latlng);
        setUserLocation(latlng);
        // keep current zoom level when using location
        if (mapRef.current) {
          const currentZoom = mapRef.current.getZoom();
          mapRef.current.setView(latlng, currentZoom);
        }
        setPredictionLog((p) => [`Current location: ${latlng.join(', ')}`, ...p].slice(0, 200));
      },
      (err) => {
        alert('Could not get location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function calculateRouteTo(destLatLng) {
    if (!position) {
      alert('Set start position first (search or current location).');
      return;
    }
    const start = [position[1], position[0]]; // lon,lat
    const end = [destLatLng[1], destLatLng[0]];
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) { setPredictionLog((p) => [`Route failed: ${res.status}`, ...p]); return; }
      const data = await res.json();
      if (!data.routes || !data.routes.length) { setPredictionLog((p) => [`No route found`, ...p]); return; }
      const route = data.routes[0].geometry;
      setRouteGeoJson(route);

      // sample
      const line = turf.lineString(route.coordinates);
      const length = turf.length(line, { units: 'kilometers' });
      const samples = Math.min(Math.max(Math.floor(length * 4), 10), 200);
      const sampledPoints = [];
      for (let i = 0; i <= samples; i++) {
        const pt = turf.along(line, (i / samples) * length, { units: 'kilometers' });
        sampledPoints.push(pt.geometry.coordinates);
      }

      const frame = radarFrames[radarFrameIndex];
      const riskSegments = [];
      let currentSegment = { coords: [], risk: null };

      for (const [lon, lat] of sampledPoints) {
        const intensity = await sampleRadarIntensityAtLatLng(lat, lon, frame);
        const risk = intensity == null ? 'unknown' : intensity > 0.6 ? 'high' : intensity > 0.2 ? 'medium' : 'low';
        const latlng = [lat, lon];
        if (currentSegment.risk === null) {
          currentSegment.risk = risk; currentSegment.coords.push(latlng);
        } else if (currentSegment.risk === risk) {
          currentSegment.coords.push(latlng);
        } else {
          riskSegments.push({ ...currentSegment }); currentSegment = { coords: [latlng], risk };
        }
      }
      if (currentSegment.coords.length) riskSegments.push(currentSegment);
      setRouteRiskSegments(riskSegments);

      setPredictionLog((p) => [`Route: ${Math.round(length * 100) / 100} km, segments: ${riskSegments.length}`, ...p].slice(0,200));
      if (mapRef.current) {
        const latlngs = route.coordinates.map(([lon, lat]) => [lat, lon]);
        // keep the current zoom level; center to route midpoint instead of fitBounds
        const mid = latlngs[Math.floor(latlngs.length / 2)];
        const currentZoom = mapRef.current.getZoom();
        mapRef.current.setView(mid, currentZoom);
      }
    } catch (err) {
      console.error('Route error', err);
      setPredictionLog((p) => [`Route error: ${err.message}`, ...p].slice(0,200));
    }
  }

  // click handler to calculate route to clicked point
  function MapClickHandler() {
    useMapEvents({ click(e) { calculateRouteTo([e.latlng.lat, e.latlng.lng]); } });
    return null;
  }

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '70vw', height: '80vh' }}>
        <MapContainer center={DEFAULT_CENTER} zoom={10} whenCreated={handleMapCreated} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {position && <Marker position={position} />}
          {userLocation && <Marker position={userLocation} />}
          {routeGeoJson && <Polyline positions={routeGeoJson.coordinates.map(([lon, lat]) => [lat, lon])} color="blue" />}
          {routeRiskSegments.map((seg, i) => {
            const color = seg.risk === 'high' ? 'red' : seg.risk === 'medium' ? 'orange' : seg.risk === 'low' ? 'green' : 'gray';
            return <Polyline key={i} positions={seg.coords} color={color} weight={6} opacity={0.6} />;
          })}
          <MapClickHandler />
        </MapContainer>
      </div>

      <div style={{ width: '30vw', padding: 8 }}>
        <MapControls onSearchResult={onSearchResult} onUseCurrentLocation={onUseCurrentLocation} />

        <div style={{ marginTop: 12 }}>
          <h4>Route tools</h4>
          <p>Click a point on the map to calculate a route (or use search results).</p>
          <p style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => calculateRouteTo([37.7833, -122.4167])}>Calculate Route to SF City Hall</button>
            <button onClick={() => setIsNavigating((s) => !s)}>{isNavigating ? 'Stop Following' : 'Follow Device'}</button>
          </p>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Prediction log</h4>
          <ul style={{ maxHeight: 400, overflow: 'auto' }}>
            {predictionLog.map((line, idx) => <li key={idx}>{line}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
