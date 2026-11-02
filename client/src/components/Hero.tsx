import { usePortfolioActions } from '../hooks/usePortfolioActions';
import { PROFILE } from '../lib/profile';
import { TypingText } from './TypingText';
import { VisitorStats } from './VisitorStats';

export function Hero() {
  const { requestResume, copyProfileSpec } = usePortfolioActions();

  return (
    <section id="hero" className="relative z-10 pt-32 pb-16 md:pt-40 md:pb-24 max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Bio & Badges */}
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          {/* Live Badges Row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Portfolio Design Hackathon 2026</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-xs font-mono text-amber-300">
              <i className="fas fa-trophy text-[11px]" aria-hidden="true"></i>
              <span>1st Prize • BIT Mesra Colloquium</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-mono text-purple-300">
              <i className="fas fa-robot text-[11px]" aria-hidden="true"></i>
              <span>IIT (BHU) Research Intern</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Hi, I'm{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Simran Kumari
            </span>
          </h1>

          {/* Animated Typing Banner */}
          <div className="text-base sm:text-xl font-medium text-slate-300 flex items-center justify-center lg:justify-start gap-2 h-8">
            <span className="font-mono text-cyan-400 font-bold" aria-hidden="true">
              &gt;
            </span>
            <TypingText />
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Final year B.Tech student in Mechanical Engineering at{' '}
            <strong className="text-white">Birla Institute of Technology, Patna</strong> (CGPA 7.3/10). Blending
            full-stack architecture (React, Node, Express, MongoDB) with robotic automation and AI hardware
            integrations. Passionate about algorithms, scalable engineering, and clean interactive human-machine
            interfaces.
          </p>

          {/* High-Impact Live Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0 pt-2">
            <div className="glass-panel p-3.5 rounded-2xl text-center border-t-2 border-t-cyan-500 hover:border-cyan-400 transition">
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                7.3<span className="text-cyan-400 text-sm">/10</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">B.Tech CGPA</div>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl text-center border-t-2 border-t-emerald-500 hover:border-emerald-400 transition">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">2</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Playable Demos</div>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl text-center border-t-2 border-t-purple-500 hover:border-purple-400 transition">
              <div className="text-xl sm:text-2xl font-extrabold text-purple-400 font-mono">1st</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Research Award</div>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl text-center border-t-2 border-t-amber-500 hover:border-amber-400 transition">
              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">3x</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Infosys Certified</div>
            </div>
          </div>

          {/* Hero Actions */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-3">
            <a
              href="#projects"
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-black shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <i className="fas fa-play-circle text-sm" aria-hidden="true"></i>
              <span>Explore Interactive Demos</span>
            </a>
            <button
              type="button"
              onClick={requestResume}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold glass-panel hover:bg-slate-800 text-slate-200 border border-white/10 transition flex items-center gap-2"
            >
              <i className="fas fa-file-pdf text-rose-400" aria-hidden="true"></i>
              <span>View Resume</span>
            </button>
            <a
              href="#contact"
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold glass-panel hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-2"
            >
              <i className="fas fa-paper-plane text-cyan-400" aria-hidden="true"></i>
              <span>Get in Touch</span>
            </a>
          </div>

          {/* Social Channels & Quick Info */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-slate-400 text-xs">
            <span className="font-mono text-slate-500 uppercase tracking-widest text-[11px]">Connect:</span>
            <a href={`mailto:${PROFILE.email}`} className="hover:text-cyan-400 transition flex items-center gap-1.5">
              <i className="fas fa-envelope" aria-hidden="true"></i> {PROFILE.email}
            </a>
            <span className="text-slate-700" aria-hidden="true">
              •
            </span>
            <a href={`tel:${PROFILE.phoneTel}`} className="hover:text-emerald-400 transition flex items-center gap-1.5">
              <i className="fas fa-phone" aria-hidden="true"></i> {PROFILE.phoneDisplay}
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Diagnostic HUD Card + live visitor stats */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Background Radar Watermark */}
            <div
              className="absolute -right-16 -top-16 w-48 h-48 rounded-full border border-cyan-500/10 pointer-events-none flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-32 h-32 rounded-full border border-cyan-500/15"></div>
              <div className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent to-cyan-400/40 origin-left radar-spin"></div>
            </div>

            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 text-xs font-mono text-cyan-400 font-semibold">simran_spec.json</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                ONLINE
              </span>
            </div>

            {/* Code Snippet Profile */}
            <pre className="bg-black/60 rounded-2xl p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto border border-white/5">
              <code>
                {'{\n  '}
                <span className="text-cyan-300">"candidate"</span>: <span className="text-emerald-300">"Simran Kumari"</span>
                {',\n  '}
                <span className="text-cyan-300">"university"</span>:{' '}
                <span className="text-slate-300">"Birla Institute of Tech, Patna"</span>
                {',\n  '}
                <span className="text-cyan-300">"degree"</span>:{' '}
                <span className="text-slate-300">"B.Tech Mechanical (2023-2027)"</span>
                {',\n  '}
                <span className="text-cyan-300">"cgpa"</span>: <span className="text-amber-300">7.3</span>
                {',\n  '}
                <span className="text-cyan-300">"research"</span>:{' '}
                <span className="text-slate-300">"IIT (BHU) Varanasi • CoE-MTD"</span>
                {',\n  '}
                <span className="text-cyan-300">"specialization"</span>
                {': [\n    '}
                <span className="text-purple-300">"Robotic CMT-based WAAM"</span>
                {',\n    '}
                <span className="text-purple-300">"MERN Stack & RESTful APIs"</span>
                {',\n    '}
                <span className="text-purple-300">"Data Structures & Algorithms"</span>
                {',\n    '}
                <span className="text-purple-300">"AI-Hardware Interfacing (RPi/Arduino)"</span>
                {'\n  ],\n  '}
                <span className="text-cyan-300">"status"</span>:{' '}
                <span className="text-emerald-400">"Open for SWE & Robotics Roles"</span>
                {'\n}'}
              </code>
            </pre>

            {/* Interactive Action Buttons */}
            <div className="pt-2 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <i className="fas fa-map-pin text-rose-400" aria-hidden="true"></i> Patna / Varanasi
              </span>
              <button
                type="button"
                onClick={copyProfileSpec}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition"
              >
                <i className="fas fa-copy" aria-hidden="true"></i> Copy Spec
              </button>
            </div>
          </div>

          <VisitorStats />
        </div>
      </div>
    </section>
  );
}
