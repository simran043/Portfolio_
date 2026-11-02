import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Phase = 'enter' | 'shown' | 'leave';
interface Toast {
  id: number;
  message: string;
  phase: Phase;
  tone: 'info' | 'error';
}

type ToastFn = (message: string, tone?: Toast['tone']) => void;

const ToastContext = createContext<ToastFn>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const setPhase = (id: number, phase: Phase) =>
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, phase } : t)));

  const showToast = useCallback<ToastFn>((message, tone = 'info') => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { id, message, phase: 'enter', tone }]);
    timers.current.push(
      window.setTimeout(() => setPhase(id, 'shown'), 30),
      window.setTimeout(() => setPhase(id, 'leave'), 3500),
      window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800),
    );
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        id="toast-container"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-panel-elevated border text-xs sm:text-sm text-white shadow-2xl transition-all duration-300 transform ${
              t.tone === 'error' ? 'border-rose-500/50' : 'border-cyan-500/40'
            } ${t.phase === 'enter' ? 'translate-y-3 opacity-0' : t.phase === 'leave' ? 'opacity-0 translate-y-2' : ''}`}
          >
            <i
              className={
                t.tone === 'error'
                  ? 'fas fa-circle-exclamation text-rose-400 text-sm'
                  : 'fas fa-check-circle text-cyan-400 text-sm'
              }
              aria-hidden="true"
            ></i>{' '}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
