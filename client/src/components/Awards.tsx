const INFOSYS_CERTS = [
  'Angular Development Professional',
  'JavaScript Programming Core',
  'TypeScript Essentials & Static Typing',
];

export function Awards() {
  return (
    <section id="awards" className="py-16 relative z-10 max-w-7xl mx-auto px-6 lg:px-8 border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-14" data-reveal>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-2">
          <i className="fas fa-trophy" aria-hidden="true"></i> RECOGNITION
        </div>
        <h2 className="text-3xl font-extrabold text-white">Honors & Certifications</h2>
        <p className="text-slate-400 text-sm mt-2">
          Verified awards from premier institutions and corporate industry programs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Research Award */}
        <div data-reveal className="glass-panel-elevated p-7 rounded-3xl border border-amber-500/30 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl shrink-0 border border-amber-500/30">
            <i className="fas fa-award" aria-hidden="true"></i>
          </div>
          <div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
              1st Position • 03/2025
            </span>
            <h4 className="text-base font-bold text-white mt-2">Research Colloquium: Oral/Poster Presentation</h4>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">Birla Institute of Technology, Mesra</p>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              Awarded 1st Position in the Oral Presentation category at the annual Research Colloquium held at BIT
              Mesra, presenting advanced analytical engineering research to faculty delegates.
            </p>
          </div>
        </div>

        {/* Infosys Certifications */}
        <div data-reveal className="glass-panel-elevated p-7 rounded-3xl border border-cyan-500/30 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl shrink-0 border border-cyan-500/30">
            <i className="fas fa-certificate" aria-hidden="true"></i>
          </div>
          <div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 font-bold">
              Infosys Springboard Verified
            </span>
            <h4 className="text-base font-bold text-white mt-2">Web & Enterprise Engineering Credentials</h4>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">Infosys Springboard Program</p>
            <ul className="text-xs text-slate-400 mt-2.5 space-y-1.5 font-mono">
              {INFOSYS_CERTS.map((cert) => (
                <li key={cert} className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-cyan-400 text-xs" aria-hidden="true"></i>
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
