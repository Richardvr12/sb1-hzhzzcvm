// src/worker/predictor.js
// Background worker that runs a predictive loop. Tries to load onnxruntime-web (webgpu) if available, but falls back to simulated predictions.
self.onmessage = async function(e) {
  const { type } = e.data;
  if (type === 'start') {
    // try to import onnxruntime-web
    let ort = null;
    try {
      importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort-web.min.js');
      ort = self.ort || null;
    } catch (err) {
      // ignore
      ort = null;
    }

    let running = true;
    self.postMessage({ type: 'started' });

    const loop = async () => {
      while (running) {
        let score = Math.random();
        let details = null;
        if (ort) {
          // If a model were available, you'd create session and run inference here.
          // This worker intentionally simulates inference if no model is supplied.
          try {
            // simulated compute delay
            await new Promise((r) => setTimeout(r, 20));
            score = Math.min(1, Math.max(0, 0.2 + 0.8 * Math.random()));
            details = 'onnx simulated';
          } catch (err) {
            details = 'onnx error';
          }
        } else {
          // simulate heavier compute
          await new Promise((r) => setTimeout(r, 100));
          score = Math.min(1, Math.max(0, 0.1 + 0.9 * Math.random()));
          details = 'simulated';
        }
        const payload = { ts: Date.now(), score, details };
        self.postMessage({ type: 'telemetry', payload });
        // occasionally send a threat message
        if (score > 0.8) {
          self.postMessage({ type: 'threat', payload: { ts: Date.now(), severity: score, note: 'High-risk prediction' } });
        }
        // continue loop
      }
    };

    loop();

    self.onmessage = function(msg) {
      if (msg.data && msg.data.type === 'stop') {
        running = false;
        self.postMessage({ type: 'stopped' });
      }
    };
  }
};
