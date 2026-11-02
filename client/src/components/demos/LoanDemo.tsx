import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useToast } from '../../context/ToastContext';
import { playTone } from '../../lib/audio';
import { calculateLoan, formatINR } from '../../lib/loan';

interface Borrower {
  key: number;
  id: string;
  name: string;
  principal: string;
  emi: string;
  status: 'ACTIVE' | 'PAID';
  email: string;
}

interface Dispatch {
  time: string;
  borrower: Borrower;
}

const INITIAL_BORROWERS: Borrower[] = [
  { key: 1, id: 'LN-201', name: 'Rohan Sharma', principal: '₹4,50,000', emi: '₹14,732', status: 'ACTIVE', email: 'rohan.s@example.com' },
  { key: 2, id: 'LN-202', name: 'Ananya Verma', principal: '₹2,00,000', emi: '₹6,548', status: 'ACTIVE', email: 'ananya.v@example.com' },
  { key: 3, id: 'LN-203', name: 'Devendra Prasad', principal: '₹8,00,000', emi: '₹26,190', status: 'PAID', email: 'd.prasad@example.com' },
];

const RANDOM_NAMES = ['Kavita Mehta', 'Arjun Kapoor', 'Pooja Singh', 'Vikram Sen', 'Nisha Roy'];

export function LoanDemo() {
  const toast = useToast();
  const { trackOnce, track } = useAnalytics();
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(11);
  const [tenure, setTenure] = useState(36);
  const [borrowers, setBorrowers] = useState(INITIAL_BORROWERS);
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [badge, setBadge] = useState<'ready' | 'dispatching' | 'delivered'>('ready');
  const nextKey = useRef(INITIAL_BORROWERS.length + 1);
  const deliverTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(deliverTimer.current), []);

  const loan = useMemo(() => calculateLoan(principal, rate, tenure), [principal, rate, tenure]);

  const onSlider = (setter: (v: number) => void, tone: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(Number(e.target.value));
    playTone(tone, 'triangle', 0.05);
    trackOnce('demo_interaction', 'loan:sliders');
  };

  const addCalculatedLoanToCRM = () => {
    playTone(620);
    const pick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const entry: Borrower = {
      key: nextKey.current++,
      id: 'LN-' + Math.floor(200 + Math.random() * 800),
      name: pick,
      principal: formatINR(principal),
      emi: formatINR(loan.emi),
      status: 'ACTIVE',
      email: pick.toLowerCase().replace(' ', '.') + '@borrower.in',
    };
    setBorrowers((list) => [entry, ...list]);
    toast(`Added ${pick} to Loan Manager CRM.`);
    track('demo_interaction', 'loan:add-borrower');
  };

  const toggleBorrowerStatus = (key: number) => {
    playTone(480);
    setBorrowers((list) =>
      list.map((b) => (b.key === key ? { ...b, status: b.status === 'ACTIVE' ? 'PAID' : 'ACTIVE' } : b)),
    );
  };

  const triggerSimulatedEmail = (b: Borrower) => {
    playTone(720);
    setBadge('dispatching');
    setDispatch({ time: new Date().toLocaleTimeString(), borrower: b });
    window.clearTimeout(deliverTimer.current);
    deliverTimer.current = window.setTimeout(() => {
      setBadge('delivered');
      toast(`Nodemailer alert successfully delivered to ${b.email}!`);
    }, 700);
    track('demo_interaction', 'loan:send-alert');
  };

  const badgeClass =
    badge === 'dispatching'
      ? 'text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30 text-[10px] animate-pulse'
      : 'text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]';
  const badgeText =
    badge === 'dispatching' ? 'DISPATCHING...' : badge === 'delivered' ? 'DELIVERED (250 OK)' : 'STATUS: READY';

  return (
    <div
      id="demo-loan"
      data-reveal
      className="glass-panel-elevated rounded-3xl border border-cyan-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden scroll-mt-24"
    >
      {/* Project Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
              MERN Stack • Nodemailer • RESTful APIs
            </span>
            <span className="text-xs text-slate-400 font-mono">07/2026 - 09/2026</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1.5">Project 1: Loan Manager App & Nodemailer Dispatcher</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            Engineered a full-stack loan tracking and borrower management platform using React.js, Node.js,
            Express.js, and MongoDB. Includes structured MongoDB schemas, dynamic amortization computations, and
            automated Nodemailer email notifications for repayment alerts.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-cyan-950/70 border border-cyan-500/30 px-3 py-1.5 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">Interactive Live Demo</span>
        </div>
      </div>

      {/* Interactive 2-Column Split: EMI Engine vs Borrower CRM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Column 1: Reactive EMI Calculator */}
        <div className="lg:col-span-6 bg-slate-950/80 rounded-2xl p-6 border border-white/10 space-y-5">
          <div className="flex flex-wrap gap-2 items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fas fa-calculator text-cyan-400" aria-hidden="true"></i> Dynamic EMI & Interest Engine
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Formula: P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)</span>
          </div>

          {/* Principal Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label htmlFor="loan-amount-slider" className="text-slate-300">
                Loan Principal:
              </label>
              <span id="loan-amount-val" className="font-mono text-cyan-400 text-sm font-bold">
                {formatINR(principal)}
              </span>
            </div>
            <input
              type="range"
              id="loan-amount-slider"
              min={20000}
              max={3000000}
              step={10000}
              value={principal}
              onChange={onSlider(setPrincipal, 440)}
              className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>₹20,000</span>
              <span>₹15,00,000</span>
              <span>₹30,00,000</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label htmlFor="loan-rate-slider" className="text-slate-300">
                Annual Interest Rate (%):
              </label>
              <span id="loan-rate-val" className="font-mono text-purple-400 text-sm font-bold">
                {rate.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              id="loan-rate-slider"
              min={5}
              max={24}
              step={0.5}
              value={rate}
              onChange={onSlider(setRate, 500)}
              className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>5.0%</span>
              <span>14.5%</span>
              <span>24.0%</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <label htmlFor="loan-tenure-slider" className="text-slate-300">
                Repayment Period:
              </label>
              <span id="loan-tenure-val" className="font-mono text-emerald-400 text-sm font-bold">
                {tenure} Months ({(tenure / 12).toFixed(1)} Yrs)
              </span>
            </div>
            <input
              type="range"
              id="loan-tenure-slider"
              min={6}
              max={84}
              step={6}
              value={tenure}
              onChange={onSlider(setTenure, 550)}
              className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>6 Months</span>
              <span>48 Months</span>
              <span>84 Months</span>
            </div>
          </div>

          {/* Live Output Matrix */}
          <div className="grid grid-cols-3 gap-2.5 pt-1" aria-live="polite">
            <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Monthly EMI</span>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">{formatINR(loan.emi)}</div>
            </div>
            <div className="bg-purple-950/40 border border-purple-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-purple-400 uppercase">Total Interest</span>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                {formatINR(loan.totalInterest)}
              </div>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Total Payable</span>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                {formatINR(loan.totalPayment)}
              </div>
            </div>
          </div>

          {/* Visual Principal vs Interest Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
              <span>
                Principal: <strong className="text-cyan-400">{loan.principalPct}%</strong>
              </span>
              <span>
                Interest: <strong className="text-purple-400">{loan.interestPct}%</strong>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${loan.principalPct}%` }}></div>
              <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${loan.interestPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* Column 2: Borrower CRM Ledger & Nodemailer Dispatch Simulator */}
        <div className="lg:col-span-6 bg-slate-950/80 rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 items-center justify-between pb-3 border-b border-white/5 mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fas fa-users-gear text-emerald-400" aria-hidden="true"></i> Borrower CRM & Nodemailer Dispatch
              </h4>
              <button
                type="button"
                onClick={addCalculatedLoanToCRM}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 shadow"
              >
                <i className="fas fa-user-plus text-[10px]" aria-hidden="true"></i> Add Current Calculation
              </button>
            </div>

            {/* Borrower Records List */}
            <div id="borrower-records-list" className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {borrowers.map((b) => (
                <div
                  key={b.key}
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{b.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-1.5 py-0.5 rounded">{b.id}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Principal: <span className="text-slate-200">{b.principal}</span> | EMI:{' '}
                      <span className="text-purple-300 font-bold">{b.emi}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => triggerSimulatedEmail(b)}
                      title="Dispatch Nodemailer SMTP Email"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 text-cyan-300 hover:text-white transition text-[11px] font-semibold flex items-center gap-1"
                    >
                      <i className="fas fa-paper-plane text-[10px]" aria-hidden="true"></i> Send Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBorrowerStatus(b.key)}
                      title="Toggle Active / Paid"
                      aria-label={`Toggle ${b.name} between active and paid`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition text-[10px]"
                    >
                      <i className="fas fa-arrows-rotate" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Nodemailer Relay Terminal */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <i className="fas fa-network-wired text-cyan-400" aria-hidden="true"></i> Nodemailer SMTP Dispatcher Log:
              </span>
              <span className={badgeClass}>{badgeText}</span>
            </div>
            <div
              className="bg-black/70 rounded-xl p-3 text-[11px] font-mono text-slate-300 border border-white/5 h-24 overflow-y-auto space-y-1"
              aria-live="polite"
            >
              {dispatch ? (
                <>
                  <div className="text-cyan-300">[{dispatch.time}] NODEMAILER TRANSPORTER INITIALIZED via Gmail/SMTP</div>
                  <div className="text-slate-300">
                    &gt; Target: <strong className="text-white">{dispatch.borrower.email}</strong>
                  </div>
                  <div className="text-slate-300">
                    &gt; Payload: {'{'} loanId: "{dispatch.borrower.id}", recipient: "{dispatch.borrower.name}", emiDue: "
                    {dispatch.borrower.emi}" {'}'}
                  </div>
                  <div className="text-emerald-400 font-bold">&gt; 250 2.0.0 OK: Email alert delivered successfully!</div>
                </>
              ) : (
                <span className="text-slate-500">
                  // Ready. Click "Send Alert" on any borrower to test automated email dispatches.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
