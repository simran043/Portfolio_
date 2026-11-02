import nodemailer, { type Transporter } from 'nodemailer';
import { config } from './config.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!config.smtp.enabled || !config.smtp.to) return null;
  transporter ??= nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
  return transporter;
}

interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

/** Emails a contact-form message. Returns false (and logs) when SMTP is off or sending fails. */
export async function sendContactEmail(msg: ContactMessage): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) return false;

  try {
    await transport.sendMail({
      from: config.smtp.from || config.smtp.user,
      to: config.smtp.to,
      replyTo: { name: msg.name, address: msg.email },
      subject: `Portfolio inquiry from ${msg.name}`,
      text: `${msg.message}\n\n---\nFrom: ${msg.name} <${msg.email}>`,
    });
    return true;
  } catch (err) {
    console.error('[mailer] Failed to send contact email:', (err as Error).message);
    return false;
  }
}
