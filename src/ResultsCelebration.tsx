import { useEffect, useRef, useState } from 'react';

/** One short celebration per visit. Canvas never captures clicks or focus. */
export function ResultsCelebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || preference.matches) { setVisible(false); return; }
    let frame = 0;
    let stopped = false;
    let width = window.innerWidth, height = window.innerHeight;
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio; canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const colors = ['#e8bf60', '#9bcba7', '#e9eee3', '#cf9b6a', '#adbed5'];
    const particles = Array.from({ length: width < 650 ? 64 : 100 }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return { side, x: side === 1 ? -10 : width + 10, y: height * .7,
        vx: side * (120 + Math.random() * Math.min(width * .6, 650)), vy: -380 - Math.random() * 440,
        angle: Math.random() * Math.PI, spin: (Math.random() - .5) * 12,
        size: 5 + Math.random() * 6, color: colors[i % colors.length], delay: Math.random() * .3 };
    });
    const start = performance.now();
    const draw = (now: number) => {
      if (stopped) return;
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      if (elapsed >= 4.2) { setVisible(false); return; }
      for (const p of particles) {
        const t = elapsed - p.delay;
        if (t < 0) continue;
        const x = p.x + p.vx * (1 - Math.exp(-t * .5)) / .5;
        const y = p.y + p.vy * t + 250 * t * t;
        ctx.save();
        ctx.globalAlpha = Math.min(1, Math.max(0, (4.2 - elapsed) / .8));
        ctx.translate(x, y); ctx.rotate(p.angle + p.spin * t);
        ctx.scale(Math.max(.15, Math.abs(Math.cos(t * 6 + p.angle))), 1);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * .65);
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    const stop = () => { stopped = true; cancelAnimationFrame(frame); setVisible(false); };
    const onPreference = () => { if (preference.matches) stop(); };
    const onVisibility = () => { if (document.hidden) stop(); };
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopped = true; cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  return visible ? <canvas ref={canvasRef} className="results-confetti" aria-hidden="true"/> : null;
}
