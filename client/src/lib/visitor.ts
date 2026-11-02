import { readStorage, writeStorage } from './storage';

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreate(kind: 'local' | 'session', key: string): string {
  const existing = readStorage(kind, key);
  if (existing && /^[A-Za-z0-9-]{8,64}$/.test(existing)) return existing;
  const id = randomId();
  writeStorage(kind, key, id);
  return id;
}

/** Anonymous id for this browser, used to count unique visitors. */
export const getVisitorId = () => getOrCreate('local', 'portfolio:visitorId');

/** Anonymous id for this tab session, used to count visits (reloads only add page views). */
export const getSessionId = () => getOrCreate('session', 'portfolio:sessionId');
