import { Schema, model, type InferSchemaType } from 'mongoose';

/** One anonymous browser (random id kept in localStorage). No IP addresses are stored. */
const visitorSchema = new Schema({
  visitorId: { type: String, required: true, unique: true },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now, index: true },
  visits: { type: Number, default: 0 },
  pageViews: { type: Number, default: 0 },
  device: { type: String, default: 'desktop' },
  browser: { type: String, default: 'Other' },
  liked: { type: Boolean, default: false, index: true },
});

/** One browsing session (random id kept in sessionStorage). Reloads add page views. */
const visitSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    visitorId: { type: String, required: true, index: true },
    path: { type: String, default: '/' },
    referrer: { type: String, default: 'direct' },
    device: { type: String, default: 'desktop' },
    browser: { type: String, default: 'Other' },
    pageViews: { type: Number, default: 0 },
  },
  { timestamps: true },
);
visitSchema.index({ createdAt: -1 });

export const EVENT_TYPES = [
  'section_view',
  'demo_interaction',
  'resume_request',
  'contact_copy',
  'command_palette',
  'outbound_click',
  'theme_toggle',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

const eventSchema = new Schema(
  {
    visitorId: { type: String, required: true },
    type: { type: String, enum: EVENT_TYPES, required: true },
    label: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
eventSchema.index({ createdAt: -1 });

const messageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    emailed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type VisitorDoc = InferSchemaType<typeof visitorSchema>;
export type MessageDoc = InferSchemaType<typeof messageSchema>;

export const Visitor = model('Visitor', visitorSchema);
export const Visit = model('Visit', visitSchema);
export const AnalyticsEvent = model('AnalyticsEvent', eventSchema);
export const Message = model('Message', messageSchema);
