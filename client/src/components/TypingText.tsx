import { useEffect, useState } from 'react';

const PHRASES = [
  'Full-Stack Web Architect (MERN)',
  'Robotic WAAM Automation Researcher',
  'Data Structures & Algorithms Specialist',
  'Embedded AI & Hardware Builder',
];

/** Types and deletes each headline phrase in turn. */
export function TypingText() {
  const [text, setText] = useState('');

  useEffect(() => {
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const phrase = PHRASES[phraseIdx];
      charIdx += deleting ? -1 : 1;
      setText(phrase.substring(0, charIdx));

      let delay = deleting ? 25 : 65;
      if (!deleting && charIdx === phrase.length) {
        delay = 2200;
        deleting = true;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        delay = 350;
      }
      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, 65);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <span className="sr-only">{PHRASES.join(', ')}</span>
      <span
        id="typing-text"
        aria-hidden="true"
        className="text-white font-semibold font-mono border-r-2 border-cyan-400 pr-1"
      >
        {text}
      </span>
    </>
  );
}
