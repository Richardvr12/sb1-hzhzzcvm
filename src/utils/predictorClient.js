// src/utils/predictorClient.js
export function createPredictorWorker(onTelemetry, onThreat) {
  const worker = new Worker(new URL('../worker/predictor.js', import.meta.url), { type: 'module' });
  worker.onmessage = (e) => {
    const { type, payload } = e.data;
    if (type === 'telemetry') onTelemetry && onTelemetry(payload);
    if (type === 'threat') onThreat && onThreat(payload);
  };
  return {
    start: () => worker.postMessage({ type: 'start' }),
    stop: () => worker.postMessage({ type: 'stop' }),
    terminate: () => worker.terminate()
  };
}
