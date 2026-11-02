import { useState } from 'react';
import { playTone } from '../lib/audio';

type SkillCategory = 'lang' | 'web' | 'core' | 'robotics';

interface SkillCard {
  cat: SkillCategory;
  title: string;
  icon: string;
  badge: string;
  // Full class strings so Tailwind can see them at build time.
  cardHover: string;
  iconBox: string;
  badgeClass: string;
  accentText: string;
  barColor: string;
  skills: { name: string; note: string; width: string }[];
}

const CARDS: SkillCard[] = [
  {
    cat: 'lang',
    title: 'Languages',
    icon: 'fas fa-code',
    badge: 'Core Code',
    cardHover: 'hover:border-cyan-500/40',
    iconBox: 'bg-cyan-500/10 text-cyan-400',
    badgeClass: 'text-cyan-400 bg-cyan-950/60',
    accentText: 'text-cyan-400',
    barColor: 'bg-cyan-400',
    skills: [
      { name: 'C++ / C', note: 'Advanced (DSA)', width: 'w-[90%]' },
      { name: 'Python', note: 'Data & ML Integration', width: 'w-[85%]' },
      { name: 'Java & SQL', note: 'OOP & Queries', width: 'w-[80%]' },
    ],
  },
  {
    cat: 'web',
    title: 'Web Stack',
    icon: 'fab fa-react',
    badge: 'Frontend & APIs',
    cardHover: 'hover:border-purple-500/40',
    iconBox: 'bg-purple-500/10 text-purple-400',
    badgeClass: 'text-purple-400 bg-purple-950/60',
    accentText: 'text-purple-400',
    barColor: 'bg-purple-400',
    skills: [
      { name: 'React.js & Node.js', note: 'Full-Stack MERN', width: 'w-[88%]' },
      { name: 'Angular & TypeScript', note: 'Infosys Certified', width: 'w-[85%]' },
      { name: 'HTML5, CSS3, JS', note: '98% Viewport Score', width: 'w-[95%]' },
    ],
  },
  {
    cat: 'core',
    title: 'Core CS Concepts',
    icon: 'fas fa-brain',
    badge: 'Fundamentals',
    cardHover: 'hover:border-emerald-500/40',
    iconBox: 'bg-emerald-500/10 text-emerald-400',
    badgeClass: 'text-emerald-400 bg-emerald-950/60',
    accentText: 'text-emerald-400',
    barColor: 'bg-emerald-400',
    skills: [
      { name: 'Data Structures & Algo', note: 'Problem Solving', width: 'w-[88%]' },
      { name: 'OOP & DBMS', note: 'Relational & Document', width: 'w-[86%]' },
      { name: 'OS & Networks', note: 'Protocols & Threads', width: 'w-[82%]' },
    ],
  },
  {
    cat: 'robotics',
    title: 'Robotics & Hardware',
    icon: 'fas fa-gear',
    badge: 'Cyber-Physical',
    cardHover: 'hover:border-amber-500/40',
    iconBox: 'bg-amber-500/10 text-amber-400',
    badgeClass: 'text-amber-400 bg-amber-950/60',
    accentText: 'text-amber-400',
    barColor: 'bg-amber-400',
    skills: [
      { name: 'Robotic WAAM Automation', note: 'IIT (BHU) Research', width: 'w-[90%]' },
      { name: 'Arduino & Raspberry Pi', note: 'Sensor & GPIO Control', width: 'w-[88%]' },
      { name: 'AI Voice Recognition', note: 'Edge Classification', width: 'w-[84%]' },
    ],
  },
];

const FILTERS: { id: 'all' | SkillCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'lang', label: 'Languages' },
  { id: 'web', label: 'Web Technology' },
  { id: 'core', label: 'Core CS' },
  { id: 'robotics', label: 'Robotics & AI' },
];

export function Skills() {
  const [filter, setFilter] = useState<'all' | SkillCategory>('all');

  const choose = (id: 'all' | SkillCategory) => {
    playTone(510);
    setFilter(id);
  };

  return (
    <section id="skills" className="py-16 relative z-10 max-w-7xl mx-auto px-6 lg:px-8 border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-14" data-reveal>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-2">
          <i className="fas fa-cubes" aria-hidden="true"></i> CORE COMPETENCIES
        </div>
        <h2 className="text-3xl font-extrabold text-white">Technical Skills & Tooling</h2>
        <p className="text-slate-400 text-sm mt-2">
          Filter and inspect engineering proficiency across languages, web tech, systems, and hardware.
        </p>

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6" role="group" aria-label="Skill category">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => choose(f.id)}
              aria-pressed={filter === f.id}
              className={
                filter === f.id
                  ? 'skill-btn active px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-black transition'
                  : 'skill-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white transition'
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {CARDS.filter((card) => filter === 'all' || card.cat === filter).map((card) => (
          <div
            key={card.cat}
            className={`skill-card p-6 rounded-2xl glass-panel-elevated border border-white/10 ${card.cardHover} transition`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${card.iconBox} flex items-center justify-center text-lg`}>
                  <i className={card.icon} aria-hidden="true"></i>
                </div>
                <h4 className="font-bold text-white text-sm">{card.title}</h4>
              </div>
              <span className={`text-[10px] font-mono ${card.badgeClass} px-2 py-0.5 rounded`}>{card.badge}</span>
            </div>
            <div className="space-y-3">
              {card.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>{skill.name}</span>
                    <span className={card.accentText}>{skill.note}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`${card.barColor} h-full ${skill.width}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
