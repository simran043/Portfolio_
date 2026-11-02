import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api, type EventType, type PublicStats } from '../lib/api';
import { getSessionId, getVisitorId } from '../lib/visitor';

interface AnalyticsValue {
  stats: PublicStats | null;
  /** False when the backend could not be reached; counters are hidden then. */
  online: boolean;
  track: (type: EventType, label?: string) => void;
  /** Sends an event only once per page load for the same type + label. */
  trackOnce: (type: EventType, label?: string) => void;
  toggleLike: () => Promise<boolean>;
}

const AnalyticsContext = createContext<AnalyticsValue | null>(null);

const HEARTBEAT_MS = 30_000;
const STATS_REFRESH_MS = 60_000;

// React StrictMode runs effects twice in development; this keeps one page view per load.
let visitRecorded = false;

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [online, setOnline] = useState(true);
  const visitorId = useMemo(getVisitorId, []);
  const sent = useRef(new Set<string>());

  useEffect(() => {
    if (visitRecorded) {
      api.stats(visitorId).then(setStats, () => setOnline(false));
      return;
    }
    visitRecorded = true;
    api
      .recordVisit({
        visitorId,
        sessionId: getSessionId(),
        path: window.location.pathname,
        referrer: document.referrer,
      })
      .then(setStats, () => setOnline(false));
  }, [visitorId]);

  useEffect(() => {
    const beat = () => {
      if (document.visibilityState !== 'visible') return;
      api.heartbeat(visitorId).then(
        ({ onlineNow }) => setStats((s) => (s ? { ...s, onlineNow } : s)),
        () => undefined,
      );
    };
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      api.stats(visitorId).then(
        (s) => {
          setStats(s);
          setOnline(true);
        },
        () => undefined,
      );
    };
    const heartbeatTimer = window.setInterval(beat, HEARTBEAT_MS);
    const refreshTimer = window.setInterval(refresh, STATS_REFRESH_MS);
    document.addEventListener('visibilitychange', beat);
    return () => {
      window.clearInterval(heartbeatTimer);
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', beat);
    };
  }, [visitorId]);

  const track = useCallback(
    (type: EventType, label = '') => api.trackEvent({ visitorId, type, label }),
    [visitorId],
  );

  const trackOnce = useCallback(
    (type: EventType, label = '') => {
      const key = `${type}:${label}`;
      if (sent.current.has(key)) return;
      sent.current.add(key);
      track(type, label);
    },
    [track],
  );

  const toggleLike = useCallback(async () => {
    const result = await api.toggleLike(visitorId);
    setStats((s) => (s ? { ...s, liked: result.liked, likes: result.likes } : s));
    return result.liked;
  }, [visitorId]);

  const value = useMemo(
    () => ({ stats, online, track, trackOnce, toggleLike }),
    [stats, online, track, trackOnce, toggleLike],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used inside <AnalyticsProvider>');
  return ctx;
}
