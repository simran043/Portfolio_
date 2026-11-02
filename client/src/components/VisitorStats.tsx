import { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from '../context/ToastContext';
import { playTone } from '../lib/audio';

const fmt = (n: number) => n.toLocaleString('en-IN');

/** Live visitor counters plus the like button. Hidden entirely when the backend is unreachable. */
export function VisitorStats() {
  const { stats, online, toggleLike } = useAnalytics();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (!online) return null;

  const onLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const liked = await toggleLike();
      playTone(liked ? 760 : 420);
      toast(liked ? 'Thanks for the appreciation!' : 'Like removed.');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const items = [
    { icon: 'fas fa-eye text-cyan-400', value: stats?.pageViews, label: 'Page views' },
    { icon: 'fas fa-users text-emerald-400', value: stats?.uniqueVisitors, label: 'Visitors' },
    { icon: 'fas fa-calendar-day text-purple-400', value: stats?.visitsToday, label: 'Visits today' },
  ];

  return (
    <div
      className="w-full max-w-md glass-panel rounded-2xl px-4 py-3 border border-white/10 flex flex-wrap items-center justify-between gap-3"
      aria-label="Live site statistics"
    >
      <div className="flex items-center gap-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-sm font-extrabold text-white font-mono flex items-center gap-1.5 justify-center">
              <i className={`${item.icon} text-[11px]`} aria-hidden="true"></i>
              {item.value === undefined ? (
                <span className="inline-block w-8 h-3 rounded bg-slate-700/70 animate-pulse" aria-label="Loading"></span>
              ) : (
                fmt(item.value)
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[10px] font-mono text-emerald-400"
          title="Visitors with this page open in the last minute"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {stats ? fmt(stats.onlineNow) : '–'} online
        </span>
        <button
          type="button"
          onClick={onLike}
          disabled={!stats || busy}
          aria-pressed={stats?.liked ?? false}
          aria-label={stats?.liked ? 'Remove your like' : 'Like this portfolio'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition disabled:opacity-60 ${
            stats?.liked
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-800/80 text-slate-300 border-white/10 hover:text-rose-300 hover:border-rose-500/40'
          }`}
        >
          <i className={stats?.liked ? 'fas fa-heart' : 'far fa-heart'} aria-hidden="true"></i>
          {stats ? fmt(stats.likes) : '–'}
        </button>
      </div>
    </div>
  );
}
