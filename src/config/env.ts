import { z } from 'zod';

const envSchema = z.object({
  // Google Analytics 4 measurement id used on public pages.
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Public support email used in customer-facing UI and templates.
  NEXT_PUBLIC_APP_SUPPORT_EMAIL: z.string().email().optional(),

  // NextAuth base URL for callback/session handling.
  NEXTAUTH_URL: z.string().url(),

  // NextAuth signing/encryption secret (minimum strength enforced).
  NEXTAUTH_SECRET: z.string().min(16),

  // Public API base URL used by browser-side requests.
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Firebase Admin SDK project id.
  FIREBASE_PROJECT_ID: z.string().optional(),

  // Firebase Admin SDK service account client email.
  FIREBASE_CLIENT_EMAIL: z.string().optional(),

  // Firebase Admin SDK service account private key.
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Firebase Storage bucket for admin uploads/assets.
  FIREBASE_STORAGE_BUCKET: z.string().optional(),

  // Firebase Web SDK API key (public).
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),

  // Firebase Web SDK auth domain (public).
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),

  // Firebase Web SDK project id (public).
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),

  // Firebase Web SDK storage bucket (public).
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),

  // Firebase Web SDK app id (public).
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),

  // SMTP host (currently exposed as NEXT_PUBLIC in this project setup).
  NEXT_PUBLIC_SMTP_HOST: z.string().optional(),

  // SMTP port (currently exposed as NEXT_PUBLIC in this project setup).
  NEXT_PUBLIC_SMTP_PORT: z.string().optional(),

  // SMTP username (currently exposed as NEXT_PUBLIC in this project setup).
  NEXT_PUBLIC_SMTP_USERNAME: z.string().optional(),

  // SMTP password (currently exposed as NEXT_PUBLIC in this project setup).
  NEXT_PUBLIC_SMTP_PASSWORD: z.string().optional(),

  // SMTP sender email/display value.
  NEXT_PUBLIC_SMTP_SENDER: z.string().optional(),

  // PayPal REST client id.
  PAYPAL_CLIENT_ID: z.string().optional(),

  // PayPal REST client secret.
  PAYPAL_CLIENT_SECRET: z.string().optional(),

  // PayPal environment target.
  PAYPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),

  // PayPal webhook id used for signature verification.
  PAYPAL_WEBHOOK_ID: z.string().optional(),

  // Enables verbose PayPal webhook debug logs when set to "true".
  DEBUG_PAYPAL_WEBHOOK: z.enum(['true', 'false']).optional(),

  // Shared secret for scheduled blog publish endpoint.
  BLOG_SCHEDULER_SECRET: z.string().optional(),

  // PayPal plan id for Starter monthly.
  PAYPAL_PLAN_ID_STARTER_MONTHLY: z.string().optional(),

  // PayPal plan id for Starter annual.
  PAYPAL_PLAN_ID_STARTER_ANNUAL: z.string().optional(),

  // PayPal plan id for Growth monthly.
  PAYPAL_PLAN_ID_GROWTH_MONTHLY: z.string().optional(),

  // PayPal plan id for Growth annual.
  PAYPAL_PLAN_ID_GROWTH_ANNUAL: z.string().optional()
});

export const env = envSchema.parse({
  // Analytics / support
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_APP_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_APP_SUPPORT_EMAIL,

  // Auth / API
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,

  // Firebase Web SDK
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

  // SMTP
  NEXT_PUBLIC_SMTP_HOST: process.env.NEXT_PUBLIC_SMTP_HOST,
  NEXT_PUBLIC_SMTP_PORT: process.env.NEXT_PUBLIC_SMTP_PORT,
  NEXT_PUBLIC_SMTP_USERNAME: process.env.NEXT_PUBLIC_SMTP_USERNAME,
  NEXT_PUBLIC_SMTP_PASSWORD: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
  NEXT_PUBLIC_SMTP_SENDER: process.env.NEXT_PUBLIC_SMTP_SENDER,

  // PayPal / billing
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_ENV: process.env.PAYPAL_ENV,
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
  DEBUG_PAYPAL_WEBHOOK: process.env.DEBUG_PAYPAL_WEBHOOK,
  PAYPAL_PLAN_ID_STARTER_MONTHLY: process.env.PAYPAL_PLAN_ID_STARTER_MONTHLY,
  PAYPAL_PLAN_ID_STARTER_ANNUAL: process.env.PAYPAL_PLAN_ID_STARTER_ANNUAL,
  PAYPAL_PLAN_ID_GROWTH_MONTHLY: process.env.PAYPAL_PLAN_ID_GROWTH_MONTHLY,
  PAYPAL_PLAN_ID_GROWTH_ANNUAL: process.env.PAYPAL_PLAN_ID_GROWTH_ANNUAL,

  // Blog
  BLOG_SCHEDULER_SECRET: process.env.BLOG_SCHEDULER_SECRET
});
