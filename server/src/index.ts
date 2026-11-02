import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config.js';

async function main() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log('[server] Connected to MongoDB');

  if (!config.adminToken) {
    console.warn('[server] ADMIN_TOKEN is not set: the /admin dashboard is disabled.');
  } else if (config.adminToken.length < 16) {
    console.warn('[server] ADMIN_TOKEN is short. Use at least 16 random characters.');
  }
  if (!config.smtp.enabled) {
    console.log('[server] SMTP not configured: contact messages are saved to MongoDB only.');
  }

  const server = createApp().listen(config.port, () => {
    console.log(`[server] API listening on http://localhost:${config.port}`);
  });

  const shutdown = () => {
    server.close(() => {
      void mongoose.disconnect().finally(() => process.exit(0));
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
