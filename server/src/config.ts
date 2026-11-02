import 'dotenv/config';

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const smtpHost = process.env.SMTP_HOST?.trim() ?? '';

export const config = {
  port: toInt(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/portfolio',
  adminToken: process.env.ADMIN_TOKEN?.trim() ?? '',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  trustProxy: process.env.TRUST_PROXY === 'true',
  timezone: process.env.ANALYTICS_TIMEZONE?.trim() || 'Asia/Kolkata',
  smtp: {
    enabled: smtpHost.length > 0,
    host: smtpHost,
    port: toInt(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.CONTACT_FROM ?? '',
    to: process.env.CONTACT_TO ?? '',
  },
} as const;

/** Seconds since last heartbeat for a visitor to still count as "online now". */
export const ONLINE_WINDOW_MS = 60_000;
