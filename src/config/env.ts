import { z } from 'zod';

const envSchema = z.object({
  // Google Analytics 4 measurement id used on public pages.
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Public support email used in customer-facing UI and templates.
  NEXT_PUBLIC_APP_SUPPORT_EMAIL: z.string().email().optional(),

  // Public API base URL used by browser-side requests.
  NEXT_PUBLIC_API_URL: z.string().url(),

  // SMTP host (currently exposed as NEXT_PUBLIC in this project setup).
  NEXT_PUBLIC_SMTP_HOST: z.string().optional(),

  // SMTP port (currently exposed as NEXT_PUBLIC in this project setup).
  NEXT_PUBLIC_SMTP_PORT: z.string().optional(),

  // SMTP username (currently exposed as NEXT_PUBLIC in this project setup).
  NEXT_PUBLIC_SMTP_USERNAME: z.string().optional(),

  // SMTP password (currently exposed as NEXT_PUBLIC in this project setup).
  NEXT_PUBLIC_SMTP_PASSWORD: z.string().optional(),

  // SMTP sender email/display value.
  NEXT_PUBLIC_SMTP_SENDER: z.string().optional()
});

export const env = envSchema.parse({
  // Analytics / support
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_APP_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_APP_SUPPORT_EMAIL,

  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

  // SMTP
  NEXT_PUBLIC_SMTP_HOST: process.env.NEXT_PUBLIC_SMTP_HOST,
  NEXT_PUBLIC_SMTP_PORT: process.env.NEXT_PUBLIC_SMTP_PORT,
  NEXT_PUBLIC_SMTP_USERNAME: process.env.NEXT_PUBLIC_SMTP_USERNAME,
  NEXT_PUBLIC_SMTP_PASSWORD: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
  NEXT_PUBLIC_SMTP_SENDER: process.env.NEXT_PUBLIC_SMTP_SENDER
});
