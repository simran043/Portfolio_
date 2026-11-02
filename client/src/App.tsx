import { useCallback, useEffect, useRef, useState } from 'react';
import { Awards } from './components/Awards';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { CommandPalette } from './components/CommandPalette';
import { Contact } from './components/Contact';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { ScrollExtras } from './components/ScrollExtras';
import { Skills } from './components/Skills';
import { useAnalytics } from './context/AnalyticsContext';
import { useToast } from './context/ToastContext';
import { useActiveSection, useRevealOnScroll } from './hooks/useScrollEffects';
import { useTheme } from './hooks/useTheme';
import { playTone } from './lib/audio';
import { SECTIONS } from './lib/profile';

const SECTION_IDS = SECTIONS.map((s) => s.id);

export default function App() {
  const { isDark, toggle } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toast = useToast();
  const { trackOnce, track } = useAnalytics();
  const activeSection = useActiveSection(SECTION_IDS);
  const firstRender = useRef(true);
  useRevealOnScroll();

  useEffect(() => {
    if (activeSection) trackOnce('section_view', activeSection);
  }, [activeSection, trackOnce]);

  const toggleTheme = useCallback(() => {
    playTone(550);
    toggle();
  }, [toggle]);

  // Announce theme changes made by the user (not the initial render).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    toast(isDark ? 'Switched to Sleek Dark Mode' : 'Switched to Crisp Light Mode');
    track('theme_toggle', isDark ? 'dark' : 'light');
  }, [isDark, toast, track]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closePalette = useCallback(() => setPaletteOpen(false), []);

  return (
    <>
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-cyan-500 focus:text-black focus:font-bold"
      >
        Skip to content
      </a>

      <BackgroundCanvas />

      {/* Ambient Light Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0 glow-animate"></div>
      <div
        className="fixed top-[40%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none z-0 glow-animate"
        style={{ animationDelay: '2s' }}
      ></div>

      <ScrollExtras />
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        activeSection={activeSection}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <main>
        <Hero />
        <Experience />
        <Projects />
        <Skills />
        <Awards />
        <Contact />
      </main>

      <Footer />
      <CommandPalette open={paletteOpen} onClose={closePalette} onToggleTheme={toggleTheme} />
    </>
  );
}
