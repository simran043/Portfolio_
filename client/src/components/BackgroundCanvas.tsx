import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

/** Subtle animated particle mesh behind the page. Draws a single still frame for reduced-motion users. */
export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;

    const setup = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.floor((width * height) / 16000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.6 + 0.8,
      }));
    };

    const draw = (move: boolean) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (move) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 85) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.12 * (1 - dist / 85)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      // Skip drawing while the tab is hidden to save battery.
      if (document.visibilityState === 'visible') draw(true);
      frame = window.requestAnimationFrame(loop);
    };

    const onResize = () => {
      setup();
      if (reduceMotion) draw(false);
    };

    setup();
    if (reduceMotion) draw(false);
    else loop();
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-40"
    ></canvas>
  );
}
