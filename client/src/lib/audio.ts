import { readStorage, writeStorage } from './storage';

let audioCtx: AudioContext | null = null;
let muted = readStorage('local', 'portfolio:muted') === 'true';

export const isMuted = () => muted;

export function setMuted(value: boolean): void {
  muted = value;
  writeStorage('local', 'portfolio:muted', String(value));
}

/** Short interface blip, synthesized with the Web Audio API. */
export function playTone(freq: number, type: OscillatorType = 'sine', duration = 0.12): void {
  if (muted) return;
  try {
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      audioCtx = new Ctor();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Audio is decorative; ignore failures.
  }
}
