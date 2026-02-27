# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and follows semantic versioning principles.

## [Unreleased]

### Added

- No entries yet.

## [0.1.9] - 2026-02-27

### Added

- Free-tier bootstrap for new garages during onboarding:
- `garages/{garageId}/billing/current` initialized with free plan defaults.
- `garages/{garageId}/usage/current` initialized with usage counters and period metadata.
- New bootstrap service at `/src/services/firebase/garage-billing-usage-bootstrap-service.ts`.

- Shared billing plan/feature config for centralized plan rules and UI config:
- `/src/features/billing/plan-feature-config.ts`.

- Usage plan sync service:
- `/src/services/firebase/usage-plan-sync-service.ts`.
- Synchronizes `usage/current` feature gates and limits with current subscription plan.

### Changed

- Work-order creation now enforces usage limits from `usage/current` key `workOrders`:
- Transactional create + usage consume in `/src/app/api/work-orders/work-orders-db.ts`.
- Friendly API responses for plan-limit and feature-disabled cases in `/src/app/api/work-orders/route.ts`.

- Work-order create UX improvements for non-technical owners:
- Added upgrade modals in:
- `/src/features/work-orders/components/create-order-form.tsx`
- `/src/features/work-orders/components/first-work-order-drawer.tsx`
- CTA routes users to subscription settings when plan upgrade is required.

- Subscription settings now consumes shared plan config instead of local inline plan definitions:
- `/src/features/settings/components/subscription-settings.tsx`.

- Billing lifecycle now syncs usage rules on plan transitions:
- Capture approval integration in `/src/app/api/billing/paypal/capture-approval/route.ts`.
- Webhook integration for `ACTIVATED`, `RE-ACTIVATED`, `CANCELLED`, `SUSPENDED` in `/src/app/api/billing/paypal/webhook/route.ts`.

### Fixed

- Staff usage baseline now uses `0` (owner not counted as staff seat) and release flow aligns with this baseline.
- Staff service refactor centralizes usage seat logic and reduces duplicated quota/counter code.

## [0.1.8] - 2026-02-27

### Added

- New public pricing page at `/src/app/pricing/page.tsx` with:
- SEO metadata and canonical URL for `/pricing`.
- Structured data: `SoftwareApplication`, `BreadcrumbList`, and `FAQPage`.
- Clear two-plan pricing content for independent garage owners.

### Changed

- Improved internal-link conversion and crawl flow to pricing:
- Home hero CTA now links to `/pricing`.
- Home CTA section includes a direct `/pricing` link.
- Features page top and bottom CTA sections now link to `/pricing`.
- Landing header and footer now include `/pricing` navigation links.

## [0.1.7] - 2026-02-26

### Added

- Billing and PayPal backend foundation:
- Billing config map for plan/cycle -> PayPal plan id in `/src/config/billing.ts`.
- Billing domain schemas and types in `/src/features/billing/*`.
- Firestore billing model fields for PayPal subscription lifecycle in `/src/types/firebase-models.ts`.
- PayPal client service in `/src/services/paypal/paypal-client.ts` (token, create/get/cancel subscription, webhook signature verification).
- Billing APIs:
- `POST /api/billing/paypal/create-subscription`
- `POST /api/billing/paypal/capture-approval`
- `POST /api/billing/paypal/cancel`
- `POST /api/billing/paypal/webhook`
- `GET /api/billing/subscription`
- Billing architecture documentation at `/docs/billing-subscription-flow.md` with webhook lifecycle/event handling.

### Changed

- Subscription settings page at `/dashboard/settings/subscription` now supports:
- PayPal checkout redirect from CTA.
- PayPal callback handling (`paypal=success|cancelled`) with capture-approval call and URL cleanup.
- Status-driven top billing card from Firestore snapshot (`trialing`, `active`, `past_due`, `cancelled`, `suspended`).
- Friendly, owner-focused status copy and CTA text.
- Loading skeleton and safe empty state (`No subscription yet`).
- Trial messaging driven by per-plan `trialDays` field.
- Refactored subscription UI format helpers to shared utilities in `/src/lib/utils/format.ts`.

### Fixed

- Trialing reconciliation for PayPal plans with `TRIAL` + `REGULAR` billing cycles:
- Capture-approval and webhook handlers now derive `trialing` from PayPal cycle executions.
- `trialEndsAt/currentPeriodEnd` are aligned with PayPal `next_billing_time` during trial tenure.
- Added `lastPaidAt` billing field and update logic on successful payment events for clearer state transitions.

