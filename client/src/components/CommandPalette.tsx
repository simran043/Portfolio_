import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAnalytics } from '../context/AnalyticsContext';
import { usePortfolioActions } from '../hooks/usePortfolioActions';
import { playTone } from '../lib/audio';
import { PROFILE } from '../lib/profile';

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
}

const goTo = (id: string) => () => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
};

/** Ctrl/Cmd + K quick navigation and actions. */
export function CommandPalette({ open, onClose, onToggleTheme }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { track } = useAnalytics();
  const { copyText, requestResume } = usePortfolioActions();

  const commands = useMemo<Command[]>(
    () => [
      { id: 'hero', label: 'Overview', hint: 'Section', icon: 'fas fa-house', run: goTo('hero') },
      { id: 'experience', label: 'Experience & Education', hint: 'Section', icon: 'fas fa-microscope', run: goTo('experience') },
      { id: 'demo-loan', label: 'Demo: Loan Manager & CRM', hint: 'Live demo', icon: 'fas fa-hand-holding-dollar', run: goTo('demo-loan') },
      { id: 'demo-fire', label: 'Demo: AI Fire Extinguisher', hint: 'Live demo', icon: 'fas fa-fire-extinguisher', run: goTo('demo-fire') },
      { id: 'skills', label: 'Skills Matrix', hint: 'Section', icon: 'fas fa-cubes', run: goTo('skills') },
      { id: 'awards', label: 'Honors & Certifications', hint: 'Section', icon: 'fas fa-trophy', run: goTo('awards') },
      { id: 'contact', label: 'Contact Simran', hint: 'Section', icon: 'fas fa-paper-plane', run: goTo('contact') },
      { id: 'copy-email', label: 'Copy email address', hint: 'Action', icon: 'fas fa-copy', run: () => void copyText(PROFILE.email, 'Email copied!', 'email') },
      { id: 'resume', label: 'Open resume (CV)', hint: 'Action', icon: 'fas fa-file-arrow-down', run: requestResume },
      { id: 'theme', label: 'Toggle light / dark theme', hint: 'Action', icon: 'fas fa-circle-half-stroke', run: onToggleTheme },
      { id: 'github', label: 'Open GitHub', hint: 'Link', icon: 'fab fa-github', run: () => window.open(PROFILE.github, '_blank', 'noopener') },
      { id: 'linkedin', label: 'Open LinkedIn', hint: 'Link', icon: 'fab fa-linkedin', run: () => window.open(PROFILE.linkedin, '_blank', 'noopener') },
    ],
    [copyText, requestResume, onToggleTheme],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  if (!open) return null;

  const runCommand = (cmd: Command) => {
    playTone(600);
    onClose();
    track('command_palette', cmd.id);
    cmd.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter' && results[index]) {
      e.preventDefault();
      runCommand(results[index]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-[15vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick navigation"
        className="w-full max-w-lg glass-panel-elevated rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden text-slate-100"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <i className="fas fa-magnifying-glass text-cyan-400 text-sm" aria-hidden="true"></i>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section or run an action..."
            aria-label="Search commands"
            aria-controls="command-results"
            aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-white/10">Esc</kbd>
        </div>
        <ul id="command-results" role="listbox" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-xs text-slate-400">No matches.</li>}
          {results.map((cmd, i) => (
            <li
              key={cmd.id}
              id={`cmd-${cmd.id}`}
              role="option"
              aria-selected={i === index}
              onMouseEnter={() => setIndex(i)}
              onClick={() => runCommand(cmd)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm ${
                i === index ? 'bg-cyan-500/15 text-white' : 'text-slate-300'
              }`}
            >
              <span className="flex items-center gap-3">
                <i className={`${cmd.icon} w-4 text-center text-cyan-400`} aria-hidden="true"></i>
                {cmd.label}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{cmd.hint}</span>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-white/10 text-[10px] font-mono text-slate-500 flex gap-4">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Ctrl K toggle</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
