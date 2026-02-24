# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and follows semantic versioning principles.

## [Unreleased]

### Added

- No entries yet.

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
