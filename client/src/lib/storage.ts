/** Storage access that never throws (private windows and blocked site data can make it fail). */
function safeStorage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage(kind: 'local' | 'session', key: string): string | null {
  try {
    return safeStorage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(kind: 'local' | 'session', key: string, value: string | null): void {
  try {
    const store = safeStorage(kind);
    if (!store) return;
    if (value === null) store.removeItem(key);
    else store.setItem(key, value);
  } catch {
    // Ignore: storage is a convenience only.
  }
}
