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
export async function sampleRadarIntensityAtLatLng(lat, lon, framePath) {
  if (!framePath) return null;
  const z = 6;
  const tileX = long2tile(lon, z);
  const tileY = lat2tile(lat, z);
  const url = `https://tilecache.rainviewer.com/v2/radar/${framePath}/${z}/${tileX}/${tileY}/2/1_1.png`;
  try {
    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) return null;
    const blob = await resp.blob();

    // Use createImageBitmap when available (best for workers/OffscreenCanvas)
    let imgBitmap = null;
    try {
      imgBitmap = await createImageBitmap(blob);
    } catch (e) {
      // fallback to HTMLImageElement
    }

    let width, height, imageBitmap;
    if (imgBitmap) {
      width = imgBitmap.width; height = imgBitmap.height; imageBitmap = imgBitmap;
      // draw to canvas
      const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(width, height) : document.createElement('canvas');
      if (!canvas) return null;
      if (canvas instanceof HTMLCanvasElement) { canvas.width = width; canvas.height = height; }
      const ctx = canvas.getContext('2d');
      if (imgBitmap instanceof ImageBitmap) {
        if (typeof canvas.transferFromImageBitmap === 'function') {
          // not necessary
        }
        ctx.drawImage(imgBitmap, 0, 0);
      }
      const pixelX = Math.floor((lonTilePos(lon, z) - tileX) * width);
      const pixelY = Math.floor((latTilePos(lat, z) - tileY) * height);
      const data = ctx.getImageData(pixelX, pixelY, 1, 1).data;
      const [r,g,b,a] = data;
      if (a === 0) return 0;
      const brightness = (0.299*r + 0.587*g + 0.114*b)/255;
      return brightness;
    } else {
      // fallback
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
    console.warn('Radar tile sample failed', err);
    return null;
  }
}

function long2tile(lon, zoom) { return Math.floor((lon + 180) / 360 * Math.pow(2, zoom)); }
function lat2tile(lat, zoom) { return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)); }
function lonTilePos(lon, zoom) { return (lon + 180) / 360 * Math.pow(2, zoom); }
function latTilePos(lat, zoom) { const rad = lat * Math.PI / 180; const n = Math.log(Math.tan(rad) + 1/Math.cos(rad)); return (1 - n / Math.PI) / 2 * Math.pow(2, zoom); }
