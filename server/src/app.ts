import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { config } from './config.js';
import { adminRouter } from './routes/admin.js';
import { analyticsRouter } from './routes/analytics.js';
import { contactRouter } from './routes/contact.js';
import { HttpError } from './utils.js';

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );
  app.use('/api', cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '20kb' }));
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Too many requests. Please slow down.' },
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/admin', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  }, adminRouter);
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found.')));

  // Serve the built React app when it exists (after `npm run build`).
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/admin')) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid request.', issues: err.issues });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    if (err?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Malformed JSON body.' });
      return;
    }
    console.error('[server] Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  };
  app.use(errorHandler);

  return app;
}
