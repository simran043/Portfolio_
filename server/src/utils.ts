import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface ClientInfo {
  isBot: boolean;
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
}

const BOT_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget/i;

/** Coarse device and browser from the User-Agent header. Nothing identifying is kept. */
export function parseUserAgent(userAgent = ''): ClientInfo {
  const ua = userAgent.toLowerCase();
  const isBot = ua.length === 0 || BOT_PATTERN.test(ua);

  let device: ClientInfo['device'] = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) device = 'tablet';
  else if (/mobile|iphone|ipod|android/.test(ua)) device = 'mobile';

  let browser = 'Other';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('opr/') || ua.includes('opera')) browser = 'Opera';
  else if (ua.includes('samsungbrowser')) browser = 'Samsung Internet';
  else if (ua.includes('firefox/') || ua.includes('fxios')) browser = 'Firefox';
  else if (ua.includes('chrome/') || ua.includes('crios')) browser = 'Chrome';
  else if (ua.includes('safari/')) browser = 'Safari';

  return { isBot, device, browser };
}

/** Reduces a referrer URL to its hostname; same-site and empty referrers count as "direct". */
export function referrerHost(referrer: string, ownHost?: string): string {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    const own = ownHost?.split(':')[0]?.replace(/^www\./, '');
    if (!host || host === own) return 'direct';
    return host;
  } catch {
    return 'direct';
  }
}

/** YYYY-MM-DD for a date in the given IANA time zone. */
export function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** The last `days` day keys, oldest first, ending today. */
export function lastDayKeys(days: number, timeZone: string, now = new Date()): string[] {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    keys.push(dayKey(new Date(now.getTime() - i * 86_400_000), timeZone));
  }
  return [...new Set(keys)];
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Forwards rejected promises from async route handlers to Express's error handler. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
