import { useEffect, useState } from 'react';

export type WindFrame = {
  timestamp: number;
  u: number[][]; // grid of u components
  v: number[][]; // grid of v components
};

export default function useWindVectors(latitude: number, longitude: number) {
  const [frames, setFrames] = useState<WindFrame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Example Open-Meteo call — adapt the endpoint to your gridded source if needed
    const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=u_component_of_wind_10m,v_component_of_wind_10m&timezone=UTC`;

    fetch(endpoint)
      .then((r) => {
        if (!r.ok) throw new Error(`Wind fetch failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const times: string[] = data.hourly?.time ?? [];
        const uArr: number[] = data.hourly?.u_component_of_wind_10m ?? [];
        const vArr: number[] = data.hourly?.v_component_of_wind_10m ?? [];

        const assembled: WindFrame[] = times.map((t: string, i: number) => ({
          timestamp: new Date(t).getTime(),
          u: [[uArr[i] ?? 0]],
          v: [[vArr[i] ?? 0]]
        }));

        setFrames(assembled);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  const getAnglesForFrame = (frameIndex: number) => {
    const frame = frames[frameIndex];
    if (!frame) return [] as number[][];
    const angles: number[][] = frame.u.map((row, r) =>
      row.map((uVal, c) => Math.atan2(frame.v[r][c], uVal))
    );
    return angles;
  };

  return {
    frames,
    loading,
    error,
    getAnglesForFrame
  };
}
