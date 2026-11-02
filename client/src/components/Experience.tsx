const COURSEWORK = [
  'Data Structures & Algorithms',
  'Robotics Engineering',
  'DBMS',
  'Machine Designing',
  'Computer-Aided Design',
];

export function Experience() {
  return (
    <section id="experience" className="py-16 relative z-10 max-w-7xl mx-auto px-6 lg:px-8 border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-14" data-reveal>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-2">
          <i className="fas fa-microscope" aria-hidden="true"></i> EXPERIENCE & FOUNDATIONS
        </div>
        <h2 className="text-3xl font-extrabold text-white">Research & Academic Background</h2>
        <p className="text-slate-400 text-sm mt-2">
          Integrating advanced robotic manufacturing research with theoretical computer science.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Research Experience: IIT (BHU) */}
        <div
          data-reveal
          className="glass-panel-elevated rounded-3xl p-7 border border-cyan-500/20 hover:border-cyan-500/50 transition relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl border border-cyan-500/20">
              <i className="fas fa-robot" aria-hidden="true"></i>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-semibold">
              05/2026 - 06/2026
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
            Centre of Excellence on Machine Tools Design (CoE-MTD)
          </h3>
          <p className="text-xs font-semibold text-cyan-400 mb-4">Summer Research Intern • IIT (BHU), Varanasi</p>
          <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <i className="fas fa-check-circle text-cyan-400 text-xs mt-0.5 shrink-0" aria-hidden="true"></i>
              <span>
                Conducted core research on <strong>Robotic CMT-based WAAM</strong> (Cold Metal Transfer Wire Arc
                Additive Manufacturing), focusing on automated trajectory control and multi-axis deposition.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <i className="fas fa-check-circle text-cyan-400 text-xs mt-0.5 shrink-0" aria-hidden="true"></i>
              <span>
                Analyzed complex manufacturing datasets and sensor workflows to improve surface layer repeatability
                and optimize process efficiency.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <i className="fas fa-check-circle text-cyan-400 text-xs mt-0.5 shrink-0" aria-hidden="true"></i>
              <span>
                Collaborated with IIT faculty to evaluate computational designs, translating physical telemetry into
                actionable algorithmic models.
              </span>
            </li>
          </ul>
        </div>

        {/* Education: BIT Patna */}
        <div
          data-reveal
          className="glass-panel-elevated rounded-3xl p-7 border border-purple-500/20 hover:border-purple-500/50 transition relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl border border-purple-500/20">
              <i className="fas fa-graduation-cap" aria-hidden="true"></i>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 font-semibold">
              01/2023 - 01/2027
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
            B.Tech in Mechanical Engineering
          </h3>
          <p className="text-xs font-semibold text-purple-400 mb-4">
            Birla Institute of Technology, Patna • <span className="text-emerald-400 font-bold">CGPA: 7.3/10</span>
          </p>
          <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
            <p>
              Four-year interdisciplinary degree uniting robotics engineering, kinematics, algorithmic modeling, and
              database systems.
            </p>
            <div className="pt-2">
              <span className="font-mono text-[11px] text-slate-400 block mb-2 font-semibold uppercase">
                Relevant Coursework:
              </span>
              <div className="flex flex-wrap gap-2">
                {COURSEWORK.map((course) => (
                  <span
                    key={course}
                    className="px-2.5 py-1 bg-slate-900 border border-white/10 text-slate-300 rounded-lg text-[11px]"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
