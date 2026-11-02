import { useScrollProgress } from '../hooks/useScrollEffects';

/** Thin reading-progress bar at the top of the page and a back-to-top button. */
export function ScrollExtras() {
  const progress = useScrollProgress();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 pointer-events-none" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 origin-left"
          style={{ transform: `scaleX(${progress})` }}
        ></div>
      </div>

      <a
        href="#hero"
        aria-label="Back to top"
        className={`fixed bottom-6 left-6 z-40 w-11 h-11 rounded-2xl glass-panel-elevated border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 flex items-center justify-center shadow-2xl transition-all duration-300 ${
          progress > 0.08 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
        tabIndex={progress > 0.08 ? 0 : -1}
      >
        <i className="fas fa-arrow-up" aria-hidden="true"></i>
      </a>
    </>
  );
}
