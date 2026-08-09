// src/utils/geocode.js
export async function nominatimSearch(q, limit = 6) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Nominatim error: ' + res.status);
  return res.json();
}
