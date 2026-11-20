# Garixo Engineering Guide

## Project overview

Garixo is a multi-tenant garage operations SaaS. It supports garage onboarding,
customer and vehicle management, jobs (work orders), service and inventory
catalogues, staff, invoices, subscriptions, support, and a public marketing/blog
site.

The active product domain is garage management. The untracked
`docs/prd-learning-marketplace-mvp-vi.md` describes a possible future Chinese
language teacher/student marketplace; it is a planning document, not the current
application model. Do not rename or migrate the existing garage domain solely
because of that PRD without an explicit implementation decision.

## Technology

- Next.js 16 App Router and React 19
- TypeScript 5 in strict mode
- Firebase Auth, Firestore (via Firebase Admin), and Firebase Storage
- NextAuth credentials provider with JWT sessions
- TanStack React Query for browser-side server state
- Zod and React Hook Form for request/form validation
- Tailwind CSS, CVA, clsx, and Lucide icons for UI
- PayPal for subscriptions; Nodemailer/SMTP for transactional email
- Firebase Functions Gen 2 for scheduled jobs
- ESLint, Prettier, Husky, and lint-staged for code quality

Node.js 20+ is required for the web app. The `functions/` package has its own
Node 24 runtime and dependency manifest.

## Core architecture

### Authentication, roles, and tenancy

- Authentication uses Firebase email/password verification through NextAuth's
  credentials provider. Sessions are JWT-based.
- Current roles are `owner`, `admin`, `staff`, and `user` (see
  `src/types/user.ts`). Do not introduce a role as a string literal in an
  isolated feature; update the central type, NextAuth declarations, authorization,
  and navigation together.
- The active tenant is a garage. Resolve it server-side with
  `getRequestGarageId()` or `getRequestGarage()` from
  `src/lib/auth/garage-context.ts`.
- Tenant data lives under `garages/{garageId}/...`. Every tenant-scoped API route
  must authenticate and resolve the garage before reading or writing data.
- `middleware.ts` protects `/dashboard/*`; route handlers must still enforce
  authorization themselves.

### Request and data flow

```text
Page / client component
  -> feature API client + React Query hook
  -> src/app/api/<resource>/route.ts
  -> Zod validation + auth + garage context
  -> Firebase service / resource database helper
  -> Firestore
```

- Use the shared API envelope: `ApiResponse<T>` is `{ success, data?, error? }`.
- Validate URL parameters and bodies at the API boundary with Zod.
- Keep Firestore persistence shapes in `src/types/firebase-models.ts`; map them
  to feature-facing UI/domain types where those shapes differ.
- Store timestamps as ISO-8601 UTC strings unless an existing model specifies
  otherwise.
- Keep business logic out of `page.tsx` files. Pages compose feature components;
  route handlers orchestrate validation/auth; services own persistence.

### UI

- The root layout installs NextAuth, React Query, toast, and analytics providers.
- Public pages live in the `(public)` route group. Authenticated application pages
  live in `(dashboard)` and render inside `DashboardLayoutShell`.
- Reuse shared primitives in `src/components/ui` and `src/components/common`
  before creating a feature-local replacement.
- Use the existing design tokens and semantic Tailwind classes from `globals.css`
  and `src/config/design-tokens.ts`; do not introduce disconnected colour or
  spacing scales.

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
public/         Static assets served directly by Next.js
docs/           Product and engineering documentation
firebase/       Firebase-related configuration/assets when present
```

### `src/features/<feature>` convention

Not every older feature has every file, but use this structure for new work when
applicable:

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

Place server route handlers under `src/app/api/<feature>/`; put Firestore access
in `src/services/firebase/` unless the feature already has an established
resource database helper next to its routes (for example `work-orders-db.ts`).
Follow the established pattern within the module you are changing.

## Coding conventions

- Use TypeScript types deliberately; avoid `any`, unsafe casts, and untyped
  JSON. Prefer `unknown` plus Zod parsing for external input.
- Use `@/` imports, not long relative paths. The alias resolves from `src/`.
- Use `type` imports for type-only dependencies.
- Name React components in PascalCase and files in kebab-case. Name functions and
  variables in camelCase; use UPPER_SNAKE_CASE for immutable constants.
- Prefer named exports. Use default exports only where Next.js requires them
  (pages, layouts, configuration) or where the surrounding module already uses
  one.
- Keep components focused. Extract meaningful feature components rather than
  building large page components with embedded data/business logic.
- Use React Query for remote client state. Do not duplicate API data in Zustand
  or local state without a clear UI-only reason.
- Use `cn()` from `src/lib/utils/cn.ts` for conditional Tailwind classes and CVA
  variants for reusable component styling.
- Respect existing wording: dashboard UI calls work orders “Jobs,” while the
  underlying domain/API remains `work-orders`.
- Preserve backwards compatibility for Firestore documents: add optional fields
  and defensive defaults when reading existing records. Avoid breaking schema
  renames without a migration plan.

## Environment and secrets

`src/config/env.ts` parses required base variables at import time:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `API_URL`

Firebase, SMTP, analytics, PayPal, and blog scheduler variables are listed in
that file and `.env.example`. Never commit `.env.local`, credentials, private
keys, payment secrets, or personal data. Server-only credentials must not be
exposed through `NEXT_PUBLIC_*` names.

## Commands and quality baseline

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run format:check
```

Run `npm run typecheck` after TypeScript changes and the smallest relevant
verification for the feature. At the time this guide was added, typecheck passes
but lint has pre-existing React-hook/ref errors and warnings. Do not silently
attribute those baseline failures to unrelated new work; report whether a change
adds new findings.

Use `apply_patch` for targeted file edits. Preserve unrelated working-tree
changes. Avoid destructive git commands unless explicitly requested.

## Implementation checklist

For a typical tenant feature:

1. Define feature types and Zod schema.
2. Add/update Firestore model and service methods with tenant scoping.
3. Implement authenticated API routes with consistent response envelopes.
4. Add client API functions, React Query keys/hooks, and correct invalidation.
5. Build feature components from shared UI primitives and states for loading,
   empty, error, and success.
6. Add navigation and role checks only after confirming intended access.
7. Run typecheck and relevant lint/build checks; report any baseline issues.
