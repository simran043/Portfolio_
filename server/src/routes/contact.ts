import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { sendContactEmail } from '../mailer.js';
import { Message } from '../models.js';
import { asyncHandler } from '../utils.js';

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please enter your name.')
    .max(100, 'Name is too long.')
    .regex(/^[^\r\n]+$/, 'Name must be a single line.'),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  message: z
    .string()
    .trim()
    .min(10, 'Message should be at least 10 characters.')
    .max(5000, 'Message is too long (5000 characters max).'),
  // Honeypot: hidden from people, bots tend to fill it in.
  website: z.string().max(200).optional().default(''),
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages from this network. Please try again in an hour.' },
});

export const contactRouter = Router();

contactRouter.post(
  '/',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const { website, ...msg } = contactSchema.parse(req.body);

    if (website) {
      // Pretend success so bots don't learn about the trap.
      res.status(201).json({ ok: true, emailed: false });
      return;
    }

    const saved = await Message.create(msg);
    const emailed = await sendContactEmail(msg);
    if (emailed) {
      saved.emailed = true;
      await saved.save();
    }

    res.status(201).json({ ok: true, emailed });
  }),
);
