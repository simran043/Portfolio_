import { useState, type FormEvent } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from '../context/ToastContext';
import { usePortfolioActions } from '../hooks/usePortfolioActions';
import { api, ApiError } from '../lib/api';
import { playTone } from '../lib/audio';
import { PROFILE } from '../lib/profile';

const EMPTY_FORM = { name: '', email: '', message: '', website: '' };

export function Contact() {
  const toast = useToast();
  const { track } = useAnalytics();
  const { copyText } = usePortfolioActions();
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof typeof EMPTY_FORM) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const openMailClient = () => {
    const subject = encodeURIComponent(`Hackathon Portfolio Inquiry - ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\nSender: ${form.email}`);
    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    playTone(700);
    setSending(true);
    setError('');
    try {
      await api.sendContact(form);
      toast(`Thank you ${form.name}! Your message reached Simran.`);
      setForm(EMPTY_FORM);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 0 || apiErr.status >= 500) {
        // Server unreachable: fall back to the visitor's own mail app so the message isn't lost.
        toast('Server unavailable. Opening your mail app instead...', 'error');
        openMailClient();
      } else {
        setError(apiErr.message);
      }
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition';

  return (
    <section id="contact" className="py-16 relative z-10 max-w-7xl mx-auto px-6 lg:px-8 border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-14" data-reveal>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-2">
          <i className="fas fa-paper-plane" aria-hidden="true"></i> OPEN FOR ROLES
        </div>
        <h2 className="text-3xl font-extrabold text-white">Let's Connect & Collaborate</h2>
        <p className="text-slate-400 text-sm mt-2">
          Looking for software engineering opportunities, full-stack roles, or robotics engineering projects. Send a
          message directly below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* Contact Cards */}
        <div className="lg:col-span-5 space-y-4" data-reveal>
          <button
            type="button"
            onClick={() => copyText(PROFILE.email, 'Email copied!', 'email')}
            className="w-full text-left p-4 rounded-2xl glass-panel-elevated hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 transition flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-base group-hover:scale-110 transition">
              <i className="fas fa-envelope" aria-hidden="true"></i>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Direct Email</span>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition">
                {PROFILE.email}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => copyText(PROFILE.phoneTel, 'Phone number copied!', 'phone')}
            className="w-full text-left p-4 rounded-2xl glass-panel-elevated hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 transition flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base group-hover:scale-110 transition">
              <i className="fas fa-phone" aria-hidden="true"></i>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Phone / WhatsApp</span>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition">
                {PROFILE.phoneHyphen}
              </span>
            </div>
          </button>

          <div className="p-4 rounded-2xl glass-panel-elevated border border-white/10">
            <span className="text-[11px] font-mono text-slate-400 block mb-3 font-semibold uppercase">
              Professional Channels:
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={PROFILE.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('outbound_click', 'github')}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 border border-white/5 transition"
              >
                <i className="fab fa-github text-sm" aria-hidden="true"></i>
                <span>GitHub</span>
              </a>
              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('outbound_click', 'linkedin')}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 border border-white/5 transition"
              >
                <i className="fab fa-linkedin text-sm text-cyan-400" aria-hidden="true"></i>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form (saved by the backend, emailed when SMTP is configured) */}
        <div className="lg:col-span-7 glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10" data-reveal>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            <div>
              <label htmlFor="contact-name" className="block text-xs font-mono text-slate-300 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                id="contact-name"
                required
                maxLength={100}
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                placeholder="Sarah Jenkins"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-mono text-slate-300 mb-1">
                Your Email Address *
              </label>
              <input
                type="email"
                id="contact-email"
                required
                maxLength={200}
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                placeholder="sarah@techcorp.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-xs font-mono text-slate-300 mb-1">
                Message / Opportunity *
              </label>
              <textarea
                id="contact-message"
                rows={3}
                required
                minLength={10}
                maxLength={5000}
                value={form.message}
                onChange={update('message')}
                placeholder="Hi Simran, we loved your Loan Manager & Fire Extinguisher demos and would like to discuss..."
                className={`${inputClass} resize-none`}
              ></textarea>
            </div>

            {/* Honeypot field: hidden from people, catches spam bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                type="text"
                id="contact-website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={update('website')}
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-rose-300 flex items-center gap-2">
                <i className="fas fa-circle-exclamation" aria-hidden="true"></i> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:opacity-95 text-black shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {sending ? (
                <>
                  <i className="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane" aria-hidden="true"></i>
                  <span>Send Direct Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
