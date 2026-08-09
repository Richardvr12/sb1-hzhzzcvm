import React, { useEffect, useRef } from 'react';

type HeatmapCanvasProps = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
  alpha?: number; // translucent alpha range ~0.16 - 0.22
  style?: React.CSSProperties;
  className?: string;
};

export default function HeatmapCanvas({
  width,
  height,
  draw,
  alpha = 0.18,
  style,
  className
}: HeatmapCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear before each draw to prevent stale pixels accumulation
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.globalAlpha = alpha;
    draw(ctx);
    ctx.restore();
  }, [width, height, draw, alpha]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        ...style
      }}
      className={className}
    />
  );
}
