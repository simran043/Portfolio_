import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useToast } from '../../context/ToastContext';
import { playTone } from '../../lib/audio';

interface SerialLine {
  id: number;
  time?: string;
  text: string;
  className?: string;
}

const BOOT_LINES: SerialLine[] = [
  { id: 1, text: '[BOOT] Arduino Nano telemetry loop running (Polling period: 100ms)' },
  { id: 2, text: '[MODEL] Raspberry Pi PyTorch Lite speech keyword model loaded.' },
  { id: 3, text: '[STATUS] Sensor baselines: Temp=28C, Smoke=85PPM. All clear.' },
];

const isHazard = (temp: number, smoke: number, flame: boolean) =>
  (temp >= 65 && smoke >= 350) || flame || temp > 80;

export function FireDemo() {
  const toast = useToast();
  const { track, trackOnce } = useAnalytics();
  const [temp, setTemp] = useState(28);
  const [smoke, setSmoke] = useState(85);
  const [flame, setFlame] = useState(false);
  const [alarm, setAlarm] = useState(false);
  const [lines, setLines] = useState<SerialLine[]>(BOOT_LINES);
  const alarmRef = useRef(false);
  const nextLineId = useRef(BOOT_LINES.length + 1);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const appendSerial = (...entries: { text: string; className: string }[]) => {
    const time = new Date().toLocaleTimeString();
    setLines((prev) => [...prev, ...entries.map((e) => ({ ...e, time, id: nextLineId.current++ }))]);
  };

  const triggerFireAlarm = (reason: string, extra: { text: string; className: string }[] = []) => {
    alarmRef.current = true;
    setAlarm(true);
    playTone(900, 'sawtooth', 0.3);
    appendSerial(
      ...extra,
      { text: `[ALERT] ${reason}`, className: 'text-rose-400 font-bold' },
      {
        text: '[ACTUATOR] Arduino digital pin 7 signaled -> Servo oriented at 45 deg angle.',
        className: 'text-cyan-300',
      },
    );
    toast('Emergency: Fire Extinguisher Actuator Dispatched!');
  };

  const clearFireAlarm = () => {
    alarmRef.current = false;
    setAlarm(false);
    appendSerial({ text: '[CLEAR] Environment returned to safe baseline. Valve closed.', className: 'text-emerald-400' });
  };

  const evaluate = (t: number, s: number, f: boolean) => {
    const hazard = isHazard(t, s, f);
    if (hazard && !alarmRef.current) triggerFireAlarm('Thermal Threshold & Smoke Density Breached');
    else if (!hazard && alarmRef.current) clearFireAlarm();
  };

  const onTemp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setTemp(value);
    evaluate(value, smoke, flame);
    playTone(300 + value * 4, 'sine', 0.04);
    trackOnce('demo_interaction', 'fire:sensors');
  };

  const onSmoke = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setSmoke(value);
    evaluate(temp, value, flame);
    playTone(250 + value * 2, 'sine', 0.04);
    trackOnce('demo_interaction', 'fire:sensors');
  };

  const toggleOpticalFlameSensor = () => {
    const next = !flame;
    setFlame(next);
    playTone(next ? 750 : 380);
    if (next) triggerFireAlarm('Infrared Optical Sensor: 760-1100nm Flame Spectrum Verified');
    else evaluate(temp, smoke, false);
    track('demo_interaction', 'fire:flame-sensor');
  };

  const triggerVoiceKeyword = () => {
    playTone(850, 'sawtooth', 0.2);
    triggerFireAlarm('Speech Recognition Emergency Command Verified', [
      {
        text: '[VOICE RECOGNITION] Keyword triggered: "FIRE ALERT!" Confidence: 97.2%',
        className: 'text-purple-300 font-bold',
      },
    ]);
    track('demo_interaction', 'fire:voice');
  };

  const resetFireSimulator = () => {
    playTone(420);
    setTemp(28);
    setSmoke(85);
    setFlame(false);
    clearFireAlarm();
    toast('Hardware Simulator Reset.');
  };

  return (
    <div
      id="demo-fire"
      data-reveal
      className="glass-panel-elevated rounded-3xl border border-rose-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden scroll-mt-24"
    >
      {/* Project Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
              Arduino • Raspberry Pi • PyTorch AI Voice • Sensors
            </span>
            <span className="text-xs text-slate-400 font-mono">01/2026 - 04/2026</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1.5">Project 2: AI-Based Automated Fire Extinguisher System</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            Engineered an automated emergency suppression system using Arduino Nano and Raspberry Pi. Features
            real-time multi-sensor telemetry (temperature, smoke PPM, optical IR flame), AI keyword voice recognition
            ("Fire Alert"), and automated servo nozzle directional deployment.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-rose-950/70 border border-rose-500/30 px-3 py-1.5 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
          <span className="text-xs font-mono text-rose-300 uppercase tracking-wider font-bold">Live Hardware Simulator</span>
        </div>
      </div>

      {/* Interactive Hardware Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Column 1: Multi-Sensor Inputs & Voice Trigger */}
        <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl p-6 border border-white/10 space-y-5">
          <div className="flex flex-wrap gap-2 items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fas fa-sliders text-rose-400" aria-hidden="true"></i> Environmental Sensor Inputs
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Arduino ADC Bus (10-bit)</span>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <label htmlFor="fire-temp-slider" className="text-slate-300">
                Room Temperature (°C):
              </label>
              <span className="font-mono text-amber-400 font-bold">
                {temp}°C {temp > 65 ? '(CRITICAL)' : '(Normal)'}
              </span>
            </div>
            <input
              type="range"
              id="fire-temp-slider"
              min={20}
              max={120}
              value={temp}
              onChange={onTemp}
              className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>20°C</span>
              <span className="text-rose-400">Trigger Threshold: &gt;65°C</span>
              <span>120°C</span>
            </div>
          </div>

          {/* Smoke Level Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <label htmlFor="fire-smoke-slider" className="text-slate-300">
                Smoke Density (PPM):
              </label>
              <span className="font-mono text-slate-300 font-bold">
                {smoke} PPM {smoke > 400 ? '(HAZARD)' : ''}
              </span>
            </div>
            <input
              type="range"
              id="fire-smoke-slider"
              min={20}
              max={900}
              value={smoke}
              onChange={onSmoke}
              className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>20 PPM</span>
              <span className="text-rose-400">Trigger Threshold: &gt;400 PPM</span>
              <span>900 PPM</span>
            </div>
          </div>

          {/* Optical IR Flame Sensor Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-white block">Infrared Optical Flame Sensor</span>
              <span className="text-[10px] text-slate-400">Photodiode (760nm–1100nm spectrum)</span>
            </div>
            <button
              type="button"
              onClick={toggleOpticalFlameSensor}
              aria-pressed={flame}
              className={
                flame
                  ? 'px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-600 text-white animate-pulse'
                  : 'px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-white/10 hover:border-rose-400 transition'
              }
            >
              {flame ? 'FLAME ACTIVE!' : 'INACTIVE'}
            </button>
          </div>

          {/* Action Buttons: AI Voice & Reset */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={triggerVoiceKeyword}
              className="p-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <i className="fas fa-microphone text-sm" aria-hidden="true"></i> Voice: "FIRE ALERT!"
            </button>
            <button
              type="button"
              onClick={resetFireSimulator}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <i className="fas fa-rotate-left" aria-hidden="true"></i> Reset System
            </button>
          </div>
        </div>

        {/* Column 2: System Status, Targeting & Telemetry */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            {/* Big Status Alert Bar */}
            <div
              aria-live="assertive"
              className={
                alarm
                  ? 'p-4 rounded-2xl bg-rose-950/70 border border-rose-500/70 flex flex-wrap gap-3 items-center justify-between mb-5 transition-all duration-300 shadow-lg shadow-rose-950/50'
                  : 'p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap gap-3 items-center justify-between mb-5 transition-all duration-300'
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    alarm
                      ? 'w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg animate-bounce'
                      : 'w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg'
                  }
                >
                  <i className={alarm ? 'fas fa-fire' : 'fas fa-shield-halved'} aria-hidden="true"></i>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block tracking-wider font-semibold">
                    CIRCUIT INTEGRITY
                  </span>
                  <h5
                    className={
                      alarm
                        ? 'text-sm sm:text-base font-bold text-rose-300 animate-pulse'
                        : 'text-sm sm:text-base font-bold text-white'
                    }
                  >
                    {alarm ? 'EMERGENCY: FIRE DETECTED - ACTUATOR ENGAGED!' : 'SYSTEM NORMAL • MONITORING'}
                  </h5>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={
                    alarm
                      ? 'text-xs font-mono px-2.5 py-1 rounded bg-rose-600 text-white font-bold animate-pulse'
                      : 'text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-white/10'
                  }
                >
                  {alarm ? 'GPIO PIN 18: HIGH [RELAY ON]' : 'GPIO PIN 18: LOW'}
                </span>
                <div
                  className={
                    alarm ? 'text-[10px] font-mono text-rose-300 font-bold mt-1' : 'text-[10px] font-mono text-slate-400 mt-1'
                  }
                >
                  AI Confidence: {alarm ? '98.4%' : '0%'}
                </div>
              </div>
            </div>

            {/* 2D Servo Aiming Display */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                  SERVO TARGETING NOZZLE
                </span>
                <div className="w-20 h-20 mx-auto relative flex items-center justify-center" aria-hidden="true">
                  <div
                    className="w-1.5 h-14 bg-cyan-400 origin-bottom transition-transform duration-700 transform rounded-full shadow-lg shadow-cyan-500/50"
                    style={{ transform: `rotate(${alarm ? 45 : 0}deg)` }}
                  ></div>
                  <div className="absolute bottom-0 w-5 h-5 rounded-full bg-slate-800 border-2 border-cyan-400"></div>
                </div>
                <span
                  className={
                    alarm
                      ? 'text-xs font-mono text-rose-400 font-bold block mt-2'
                      : 'text-xs font-mono text-cyan-300 font-bold block mt-2'
                  }
                >
                  {alarm ? '45° (Target Locked & Aimed)' : '0° (Centered Standby)'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-center flex flex-col justify-between">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">SOLENOID VALVE</span>
                <div className="my-auto">
                  <div
                    className={
                      alarm
                        ? 'inline-block px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-600 text-white animate-pulse'
                        : 'inline-block px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-white/10'
                    }
                  >
                    {alarm ? 'VALVE OPEN [120 kPa DISCHARGE]' : 'VALVE CLOSED [0 kPa]'}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {alarm ? 'CO2 / Chemical Agent Actively Deployed!' : 'Pressurized Agent: Standby'}
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry & Hardware Log Console */}
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Raspberry Pi & Arduino Serial Log (/dev/ttyACM0):
            </span>
            <div
              ref={terminalRef}
              className="bg-black/70 rounded-xl p-3 text-[11px] font-mono text-emerald-400 border border-white/5 h-24 overflow-y-auto space-y-1"
            >
              {lines.map((line) => (
                <div key={line.id}>
                  {line.time ? `[${line.time}] ` : ''}
                  <span className={line.className}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
