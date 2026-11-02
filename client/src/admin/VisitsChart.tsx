import { useState } from 'react';
import type { DailyRow } from '../lib/api';

const HEIGHT = 160;
const GAP = 2;

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** One bar per day (visits), with a hover/focus tooltip and an accessible table underneath. */
export function VisitsChart({ daily }: { daily: DailyRow[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.visits));
  const n = daily.length;
  const labelEvery = n > 30 ? 10 : n > 14 ? 5 : n > 7 ? 2 : 1;
  const active = hover !== null ? daily[hover] : null;

  return (
    <div>
      <div className="relative">
        {/* Tooltip */}
        {active && hover !== null && (
          <div
            className="absolute -top-2 z-10 -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl glass-panel-elevated border border-white/15 text-[11px] font-mono text-slate-200 whitespace-nowrap pointer-events-none shadow-xl"
            style={{ left: `${((hover + 0.5) / n) * 100}%` }}
          >
            <div className="text-white font-bold mb-0.5">{shortDate(active.date)}</div>
            <div>{active.visits} visits</div>
            <div className="text-slate-400">{active.pageViews} page views</div>
            <div className="text-slate-400">{active.uniqueVisitors} unique visitors</div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${n * 10} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-40 block"
          role="img"
          aria-label={`Visits per day for the last ${n} days, peak ${max}`}
          onMouseLeave={() => setHover(null)}
        >
          {/* Recessive gridlines at 50% and 100% of the peak */}
          {[0.5, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={n * 10}
              y1={HEIGHT - f * (HEIGHT - 8)}
              y2={HEIGHT - f * (HEIGHT - 8)}
              stroke="rgba(148,163,184,0.15)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {daily.map((d, i) => {
            const h = d.visits === 0 ? 0 : Math.max(3, (d.visits / max) * (HEIGHT - 8));
            const barW = 10 - GAP;
            return (
              <g key={d.date} onMouseEnter={() => setHover(i)}>
                {/* Full-height hit target, larger than the bar itself */}
                <rect x={i * 10} y={0} width={10} height={HEIGHT} fill="transparent" />
                {h > 0 && (
                  <path
                    d={roundedTopBar(i * 10 + GAP / 2, HEIGHT - h, barW, h, Math.min(2, h))}
                    fill={hover === i ? '#22d3ee' : '#06b6d4'}
                  />
                )}
              </g>
            );
          })}
          <line x1={0} x2={n * 10} y1={HEIGHT} y2={HEIGHT} stroke="rgba(148,163,184,0.35)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>

        {/* X-axis labels */}
        <div className="flex text-[10px] font-mono text-slate-500 mt-1.5">
          {daily.map((d, i) => (
            <span key={d.date} className="flex-1 text-center truncate">
              {i % labelEvery === 0 || i === n - 1 ? shortDate(d.date) : ''}
            </span>
          ))}
        </div>
        <div className="absolute top-0 right-0 text-[10px] font-mono text-slate-500">peak {max}</div>
      </div>

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-slate-400 hover:text-cyan-300 font-mono">Show as table</summary>
        <table className="w-full mt-2 font-mono text-[11px]">
          <thead className="text-slate-400 text-left">
            <tr>
              <th className="py-1 font-semibold">Date</th>
              <th className="py-1 font-semibold text-right">Visits</th>
              <th className="py-1 font-semibold text-right">Page views</th>
              <th className="py-1 font-semibold text-right">Unique</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {[...daily].reverse().map((d) => (
              <tr key={d.date} className="border-t border-white/5">
                <td className="py-1">{d.date}</td>
                <td className="py-1 text-right">{d.visits}</td>
                <td className="py-1 text-right">{d.pageViews}</td>
                <td className="py-1 text-right">{d.uniqueVisitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/** Bar path with rounded top corners and a square base on the axis. */
function roundedTopBar(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}
