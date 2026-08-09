// api/tile-proxy.js
// Vercel / serverless style handler that fetches a remote tile and returns it with CORS headers.
// Security: this proxy restricts which hosts are allowed to prevent open proxy abuse.

export default async function handler(req, res) {
  try {
    const url = req.query?.url || (req.url && new URL(req.url, `http://${req.headers.host}`).searchParams.get('url'));
    if (!url) return res.status(400).send('missing url');
    // allow only RainViewer tilecache host for safety
    const allowedHost = 'tilecache.rainviewer.com';
    let parsed;
    try { parsed = new URL(url); } catch (e) { return res.status(400).send('invalid url'); }
    if (!parsed.hostname.endsWith(allowedHost)) return res.status(400).send('disallowed host');

    const fetchRes = await fetch(url);
    if (!fetchRes.ok) return res.status(fetchRes.status).send('upstream error');
    const arrayBuffer = await fetchRes.arrayBuffer();
    const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300');
    // write body
    const buffer = Buffer.from(arrayBuffer);
    res.status(200).send(buffer);
  } catch (err) {
    console.error('tile-proxy error', err);
    res.status(500).send('internal error');
  }
}
