import { createHash, timingSafeEqual } from 'node:crypto';
import { Router, type RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { config } from '../config.js';
import { AnalyticsEvent, Message, Visit } from '../models.js';
import { getPublicStats } from '../stats.js';
import { asyncHandler, HttpError, lastDayKeys } from '../utils.js';

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Bearer-token check against ADMIN_TOKEN, compared in constant time. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!config.adminToken) {
    next(new HttpError(503, 'Admin access is disabled. Set ADMIN_TOKEN in server/.env.'));
    return;
  }
  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !timingSafeEqual(digest(token), digest(config.adminToken))) {
    next(new HttpError(401, 'Invalid admin token.'));
    return;
  }
  next();
};

const overviewQuery = z.object({
  days: z.coerce.number().int().min(1).max(90).default(14),
});

interface CountRow {
  _id: string;
  count: number;
}

function toBreakdown(rows: CountRow[]) {
  return rows.map((row) => ({ name: row._id || 'unknown', count: row.count }));
}

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { days } = overviewQuery.parse(req.query);
    const since = new Date(Date.now() - days * 86_400_000);
    const inRange = { createdAt: { $gte: since } };
    const groupCount = (field: string, limit: number) => [
      { $match: inRange },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 as const } },
      { $limit: limit },
    ];

    const [totals, dailyRows, referrers, devices, browsers, events, unreadMessages] =
      await Promise.all([
        getPublicStats(),
        Visit.aggregate<{ date: string; visits: number; pageViews: number; uniqueVisitors: number }>([
          { $match: inRange },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: config.timezone },
              },
              visits: { $sum: 1 },
              pageViews: { $sum: '$pageViews' },
              visitors: { $addToSet: '$visitorId' },
            },
          },
          {
            $project: {
              _id: 0,
              date: '$_id',
              visits: 1,
              pageViews: 1,
              uniqueVisitors: { $size: '$visitors' },
            },
          },
        ]),
        Visit.aggregate<CountRow>(groupCount('referrer', 8)),
        Visit.aggregate<CountRow>(groupCount('device', 5)),
        Visit.aggregate<CountRow>(groupCount('browser', 6)),
        AnalyticsEvent.aggregate<{ _id: { type: string; label: string }; count: number }>([
          { $match: inRange },
          { $group: { _id: { type: '$type', label: '$label' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 15 },
        ]),
        Message.countDocuments({ read: false }),
      ]);

    // Fill in days with no traffic so the chart has one bar per day.
    const byDate = new Map(dailyRows.map((row) => [row.date, row]));
    const daily = lastDayKeys(days, config.timezone).map(
      (date) => byDate.get(date) ?? { date, visits: 0, pageViews: 0, uniqueVisitors: 0 },
    );

    res.json({
      days,
      timezone: config.timezone,
      totals: { ...totals, unreadMessages },
      daily,
      referrers: toBreakdown(referrers),
      devices: toBreakdown(devices),
      browsers: toBreakdown(browsers),
      events: events.map((e) => ({ type: e._id.type, label: e._id.label, count: e.count })),
    });
  }),
);

adminRouter.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const { limit } = z
      .object({ limit: z.coerce.number().int().min(1).max(200).default(50) })
      .parse(req.query);
    const messages = await Message.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(
      messages.map((m) => ({
        id: String(m._id),
        name: m.name,
        email: m.email,
        message: m.message,
        read: m.read,
        emailed: m.emailed,
        createdAt: m.createdAt,
      })),
    );
  }),
);

function messageId(raw: string): string {
  if (!isValidObjectId(raw)) throw new HttpError(400, 'Invalid message id.');
  return raw;
}

adminRouter.patch(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const { read } = z.object({ read: z.boolean() }).parse(req.body);
    const updated = await Message.findByIdAndUpdate(messageId(req.params.id), { read }, { new: true });
    if (!updated) throw new HttpError(404, 'Message not found.');
    res.json({ id: String(updated._id), read: updated.read });
  }),
);

adminRouter.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const deleted = await Message.findByIdAndDelete(messageId(req.params.id));
    if (!deleted) throw new HttpError(404, 'Message not found.');
    res.status(204).end();
  }),
);
