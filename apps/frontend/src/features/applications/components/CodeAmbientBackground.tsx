import { useEffect, useRef } from 'react';

type CodeAmbientBackgroundProps = {
  accent?: string;
  opacity?: number;
  className?: string;
};

export default function CodeAmbientBackground({
  accent = '#9B6CFF',
  opacity = 0.1,
  className,
}: CodeAmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement as HTMLElement | null;
    if (!parent) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    const setSize = () => {
      const { width, height } = parent.getBoundingClientRect();
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    setSize();

    const glyphs = '{}()[]<>;:/*\\=+'.split('');
    const cols = Math.max(12, Math.floor(canvas.width / DPR / 80));
    const rows = Math.max(8, Math.floor(canvas.height / DPR / 80));
    const points: {
      x: number;
      y: number;
      speed: number;
      char: string;
      size: number;
    }[] = [];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        points.push({
          x: c * (canvas.width / DPR / cols) + Math.random() * 20,
          y: Math.random() * (canvas.height / DPR),
          speed: 0.25 + Math.random() * 0.4,
          char: glyphs[Math.floor(Math.random() * glyphs.length)],
          size: 10 + Math.random() * 6,
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = accent;

      for (const p of points) {
        ctx.font = `${p.size}px Nunito, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
        ctx.fillText(p.char, p.x, p.y);
        if (!prefersReduced) {
          p.y += p.speed;
          if (p.y > canvas.height / DPR + 10) {
            p.y = -10;
            p.char = glyphs[Math.floor(Math.random() * glyphs.length)];
          }
        }
      }
    };

    draw();
    intervalRef.current = window.setInterval(draw, 33);

    const onResize = () => {
      setSize();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [accent, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden
    />
  );
}
