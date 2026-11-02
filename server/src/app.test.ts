import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// Integration tests use a separate local database that is wiped before each test.
const TEST_DB = process.env.MONGODB_URI_TEST ?? 'mongodb://127.0.0.1:27017/portfolio_test';
const ADMIN_TOKEN = 'test-admin-token-1234567890';
process.env.ADMIN_TOKEN = ADMIN_TOKEN;
process.env.SMTP_HOST = '';

const { createApp } = await import('./app.js');
const { parseUserAgent, referrerHost, lastDayKeys } = await import('./utils.js');

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const app = createApp();
const post = (url: string, body: object) =>
  request(app).post(url).set('User-Agent', BROWSER_UA).send(body);

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});
beforeEach(async () => {
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
});
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('utils', () => {
  it('detects devices, browsers and bots', () => {
    expect(parseUserAgent(BROWSER_UA)).toEqual({ isBot: false, device: 'desktop', browser: 'Chrome' });
    expect(parseUserAgent('Mozilla/5.0 (iPhone) Safari/604.1').device).toBe('mobile');
    expect(parseUserAgent('Googlebot/2.1').isBot).toBe(true);
    expect(parseUserAgent('').isBot).toBe(true);
  });

  it('reduces referrers to a hostname', () => {
    expect(referrerHost('https://www.linkedin.com/feed/', 'example.com')).toBe('linkedin.com');
    expect(referrerHost('http://localhost:5173/', 'localhost:5000')).toBe('direct');
    expect(referrerHost('not a url')).toBe('direct');
  });

  it('builds consecutive day keys ending today', () => {
    const keys = lastDayKeys(3, 'UTC', new Date('2026-11-02T10:00:00Z'));
    expect(keys).toEqual(['2026-10-31', '2026-11-01', '2026-11-02']);
  });
});

describe('visitor counting', () => {
  it('counts page views, sessions and unique visitors separately', async () => {
    await post('/api/analytics/visit', { visitorId: 'visitor-aaaa', sessionId: 'session-1111' });
    await post('/api/analytics/visit', { visitorId: 'visitor-aaaa', sessionId: 'session-1111' });
    await post('/api/analytics/visit', { visitorId: 'visitor-aaaa', sessionId: 'session-2222' });
    const res = await post('/api/analytics/visit', { visitorId: 'visitor-bbbb', sessionId: 'session-3333' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      pageViews: 4,
      visits: 3,
      uniqueVisitors: 2,
      visitsToday: 3,
      onlineNow: 2,
    });
  });

  it('ignores bots', async () => {
    const res = await request(app)
      .post('/api/analytics/visit')
      .set('User-Agent', 'Googlebot/2.1')
      .send({ visitorId: 'visitor-bot1', sessionId: 'session-bot1' });
    expect(res.body.uniqueVisitors).toBe(0);
  });

  it('rejects malformed ids', async () => {
    const res = await post('/api/analytics/visit', { visitorId: 'x', sessionId: '<script>' });
    expect(res.status).toBe(400);
  });

  it('toggles one like per visitor', async () => {
    await post('/api/analytics/visit', { visitorId: 'visitor-aaaa', sessionId: 'session-1111' });
    const liked = await post('/api/analytics/like', { visitorId: 'visitor-aaaa' });
    expect(liked.body).toEqual({ liked: true, likes: 1 });
    const unliked = await post('/api/analytics/like', { visitorId: 'visitor-aaaa' });
    expect(unliked.body).toEqual({ liked: false, likes: 0 });
  });

  it('records events with known types only', async () => {
    const ok = await post('/api/analytics/event', {
      visitorId: 'visitor-aaaa',
      type: 'demo_interaction',
      label: 'loan:add',
    });
    expect(ok.status).toBe(204);
    const bad = await post('/api/analytics/event', { visitorId: 'visitor-aaaa', type: 'hack' });
    expect(bad.status).toBe(400);
  });
});

describe('contact form', () => {
  it('stores valid messages', async () => {
    const res = await post('/api/contact', {
      name: 'Sarah Jenkins',
      email: 'sarah@techcorp.com',
      message: 'We would love to talk about a role.',
    });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true, emailed: false });
  });

  it('rejects invalid input with a readable error', async () => {
    const res = await post('/api/contact', { name: 'A', email: 'nope', message: 'short' });
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
  });

  it('silently drops honeypot submissions', async () => {
    const res = await post('/api/contact', {
      name: 'Bot',
      email: 'bot@spam.com',
      message: 'Buy cheap things now please',
      website: 'http://spam.example',
    });
    expect(res.status).toBe(201);
    const admin = await request(app)
      .get('/api/admin/messages')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect(admin.body).toHaveLength(0);
  });
});

describe('admin API', () => {
  it('requires the admin token', async () => {
    expect((await request(app).get('/api/admin/overview')).status).toBe(401);
    expect(
      (await request(app).get('/api/admin/overview').set('Authorization', 'Bearer wrong')).status,
    ).toBe(401);
  });

  it('returns an overview with one row per day', async () => {
    await post('/api/analytics/visit', {
      visitorId: 'visitor-aaaa',
      sessionId: 'session-1111',
      referrer: 'https://www.linkedin.com/feed',
    });
    const res = await request(app)
      .get('/api/admin/overview?days=7')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body.daily).toHaveLength(7);
    expect(res.body.daily.at(-1).visits).toBe(1);
    expect(res.body.referrers).toEqual([{ name: 'linkedin.com', count: 1 }]);
    expect(res.body.totals.uniqueVisitors).toBe(1);
  });

  it('marks messages read and deletes them', async () => {
    await post('/api/contact', {
      name: 'Sarah',
      email: 'sarah@techcorp.com',
      message: 'Hello there, nice portfolio!',
    });
    const auth = { Authorization: `Bearer ${ADMIN_TOKEN}` };
    const list = await request(app).get('/api/admin/messages').set(auth);
    const id = list.body[0].id as string;

    const patched = await request(app).patch(`/api/admin/messages/${id}`).set(auth).send({ read: true });
    expect(patched.body).toEqual({ id, read: true });

    expect((await request(app).delete(`/api/admin/messages/${id}`).set(auth)).status).toBe(204);
    expect((await request(app).delete('/api/admin/messages/not-an-id').set(auth)).status).toBe(400);
  });
});
