import { z } from 'zod';

const envSchema = z.object({
  // Google Analytics 4 measurement id (read on the server, passed to the client by the root layout).
  GA4: z.string().optional(),

  // Public support email used in customer-facing UI and templates.
  APP_SUPPORT_EMAIL: z.string().email().optional(),

  // Site origin used for sitemap/robots (defaults to https://www.garixo.com).
  SITE_URL: z.string().url().optional(),

  // API base URL.
  API_URL: z.string().url(),

  // SMTP host (server-only).
  SMTP_HOST: z.string().optional(),

  // SMTP port (server-only).
  SMTP_PORT: z.string().optional(),

  // SMTP username (server-only).
  SMTP_USERNAME: z.string().optional(),

  // SMTP password (server-only).
  SMTP_PASSWORD: z.string().optional(),

  // SMTP sender email/display value.
  SMTP_SENDER: z.string().optional()
});

export const env = envSchema.parse({
  // Analytics / support
  GA4: process.env.GA4,
  APP_SUPPORT_EMAIL: process.env.APP_SUPPORT_EMAIL,

  SITE_URL: process.env.SITE_URL,
  API_URL: process.env.API_URL,

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_SENDER: process.env.SMTP_SENDER
});
