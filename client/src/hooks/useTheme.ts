import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

const KEY = 'portfolio:theme';

/** Dark by default (as in the original design); the choice is remembered per browser. */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => readStorage('local', KEY) !== 'light');

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.toggle('light', !isDark);
    body.classList.toggle('bg-surface-base', isDark);
    body.classList.toggle('text-slate-100', isDark);
    body.classList.toggle('bg-slate-100', !isDark);
    body.classList.toggle('text-slate-900', !isDark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#080c14' : '#f1f5f9');
    writeStorage('local', KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((d) => !d), []);
  return { isDark, toggle };
}
