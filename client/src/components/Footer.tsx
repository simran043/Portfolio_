import { useAnalytics } from '../context/AnalyticsContext';
import { PROFILE } from '../lib/profile';

export function Footer() {
  const { stats, online, track } = useAnalytics();

  return (
    <footer className="py-8 border-t border-white/10 text-center text-xs text-slate-500 relative z-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:items-start gap-1">
          <p>© 2026 Simran Kumari • Portfolio Design Hackathon 2026</p>
          {online && stats && (
            <p className="font-mono text-[11px] text-slate-400">
              <i className="fas fa-chart-line text-cyan-400 mr-1.5" aria-hidden="true"></i>
              {stats.pageViews.toLocaleString('en-IN')} views • {stats.uniqueVisitors.toLocaleString('en-IN')} unique
              visitors
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <a href="#hero" className="hover:text-cyan-400 transition">
            Back to Top ↑
          </a>
          <span aria-hidden="true">•</span>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('outbound_click', 'github')}
            className="hover:text-cyan-400 transition"
          >
            GitHub
          </a>
          <span aria-hidden="true">•</span>
          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('outbound_click', 'linkedin')}
            className="hover:text-cyan-400 transition"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
