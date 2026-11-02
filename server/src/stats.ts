import { config, ONLINE_WINDOW_MS } from './config.js';
import { Visit, Visitor } from './models.js';
import { dayKey } from './utils.js';

export interface PublicStats {
  pageViews: number;
  visits: number;
  uniqueVisitors: number;
  visitsToday: number;
  onlineNow: number;
  likes: number;
  liked: boolean;
}

export function countOnline(): Promise<number> {
  return Visitor.countDocuments({ lastSeen: { $gte: new Date(Date.now() - ONLINE_WINDOW_MS) } });
}

export async function getPublicStats(visitorId?: string): Promise<PublicStats> {
  const now = new Date();
  const today = dayKey(now, config.timezone);

  const [uniqueVisitors, visits, pageViewAgg, visitsToday, onlineNow, likes, visitor] =
    await Promise.all([
      Visitor.countDocuments(),
      Visit.countDocuments(),
      Visit.aggregate<{ total: number }>([{ $group: { _id: null, total: { $sum: '$pageViews' } } }]),
      Visit.countDocuments({
        // The 48h bound lets MongoDB use the createdAt index before the time-zone check.
        createdAt: { $gte: new Date(now.getTime() - 48 * 3_600_000) },
        $expr: {
          $eq: [
            { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: config.timezone } },
            today,
          ],
        },
      }),
      countOnline(),
      Visitor.countDocuments({ liked: true }),
      visitorId ? Visitor.findOne({ visitorId }, { liked: 1 }).lean() : null,
    ]);

  return {
    pageViews: pageViewAgg[0]?.total ?? 0,
    visits,
    uniqueVisitors,
    visitsToday,
    onlineNow,
    likes,
    liked: Boolean(visitor?.liked),
  };
}
