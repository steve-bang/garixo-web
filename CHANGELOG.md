# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and follows semantic versioning principles.

## [Unreleased]

### Added

- Scheduled blog publishing API endpoint:
- `POST /api/blogs/publish-scheduled` (secret-key protected).
- `GET /api/blogs/publish-scheduled` (cron-oriented auth via bearer secret).
- Automatically publishes blogs where `status=scheduled` and `scheduledAt <= now`.
- Updates `status`, `publishedAt`, and `updatedAt` in publish flow.

- Vercel cron configuration:
- New `vercel.json` cron job to call `/api/blogs/publish-scheduled` every 5 minutes.

### Changed

- Blog scheduler query path now includes a safe fallback when Firestore composite index is missing:
- Prevents hard failure and allows local/dev execution while index is being provisioned.

- Environment configuration documentation in `/src/config/env.ts`:
- Added clearer inline comments and spacing for easier maintenance.

## [0.1.13] - 2026-02-28

### Added

- Blog management module for admin:
- New routes:
- `/dashboard/administrator/blogs`
- `/dashboard/administrator/blogs/new`
- `/dashboard/administrator/blogs/[id]/edit`
- New admin/public blog APIs:
- `/api/blogs/*`
- `/api/public/blogs/*`
- New public blog pages:
- `/blog`
- `/blog/[slug]`
- CKEditor 5 rich text editor with Firebase Storage image upload in:
- `/src/features/blogs/components/rich-text-editor.tsx`

- Dynamic sitemap architecture for SEO:
- `/sitemap.xml` as sitemap index
- `/sitemap-static.xml` for static/marketing pages
- `/sitemap-blog.xml` for published/indexable blog URLs

- Search engine sitemap notification service (best-effort on publish/update):
- `/src/services/seo/search-engine-notifier.ts`

### Changed

- Blog schema/form behavior simplified to require only core content fields.
- Blog editor UI now marks required fields with red `*` and includes clearer content section labeling.
- Blog list public page now includes a friendly empty state.
- Sitemap blog route now logs real errors in non-production and returns explicit `500` during local debugging.

### Fixed

- Firestore index precondition failure for blog sitemap:
- Added safe fallback query path when composite index is missing (query by `status=published`, then filter `isIndexed` in memory).
- Keeps `/sitemap-blog.xml` functional in local/dev while production can use optimized indexed query.

## [0.1.12] - 2026-02-28

### Added

- New admin-only users management route:
- `/dashboard/administrator/users`
- New Users Management UI with simple KPI cards and read-only detail drawer:
- `/src/features/user/components/users-management-page.tsx`
- `/src/features/user/components/user-detail-drawer.tsx`
- New sidebar section for admin accounts:
- `Administrator` -> `Users`

### Changed

- Users API now returns system-wide user list for admin accounts:
- `GET /api/users` reads from Firestore `users` collection (replacing mock-only flow).
- Route migration:
- `/dashboard/users` removed.
- Sidebar links updated to `/dashboard/administrator/users`.

- Work orders default list filter now uses `today`:
- `/src/features/work-orders/components/work-orders-management-page.tsx`
- Preserved explicit `all` query behavior when selected in filters.

### Fixed