## [0.1.6] - 2026-02-25

### Added

- Garage industry type model and enum (`General Repair`, `Tire Shop`, `Quick Lube`, `Mobile Mechanic`, `Other`) across onboarding, settings, and Garage persistence.
- Automatic default seeding on onboarding garage setup:
- Services seeded by `industryType` from `/src/features/services/default-values.ts`.
- Inventory seeded by `industryType` from `/src/features/inventory/default-values.ts`.
- New seeder service at `/src/services/firebase/garage-defaults-seeder.ts`.

### Changed

- Customer domain refactor to relation-based vehicle model:
- Removed `customer.vehicles[]` dependency from customer type/listing and moved to `totalVehicles` + vehicle lookup by `customerId`.
- Customer detail API now returns linked `vehicles` separately.
- Customer vehicles CRUD now operates via vehicles collection relation.
- Vehicles management adds customer filter (`customerId`) and supports conditional customer vehicle listing.
- Work-order create flows updated to load customer vehicles via API relation (no in-memory `customer.vehicles[]` usage).
- Vehicles create/edit flow now requires real `customerId` relation.

- Dashboard/request optimization:
- Customers page now uses a single customers query source for table + KPI to avoid duplicate `/api/customers` calls.
- Vehicles page removes separate KPI fetch query, lazy-loads customer filter options, and limits customer query to needed states.
- Dashboard sidebar/breadcrumb links use `prefetch={false}` to reduce background route traffic.

### Fixed

- Firestore transaction ordering in work-order completion flow:
- Resolved `Firestore transactions require all reads to be executed before all writes`.
- Reordered status transition transaction to perform all reads first, then writes.
- Completion transition now safely updates customer and vehicle aggregates:
- Customer: `totalVisits`, `totalSpent`, `lastVisit`.
- Vehicle: `totalVisits`, `totalSpent`, `lastServiceDate`.

## [0.1.5] - 2026-02-24

### Changed

- Release metadata updated for the latest production tag cycle.

## [0.1.4] - 2026-02-24

### Fixed

- Resolved `/verify-email` prerender build failure by moving `useSearchParams()` usage into a client component wrapped with `Suspense`.
- Improved dashboard header responsiveness on small mobile/tablet:
- Compact breadcrumb rendering for narrow screens.
- Better action button sizing/spacing so breadcrumb remains readable.
- Added horizontal spacing for `/auth/forgot-password` on small mobile/tablet to match other auth pages.

## [0.1.3] - 2026-02-24

### Added

- Verify email experience page at `/src/app/verify-email/page.tsx` with status-based UI (`success`, `expired`, `invalid`) and resend cooldown flow.
- Verification APIs:
- `POST /api/resend-verification` at `/src/app/api/resend-verification/route.ts`.
- `GET /api/auth/verify-email` at `/src/app/api/auth/verify-email/route.ts`.
- `POST /api/auth/verify-email/send` at `/src/app/api/auth/verify-email/send/route.ts`.
- Email + verification service layer:
- `/src/services/email.service.ts`
- `/src/services/verification.service.ts`
- Verify email template at `/src/lib/email/templates/verify-email-template.ts`.
- Dashboard onboarding verification notice component at `/src/features/onboarding/components/email-verification-notice.tsx`.

### Changed

- Dashboard onboarding now shows verify-email reminder after account age is at least 1 day for unverified owners.
- Verification token flow now uses hashed tokens with 48-hour expiry and single-use semantics.
- Firebase user model extended with verification token lifecycle fields.

## [0.1.2] - 2026-02-24

### Added

- Route loading UI for dashboard at `/src/app/(dashboard)/dashboard/loading.tsx`.

## [0.1.1] - 2026-02-24

### Changed

- Login page now checks session server-side and redirects authenticated users from `/auth/login` to `/dashboard`.

## [0.1.0] - 2026-02-24

### Added

- Shared formatting utilities in `/src/lib/utils/format.ts` for currency/date/time/number helpers.

### Changed

- Updated customers KPI `Top Spender` display to USD.
- Updated vehicles KPI `Total Revenue` display to USD.
- Consolidated formatter usage across customers, vehicles, inventory, and work-orders modules.
