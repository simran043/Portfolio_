import { Router } from 'express';
import { z } from 'zod';
import { AnalyticsEvent, EVENT_TYPES, Visit, Visitor } from '../models.js';
import { countOnline, getPublicStats } from '../stats.js';
import { asyncHandler, HttpError, parseUserAgent, referrerHost } from '../utils.js';

export const idSchema = z.string().regex(/^[A-Za-z0-9-]{8,64}$/, 'Invalid id');

const visitSchema = z.object({
  visitorId: idSchema,
  sessionId: idSchema,
  path: z.string().max(200).default('/'),
  referrer: z.string().max(500).optional().default(''),
});

const visitorOnlySchema = z.object({ visitorId: idSchema });

const eventSchema = z.object({
  visitorId: idSchema,
  type: z.enum(EVENT_TYPES),
  label: z.string().trim().max(120).default(''),
});

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

export const analyticsRouter = Router();

/** Records a page view. A new sessionId also counts as a new visit. Bots are not counted. */
analyticsRouter.post(
  '/visit',
  asyncHandler(async (req, res) => {
    const body = visitSchema.parse(req.body);
    const client = parseUserAgent(req.get('user-agent'));

    if (!client.isBot) {
      let isNewSession = false;
      try {
        const result = await Visit.updateOne(
          { sessionId: body.sessionId },
          {
            $inc: { pageViews: 1 },
            $setOnInsert: {
              visitorId: body.visitorId,
              path: body.path,
              referrer: referrerHost(body.referrer, req.get('host')),
              device: client.device,
              browser: client.browser,
            },
          },
          { upsert: true },
        );
        isNewSession = result.upsertedCount === 1;
      } catch (err) {
        // Two tabs racing on the same new session: the other request inserted it, so just count the view.
        if (!isDuplicateKeyError(err)) throw err;
        await Visit.updateOne({ sessionId: body.sessionId }, { $inc: { pageViews: 1 } });
      }

      const now = new Date();
      try {
        await Visitor.updateOne(
          { visitorId: body.visitorId },
          {
            $set: { lastSeen: now, device: client.device, browser: client.browser },
            $inc: { pageViews: 1, visits: isNewSession ? 1 : 0 },
            $setOnInsert: { firstSeen: now },
          },
          { upsert: true },
        );
      } catch (err) {
        if (!isDuplicateKeyError(err)) throw err;
      }
    }

    res.json(await getPublicStats(body.visitorId));
  }),
);

/** Keeps a visitor counted as "online now" while their tab is open. */
analyticsRouter.post(
  '/heartbeat',
  asyncHandler(async (req, res) => {
    const { visitorId } = visitorOnlySchema.parse(req.body);
    await Visitor.updateOne({ visitorId }, { $set: { lastSeen: new Date() } });
    res.json({ onlineNow: await countOnline() });
  }),
);

/** Records an interaction such as a demo click or a section coming into view. */
analyticsRouter.post(
  '/event',
  asyncHandler(async (req, res) => {
    const body = eventSchema.parse(req.body);
    if (!parseUserAgent(req.get('user-agent')).isBot) {
      await AnalyticsEvent.create(body);
    }
    res.status(204).end();
  }),
);

analyticsRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const visitorId = idSchema.safeParse(req.query.visitorId);
    res.json(await getPublicStats(visitorId.success ? visitorId.data : undefined));
  }),
);

/** Toggles this visitor's like. One like per visitor. */
analyticsRouter.post(
  '/like',
  asyncHandler(async (req, res) => {
    const { visitorId } = visitorOnlySchema.parse(req.body);
    const visitor = await Visitor.findOne({ visitorId });
    if (!visitor) throw new HttpError(404, 'Visit the page before liking it.');

    visitor.liked = !visitor.liked;
    await visitor.save();

    const likes = await Visitor.countDocuments({ liked: true });
    res.json({ liked: visitor.liked, likes });
  }),
);