- Resolved client-side env crash when loading users management:
- Removed client dependency chain that imported server env validation (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`) into browser bundle.
- Updated API client config to use `NEXT_PUBLIC_API_URL` directly in client context.

## [0.1.10] - 2026-02-28

### Added

- Basic Invoice MVP module integrated with Work Orders:
- Invoice domain types/schemas/services/hooks under `/src/features/invoices/*`.
- New dashboard invoices routes:
- `/src/app/(dashboard)/dashboard/invoices/page.tsx`
- `/src/app/(dashboard)/dashboard/invoices/[id]/page.tsx`
- Work order detail invoice quick actions card in `/src/features/invoices/components/invoice-summary-card.tsx`.
- Invoice Firestore service and model extensions:
- `/src/services/firebase/invoices-service.ts`
- `/src/types/firebase-models.ts`
- New invoice APIs:
- `GET /api/invoices`
- `POST /api/invoices/from-work-order`
- `GET /api/invoices/[id]`
- `PUT /api/invoices/[id]`
- `POST /api/invoices/[id]/send`

- Public invoice sharing flow:
- Public invoice page at `/src/app/(public)/invoice/[token]/page.tsx`.
- Public invoice UI component at `/src/features/invoices/components/public-invoice-page.tsx`.
- Public invoice API:
- `GET /api/public/invoices/[token]`.
- Share management APIs:
- `POST /api/invoices/[id]/share`
- `GET /api/invoices/[id]/share/current`
- `POST /api/invoices/[id]/share/revoke`
- Revocable/expirable share storage via `invoicePublicShares` with tokenized links.

- Invoice email template:
- `/src/lib/email/templates/invoice-template.ts` with detailed line items/totals breakdown.

- Subscription lifecycle notification templates:
- `/src/lib/email/templates/subscription-payment-failed-template.ts`
- `/src/lib/email/templates/subscription-payment-succeeded-template.ts`
- `/src/lib/email/templates/subscription-cancelled-template.ts`
- `/src/lib/email/templates/subscription-suspended-template.ts`

- Google Analytics 4 integration:
- Root GA loader and App Router pageview tracking in `/src/components/analytics/*`.
- Shared analytics helpers in `/src/lib/analytics/ga.ts`.

### Changed

- Invoice detail UX improvements:
- Added clearer field labels for Tax and Line Items on desktop/mobile in `/src/features/invoices/components/invoice-detail-page.tsx`.
- Added public-link card actions (generate/copy/revoke) in invoice detail page.
- Improved invoices list empty state messaging with owner-friendly guidance and direct CTAs in `/src/features/invoices/components/invoices-management-page.tsx`.

- Public invoice copy and metadata:
- Friendly unavailable/expired messages for customers in `/src/features/invoices/components/public-invoice-page.tsx`.
- Updated metadata and noindex settings for public invoice token route in `/src/app/(public)/invoice/[token]/page.tsx`.

- Invoice email send flow:
- Send endpoint now generates a public share link and sends that URL to customers.
- Send flow now syncs recipient email back to invoice snapshot and customer profile when applicable.

- PayPal webhook notification flow now sends owner-facing lifecycle emails for:
- `BILLING.SUBSCRIPTION.ACTIVATED`
- `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
- `PAYMENT.SALE.COMPLETED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `BILLING.SUBSCRIPTION.SUSPENDED`
- Webhook post-processing now exits early for duplicate/no-op events to avoid side effects after idempotency checks.
- Centralized subscription notification senders in `/src/services/email.service.ts`.

- Added product event tracking for onboarding, checkout intent, and invoice actions:
- `/src/features/onboarding/components/setup-garage-form.tsx`
- `/src/features/settings/components/subscription-settings.tsx`
- `/src/features/invoices/components/invoice-detail-page.tsx`
- `/src/features/invoices/components/public-invoice-page.tsx`

### Fixed

- Public share link persistence on invoice detail refresh:
- Added active-link retrieval API (`/api/invoices/[id]/share/current`) so owners can reload and still see the current public link.
- Legacy non-retrievable share rows are handled safely as `no active link`.

- Invoice email send rate limiting:
- Added per-garage limiter at `garages/{garageId}/rate-limits/invoice-email`.
- Enforced cap: `20` invoice emails per hour in `/src/app/api/invoices/[id]/send/route.ts`.
- Added friendly rate-limit modal in invoice detail UI for HTTP `429`:
- “To prevent accidental duplicate emails and protect your account, invoice emails can only be sent a few times within a short period.”

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

## [0.1.8] - 2026-03-15

### Added

- Tools landing pages:
- `/tools/auto-repair-labor-rate-calculator`
- `/tools/auto-repair-shop-profit-calculator`
- Step-by-step calculator components for labor rate and shop profit tools.
- Profit tool hero image at `/public/images/tools/repair-shop-profit-calculator-hero.webp`.
- GA event tracking for tool usage and tool CTAs.

### Changed

- Public header now includes a Tools dropdown and mobile links for the new calculators.
- Static sitemap now includes tool routes.

## [0.1.7] - 2026-03-14

### Added

- Solutions landing pages:
- `/solutions/garage-management-software-for-tire-shops`
- `/solutions/garage-management-software-for-auto-body-shops`
- `/solutions/garage-management-software-for-mobile-mechanics`
- `/solutions/garage-management-software-for-dealerships`
- Solutions menu in public header (desktop hover + mobile submenu) and footer column with solution links.

### Changed

- Auto body, mobile mechanics, and dealership solutions content now differentiated to avoid near-duplicate SEO content.
- Added testimonial section to the tire shops solution page.
- Added testimonial section to the auto body shops solution page.
- Updated static sitemap to include solution routes.

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
