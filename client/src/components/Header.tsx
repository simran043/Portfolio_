import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { usePortfolioActions } from '../hooks/usePortfolioActions';
import { isMuted, playTone, setMuted } from '../lib/audio';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activeSection: string;
  onOpenPalette: () => void;
}

const NAV_LINKS = [
  { href: '#hero', id: 'hero', label: 'Overview', mobileLabel: 'Overview' },
  { href: '#experience', id: 'experience', label: 'Experience & Edu', mobileLabel: 'Experience & Edu' },
  { href: '#projects', id: 'projects', label: 'Live Demos', mobileLabel: 'Projects & Live Demos' },
  { href: '#skills', id: 'skills', label: 'Skills Matrix', mobileLabel: 'Skills Matrix' },
  { href: '#awards', id: 'awards', label: 'Honors', mobileLabel: 'Honors & Certs' },
  { href: '#contact', id: 'contact', label: 'Contact', mobileLabel: 'Contact' },
];

export function Header({ isDark, onToggleTheme, activeSection, onOpenPalette }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted);
  const toast = useToast();
  const { requestResume } = usePortfolioActions();

  const toggleAudio = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (next) {
      toast('Interface Audio Muted');
    } else {
      playTone(600);
      toast('Interface Audio Enabled');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-2xl px-5 py-3 shadow-2xl">
        {/* Brand Logo / Monogram */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-500 flex items-center justify-center text-black font-extrabold text-sm shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            SK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-wide">Simran Kumari</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                Available
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">B.Tech Mechanical • BIT Patna</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main"
          className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          {NAV_LINKS.map((link) =>
            link.id === 'projects' ? (
              <a
                key={link.id}
                href={link.href}
                aria-current={activeSection === link.id ? 'location' : undefined}
                className="hover:text-cyan-400 transition-colors text-cyan-400 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span> {link.label}
              </a>
            ) : (
              <a
                key={link.id}
                href={link.href}
                aria-current={activeSection === link.id ? 'location' : undefined}
                className={`hover:text-cyan-400 transition-colors ${
                  activeSection === link.id ? 'text-cyan-400' : ''
                }`}
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        {/* Utility Actions */}
        <div className="flex items-center gap-3">
          {/* Command palette */}
          <button
            type="button"
            onClick={onOpenPalette}
            title="Quick navigation (Ctrl + K)"
            aria-label="Open quick navigation"
            className="hidden md:inline-flex h-9 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 items-center gap-1.5 text-xs transition border border-white/5"
          >
            <i className="fas fa-magnifying-glass" aria-hidden="true"></i>
            <kbd className="font-mono text-[10px] text-slate-400">Ctrl K</kbd>
          </button>

          {/* Sound FX Mute Toggle */}
          <button
            type="button"
            id="sound-toggle-btn"
            onClick={toggleAudio}
            title="Toggle Interface Audio"
            aria-label={muted ? 'Unmute interface audio' : 'Mute interface audio'}
            aria-pressed={muted}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 flex items-center justify-center text-xs transition border border-white/5"
          >
            <i
              id="sound-icon"
              className={muted ? 'fas fa-volume-xmark text-slate-500' : 'fas fa-volume-high'}
              aria-hidden="true"
            ></i>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            id="theme-toggle"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 flex items-center justify-center text-xs transition border border-white/5"
          >
            <i
              id="theme-icon"
              className={isDark ? 'fas fa-moon' : 'fas fa-sun text-amber-500'}
              aria-hidden="true"
            ></i>
          </button>

          {/* Direct Resume Trigger */}
          <button
            type="button"
            onClick={requestResume}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 transition"
          >
            <i className="fas fa-file-arrow-down text-cyan-400" aria-hidden="true"></i>
            <span>CV</span>
          </button>

          {/* Primary CTA */}
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>Hire Simran</span>
            <i className="fas fa-arrow-right text-[10px]" aria-hidden="true"></i>
          </a>

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300"
          >
            <i className={menuOpen ? 'fas fa-xmark' : 'fas fa-bars'} aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="lg:hidden mt-2 p-5 glass-panel rounded-2xl shadow-2xl flex flex-col gap-3 text-center text-xs font-semibold uppercase tracking-wider"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={
                link.id === 'projects'
                  ? 'mobile-nav-link text-cyan-400 py-1.5'
                  : 'mobile-nav-link text-slate-200 hover:text-cyan-400 py-1.5'
              }
            >
              {link.mobileLabel}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onOpenPalette();
            }}
            className="text-slate-400 hover:text-cyan-400 py-1.5 uppercase"
          >
            <i className="fas fa-magnifying-glass mr-1.5" aria-hidden="true"></i> Quick Navigation
          </button>
        </nav>
      )}
    </header>
  );
}
