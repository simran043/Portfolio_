export interface PublicStats {
  pageViews: number;
  visits: number;
  uniqueVisitors: number;
  visitsToday: number;
  onlineNow: number;
  likes: number;
  liked: boolean;
}

export type EventType =
  | 'section_view'
  | 'demo_interaction'
  | 'resume_request'
  | 'contact_copy'
  | 'command_palette'
  | 'outbound_click'
  | 'theme_toggle';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  website: string;
}

export interface DailyRow {
  date: string;
  visits: number;
  pageViews: number;
  uniqueVisitors: number;
}

export interface Breakdown {
  name: string;
  count: number;
}

export interface AdminOverview {
  days: number;
  timezone: string;
  totals: PublicStats & { unreadMessages: number };
  daily: DailyRow[];
  referrers: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  events: { type: EventType; label: string; count: number }[];
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  emailed: boolean;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Non-JSON error body: keep the generic message.
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  recordVisit: (body: { visitorId: string; sessionId: string; path: string; referrer: string }) =>
    request<PublicStats>('/analytics/visit', { method: 'POST', body: json(body) }),

  heartbeat: (visitorId: string) =>
    request<{ onlineNow: number }>('/analytics/heartbeat', {
      method: 'POST',
      body: json({ visitorId }),
    }),

  stats: (visitorId: string) =>
    request<PublicStats>(`/analytics/stats?visitorId=${encodeURIComponent(visitorId)}`),

  toggleLike: (visitorId: string) =>
    request<{ liked: boolean; likes: number }>('/analytics/like', {
      method: 'POST',
      body: json({ visitorId }),
    }),

  /** Fire-and-forget: analytics must never break the page. */
  trackEvent: (body: { visitorId: string; type: EventType; label: string }) => {
    request<void>('/analytics/event', { method: 'POST', body: json(body), keepalive: true }).catch(
      () => undefined,
    );
  },

  sendContact: (body: ContactPayload) =>
    request<{ ok: boolean; emailed: boolean }>('/contact', { method: 'POST', body: json(body) }),

  admin: {
    overview: (token: string, days: number) =>
      request<AdminOverview>(`/admin/overview?days=${days}`, { token }),
    messages: (token: string) => request<AdminMessage[]>('/admin/messages', { token }),
    setRead: (token: string, id: string, read: boolean) =>
      request<{ id: string; read: boolean }>(`/admin/messages/${id}`, {
        method: 'PATCH',
        token,
        body: json({ read }),
      }),
    deleteMessage: (token: string, id: string) =>
      request<void>(`/admin/messages/${id}`, { method: 'DELETE', token }),
  },
};
