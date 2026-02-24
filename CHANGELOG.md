# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and follows semantic versioning principles.

## [Unreleased]

### Added

- Shared formatting utilities in `/src/lib/utils/format.ts` for currency/date/time/number helpers.

### Changed

- Standardized formatter usage across customers, vehicles, inventory, and work-orders modules.

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
