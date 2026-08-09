// src/utils/rainviewer.js
export async function fetchRainviewerFrames() {
  const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
  if (!res.ok) throw new Error('rainviewer metadata error');
  const json = await res.json();
  const frames = (json && json.radar && json.radar.past) ? json.radar.past.map(f => f.path) : [];
  if (!frames.length && json && json.radar && json.radar.now) frames.push(json.radar.now.path);
  return frames;
}

export function tileUrlForFrame(framePath) {
  return `https://tilecache.rainviewer.com/v2/radar/${framePath}/{z}/{x}/{y}/2/1_1.png`;
}

// sample approximate intensity at lat/lon for the provided frame
// This function first tries a direct fetch of the RainViewer tile. If the browser
// blocks pixel access due to CORS, it will fall back to our same-origin tile proxy
// at /api/tile-proxy which fetches the tile server-side and returns it with CORS headers.
export async function sampleRadarIntensityAtLatLng(lat, lon, framePath) {
  if (!framePath) return null;
  const z = 6;
  const tileX = long2tile(lon, z);
  const tileY = lat2tile(lat, z);
  const remoteUrl = `https://tilecache.rainviewer.com/v2/radar/${framePath}/${z}/${tileX}/${tileY}/2/1_1.png`;

  // helper to do the pixel sampling from a blob
  async function sampleFromBlob(blob) {
    try {
      let imgBitmap = null;
      try { imgBitmap = await createImageBitmap(blob); } catch (e) { imgBitmap = null; }

      if (imgBitmap) {
        const width = imgBitmap.width, height = imgBitmap.height;
        const canvas = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(width, height) : document.createElement('canvas');
        if (canvas instanceof HTMLCanvasElement) { canvas.width = width; canvas.height = height; }
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgBitmap, 0, 0);
        const pixelX = Math.floor((lonTilePos(lon, z) - tileX) * width);
        const pixelY = Math.floor((latTilePos(lat, z) - tileY) * height);
        const data = ctx.getImageData(pixelX, pixelY, 1, 1).data;
        const [r,g,b,a] = data; if (a === 0) return 0;
        const brightness = (0.299*r + 0.587*g + 0.114*b)/255; return brightness;
      } else {
        const img = document.createElement('img');
        img.crossOrigin = 'Anonymous';
        const imgLoad = new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
        img.src = URL.createObjectURL(blob);
        await imgLoad;
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const pixelX = Math.floor((lonTilePos(lon, z) - tileX) * img.width);
        const pixelY = Math.floor((latTilePos(lat, z) - tileY) * img.height);
        const data = ctx.getImageData(pixelX, pixelY, 1, 1).data;
        const [r,g,b,a] = data; if (a === 0) return 0;
        const brightness = (0.299*r + 0.587*g + 0.114*b)/255; return brightness;
      }
    } catch (err) {
      console.warn('sampleFromBlob failed', err);
      return null;
    }
  }

  // First attempt direct fetch (may succeed for simple tile loads)
  try {
    const resp = await fetch(remoteUrl, { mode: 'cors' });
    if (resp.ok) {
      const blob = await resp.blob();
      const val = await sampleFromBlob(blob);
      if (val !== null) return val;
    }
  } catch (err) {
    // continue to proxy fallback
    console.warn('Direct tile fetch failed or CORS prevented sampling, will try proxy', err);
  }

  // Fallback to same-origin proxy endpoint
  try {
    const proxyUrl = `/api/tile-proxy?url=${encodeURIComponent(remoteUrl)}`;
    const resp2 = await fetch(proxyUrl);
    if (!resp2.ok) return null;
    const blob2 = await resp2.blob();
    return await sampleFromBlob(blob2);
  } catch (err) {
    console.warn('Proxy tile fetch failed', err);
    return null;
  }
}

function long2tile(lon, zoom) { return Math.floor((lon + 180) / 360 * Math.pow(2, zoom)); }
function lat2tile(lat, zoom) { return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)); }
function lonTilePos(lon, zoom) { return (lon + 180) / 360 * Math.pow(2, zoom); }
function latTilePos(lat, zoom) { const rad = lat * Math.PI / 180; const n = Math.log(Math.tan(rad) + 1/Math.cos(rad)); return (1 - n / Math.PI) / 2 * Math.pow(2, zoom); }
