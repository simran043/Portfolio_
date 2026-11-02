import { FireDemo } from './demos/FireDemo';
import { LoanDemo } from './demos/LoanDemo';

export function Projects() {
  return (
    <section id="projects" className="py-16 relative z-10 max-w-7xl mx-auto px-6 lg:px-8 border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16" data-reveal>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-2">
          <i className="fas fa-terminal" aria-hidden="true"></i> PLAYABLE LIVE WORKSPACES
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Interactive Project Demos</h2>
        <p className="text-slate-400 text-sm mt-2">
          Test each project directly below without leaving the page. Built with responsive controls, real-time
          calculations, and simulated IoT circuits.
        </p>

        {/* Fast Anchor Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <a
            href="#demo-loan"
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-2"
          >
            <i className="fas fa-hand-holding-dollar" aria-hidden="true"></i> Demo 1: Loan Manager & CRM
          </a>
          <a
            href="#demo-fire"
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-2"
          >
            <i className="fas fa-fire-extinguisher" aria-hidden="true"></i> Demo 2: AI Fire Extinguisher Sim
          </a>
        </div>
      </div>

      <div className="space-y-20">
        <LoanDemo />
        <FireDemo />
      </div>
    </section>
  );
}
