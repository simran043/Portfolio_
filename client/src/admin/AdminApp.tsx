import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useToast } from '../context/ToastContext';
import { api, ApiError, type AdminMessage, type AdminOverview, type Breakdown } from '../lib/api';
import { readStorage, writeStorage } from '../lib/storage';
import { VisitsChart } from './VisitsChart';

const TOKEN_KEY = 'portfolio:adminToken';
const RANGES = [7, 14, 30, 90];

const EVENT_LABELS: Record<string, string> = {
  section_view: 'Section viewed',
  demo_interaction: 'Demo used',
  resume_request: 'Resume requested',
  contact_copy: 'Contact copied',
  command_palette: 'Quick nav',
  outbound_click: 'Link opened',
  theme_toggle: 'Theme switched',
};

export default function AdminApp() {
  const [token, setToken] = useState(() => readStorage('session', TOKEN_KEY) ?? '');

  useEffect(() => {
    document.title = 'Admin • Simran Kumari Portfolio';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const signOut = useCallback(() => {
    writeStorage('session', TOKEN_KEY, null);
    setToken('');
  }, []);

  return (
    <div className="min-h-screen bg-surface-base text-slate-100 px-4 sm:px-8 py-8">
      {token ? (
        <Dashboard token={token} onSignOut={signOut} />
      ) : (
        <Login
          onSignIn={(t) => {
            writeStorage('session', TOKEN_KEY, t);
            setToken(t);
          }}
        />
      )}
    </div>
  );
}

function Login({ onSignIn }: { onSignIn: (token: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.admin.overview(value.trim(), 1);
      onSignIn(value.trim());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-sm mx-auto mt-[15vh] glass-panel-elevated rounded-3xl p-7 border border-cyan-500/30 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-500 flex items-center justify-center text-black font-extrabold text-sm">
          SK
        </div>
        <div>
          <h1 className="font-extrabold text-white">Portfolio Admin</h1>
          <p className="text-[11px] font-mono text-slate-400">Visitor analytics & messages</p>
        </div>
      </div>
      <div>
        <label htmlFor="admin-token" className="block text-xs font-mono text-slate-300 mb-1">
          Admin token
        </label>
        <input
          id="admin-token"
          type="password"
          required
          autoComplete="current-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
        />
        <p className="text-[11px] text-slate-500 mt-1.5">The ADMIN_TOKEN value from server/.env</p>
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 text-black disabled:opacity-60"
      >
        {busy ? 'Checking...' : 'Sign in'}
      </button>
      <a href="/" className="block text-center text-xs text-slate-400 hover:text-cyan-300">
        ← Back to portfolio
      </a>
    </form>
  );
}

function Dashboard({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const toast = useToast();
  const [days, setDays] = useState(14);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [o, m] = await Promise.all([api.admin.overview(token, days), api.admin.messages(token)]);
      setOverview(o);
      setMessages(m);
    } catch (err) {
      if ((err as ApiError).status === 401) {
        onSignOut();
        return;
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, days, onSignOut]);

  useEffect(() => {
    void load();
  }, [load]);

  const setRead = async (msg: AdminMessage, read: boolean) => {
    try {
      await api.admin.setRead(token, msg.id, read);
      setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, read } : m)));
      setOverview((o) =>
        o ? { ...o, totals: { ...o.totals, unreadMessages: o.totals.unreadMessages + (read ? -1 : 1) } } : o,
      );
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const remove = async (msg: AdminMessage) => {
    if (!window.confirm(`Delete the message from ${msg.name}? This cannot be undone.`)) return;
    try {
      await api.admin.deleteMessage(token, msg.id);
      setMessages((list) => list.filter((m) => m.id !== msg.id));
      if (!msg.read) {
        setOverview((o) => (o ? { ...o, totals: { ...o.totals, unreadMessages: o.totals.unreadMessages - 1 } } : o));
      }
      toast('Message deleted.');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const t = overview?.totals;
  const tiles = t
    ? [
        { label: 'Page views', value: t.pageViews, icon: 'fas fa-eye text-cyan-400' },
        { label: 'Visits (sessions)', value: t.visits, icon: 'fas fa-door-open text-emerald-400' },
        { label: 'Unique visitors', value: t.uniqueVisitors, icon: 'fas fa-users text-purple-400' },
        { label: 'Visits today', value: t.visitsToday, icon: 'fas fa-calendar-day text-amber-400' },
        { label: 'Online now', value: t.onlineNow, icon: 'fas fa-signal text-emerald-400' },
        { label: 'Likes', value: t.likes, icon: 'fas fa-heart text-rose-400' },
        { label: 'Unread messages', value: t.unreadMessages, icon: 'fas fa-envelope text-cyan-400' },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Portfolio Analytics</h1>
          <p className="text-xs font-mono text-slate-400">
            {overview ? `Last ${overview.days} days • times in ${overview.timezone}` : 'Loading...'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-white/10" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDays(r)}
                aria-pressed={days === r}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  days === r ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold flex items-center gap-1.5"
          >
            <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} aria-hidden="true"></i> Refresh
          </button>
          <a href="/" className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold">
            View site
          </a>
          <button
            type="button"
            onClick={onSignOut}
            className="px-3 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-200 hover:bg-rose-600/30 font-semibold"
          >
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-sm text-rose-200">
          {error}
        </p>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="glass-panel-elevated rounded-2xl p-4 border border-white/10">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <i className={tile.icon} aria-hidden="true"></i> {tile.label}
            </div>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">{tile.value.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      {overview && (
        <>
          <section className="glass-panel-elevated rounded-3xl p-6 border border-white/10">
            <h2 className="text-sm font-bold text-white mb-4">Visits per day</h2>
            <VisitsChart daily={overview.daily} />
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BreakdownCard title="Traffic sources" icon="fas fa-link" rows={overview.referrers} />
            <BreakdownCard title="Devices" icon="fas fa-mobile-screen" rows={overview.devices} />
            <BreakdownCard title="Browsers" icon="fas fa-globe" rows={overview.browsers} />
          </div>

          <section className="glass-panel-elevated rounded-3xl p-6 border border-white/10">
            <h2 className="text-sm font-bold text-white mb-3">Top interactions</h2>
            {overview.events.length === 0 ? (
              <p className="text-xs text-slate-400">No interactions recorded in this range yet.</p>
            ) : (
              <table className="w-full text-xs font-mono">
                <thead className="text-slate-400 text-left">
                  <tr>
                    <th className="py-1.5 font-semibold">Type</th>
                    <th className="py-1.5 font-semibold">Detail</th>
                    <th className="py-1.5 font-semibold text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {overview.events.map((e) => (
                    <tr key={`${e.type}-${e.label}`} className="border-t border-white/5">
                      <td className="py-1.5">{EVENT_LABELS[e.type] ?? e.type}</td>
                      <td className="py-1.5 text-slate-400">{e.label || '—'}</td>
                      <td className="py-1.5 text-right">{e.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      <section className="glass-panel-elevated rounded-3xl p-6 border border-white/10">
        <h2 className="text-sm font-bold text-white mb-3">Messages ({messages.length})</h2>
        {messages.length === 0 ? (
          <p className="text-xs text-slate-400">No messages yet. Contact-form submissions will appear here.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`p-4 rounded-2xl border ${
                  m.read ? 'bg-slate-950/60 border-white/5' : 'bg-cyan-950/30 border-cyan-500/30'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {!m.read && <span className="w-2 h-2 rounded-full bg-cyan-400" aria-label="Unread"></span>}
                      <span className="font-bold text-white text-sm">{m.name}</span>
                      <a href={`mailto:${m.email}`} className="text-xs text-cyan-300 hover:underline">
                        {m.email}
                      </a>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {new Date(m.createdAt).toLocaleString('en-IN')} • {m.emailed ? 'emailed' : 'saved only'}
                    </div>
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => void setRead(m, !m.read)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold"
                    >
                      Mark {m.read ? 'unread' : 'read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(m)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-200 hover:bg-rose-600/30 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap break-words">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BreakdownCard({ title, icon, rows }: { title: string; icon: string; rows: Breakdown[] }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return (
    <section className="glass-panel-elevated rounded-3xl p-5 border border-white/10">
      <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <i className={`${icon} text-cyan-400`} aria-hidden="true"></i> {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-400">No data in this range.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => {
            const pct = total ? Math.round((r.count / total) * 100) : 0;
            return (
              <li key={r.name}>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span className="truncate capitalize">{r.name}</span>
                  <span className="text-slate-400">
                    {r.count} · {pct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
