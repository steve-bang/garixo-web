# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Garixo is a multi-tenant garage operations SaaS built on Next.js 16 (App Router) and React 19. It supports garage onboarding, customer and vehicle management, work orders ("Jobs" in the UI), service and inventory catalogues, staff, invoices, subscriptions, support, and a public marketing/blog site.

The active product domain is garage management. The untracked `docs/prd-learning-marketplace-mvp-vi.md` describes a possible future Chinese-language teacher/student marketplace; it is a planning document, not the current application model. Do not rename or migrate the existing garage domain because of that PRD without an explicit implementation decision.

## Commands

```bash
npm run dev            # start dev server (http://localhost:3000)
npm run build           # production build
npm run start            # run production server
npm run lint             # eslint .
npm run typecheck        # tsc --noEmit
npm run format            # prettier --write .
npm run format:check      # prettier --check .
```

There is no test suite/runner configured in this repo (no jest/vitest/playwright). Verification is typecheck + lint + build.

Run `npm run typecheck` after TypeScript changes. At last check, typecheck passes but lint has pre-existing React-hook/ref errors and warnings — don't attribute those baseline failures to unrelated new work; report whether a change adds new findings.

Pre-commit hooks (Husky + lint-staged) run `eslint --fix` and `prettier --write` on staged files automatically.

### Firebase Functions (separate project in `functions/`)

```bash
cd functions
npm install
npm run build
npm run serve      # build + firebase emulators:start --only functions
firebase deploy --only functions
```

`functions/` has its own Node 24 runtime and dependency manifest, independent of the web app (Node 20+). Current scheduled job: `dailyBlogPublish` (`functions/src/index.ts`, region `us-central1`, cron `40 0 * * *`, Etc/UTC) — calls `GET /api/blogs/publish-scheduled` daily to publish blogs whose `status=scheduled` and `scheduledAt <= now`.

## Core architecture

### Authentication, roles, and tenancy

- Auth uses Firebase email/password verification through NextAuth's credentials provider, with JWT sessions.
- Roles are `owner`, `admin`, `staff`, `user` (see `src/types/user.ts`). Never introduce a role as a string literal in an isolated feature — update the central type, NextAuth declarations, authorization, and navigation together.
- The active tenant is a garage. Resolve it server-side with `getRequestGarageId()` or `getRequestGarage()` from `src/lib/auth/garage-context.ts`.
- Tenant data lives under `garages/{garageId}/...`. Every tenant-scoped API route must authenticate and resolve the garage before reading or writing data.
- `middleware.ts` protects `/dashboard/*`, but route handlers must still enforce authorization themselves — middleware is not sufficient authorization.

### Request and data flow

```text
Page / client component
  -> feature API client + React Query hook
  -> src/app/api/<resource>/route.ts
  -> Zod validation + auth + garage context
  -> Firebase service / resource database helper
  -> Firestore
```

- Shared API envelope: `ApiResponse<T> = { success: boolean; data?: T; error?: string }`.
- Validate URL params and bodies at the API boundary with Zod.
- Firestore persistence shapes live in `src/types/firebase-models.ts`; map them to feature-facing UI/domain types where those shapes differ.
- Store timestamps as ISO-8601 UTC strings unless an existing model specifies otherwise.
- Keep business logic out of `page.tsx` files: pages compose feature components, route handlers orchestrate validation/auth, services own persistence.

### UI

- The root layout installs NextAuth, React Query, toast, and analytics providers.
- Public pages live in the `(public)` route group; authenticated pages live in `(dashboard)` and render inside `DashboardLayoutShell`.
- Reuse shared primitives in `src/components/ui` and `src/components/common` before creating a feature-local replacement.
- Use existing design tokens and semantic Tailwind classes from `globals.css` and `src/config/design-tokens.ts` — don't introduce disconnected colour or spacing scales.

## Repository map

```text
src/
  app/          App Router pages, layouts, metadata, and HTTP route handlers
  components/   Reusable cross-feature UI, layout, SEO, analytics, and marketing
  config/       Environment validation, app/billing configuration, design tokens
  features/     Domain modules and feature-specific UI
  hooks/        Shared React hooks
  lib/          Cross-cutting infrastructure (auth, Firebase, API, query, utils)
  services/     External/infrastructure services, chiefly Firebase persistence
  types/        Shared contracts, Firestore shapes, session augmentation, primitives
functions/      Separate Firebase Functions project for scheduled/background work
docs/           Product and engineering documentation
```

### `src/features/<feature>` convention

Not every older feature has every file, but use this structure for new work when applicable:

```text
<feature>/
  types.ts       Feature domain and view-model types
  schema.ts      Zod schemas and inferred mutation/query input types
  service.ts     Typed client-side or server orchestration entry points
  api.ts         API-client exports and React Query keys
  hooks.ts       React Query hooks and invalidation logic
  utils.ts       Pure feature helpers
  components/    Feature UI only
```

Place server route handlers under `src/app/api/<feature>/`; put Firestore access in `src/services/firebase/` unless the feature already has an established resource database helper next to its routes (e.g. `work-orders-db.ts`). Follow the established pattern within the module being changed rather than introducing a new one.

## Coding conventions

- Avoid `any`, unsafe casts, and untyped JSON. Prefer `unknown` plus Zod parsing for external input.
- Use `@/` imports (aliases resolve from `src/`: `@/app`, `@/features`, `@/services`, `@/lib`, `@/hooks`, `@/types`, `@/components`, `@/config`), not long relative paths.
- Use `type` imports for type-only dependencies.
- React components in PascalCase; files in kebab-case; functions/variables in camelCase; UPPER_SNAKE_CASE for immutable constants.
- Prefer named exports. Default exports only where Next.js requires them (pages, layouts, config) or where the surrounding module already uses one.
- Use React Query for remote client state; don't duplicate API data in Zustand or local state without a clear UI-only reason.
- Use `cn()` from `src/lib/utils/cn.ts` for conditional Tailwind classes, and CVA variants for reusable component styling.
- Dashboard UI calls work orders "Jobs" — the underlying domain/API stays `work-orders`. Respect this naming split.
- Preserve backwards compatibility for Firestore documents: add optional fields and defensive defaults when reading existing records. Avoid breaking schema renames without a migration plan.

## Environment and secrets

`src/config/env.ts` parses required base variables at import time: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`. Firebase, SMTP, analytics, PayPal, and blog-scheduler variables are listed in that file and `.env.example`.

Server-only credentials must never be exposed through `NEXT_PUBLIC_*` names; only retain existing compatibility names when deliberately modifying legacy code.

## Implementation checklist for a typical tenant feature

1. Define feature types and Zod schema.
2. Add/update the Firestore model and service methods with tenant scoping.
3. Implement authenticated API routes with consistent response envelopes.
4. Add client API functions, React Query keys/hooks, and correct invalidation.
5. Build feature components from shared UI primitives, with loading/empty/error/success states.
6. Add navigation and role checks only after confirming intended access.
7. Run typecheck and relevant lint/build checks; report any baseline issues separately from new ones.
   </content>
