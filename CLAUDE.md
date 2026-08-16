# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Garixo is a marketing and blog site for a garage operations SaaS product, built on Next.js 16 (App Router) and React 19. This repo covers the public site only: landing/marketing pages, feature/solution pages, pricing, calculators, and the blog.

The dashboard/app product (garage onboarding, customer and vehicle management, work orders, invoices, staff, subscriptions, support) has moved to a separate, independently-developed project and is deployed at `app.garixo.com`. That project is not part of this repo — do not attempt to recreate dashboard functionality here. Marketing CTAs (login/signup) link out to `https://app.garixo.com/login` and `https://app.garixo.com/register`.

The untracked `docs/prd-learning-marketplace-mvp-vi.md` describes a possible future Chinese-language teacher/student marketplace; it is a planning document, not the current application model.

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

### Firebase Functions (separate project in `functions/`, currently orphaned)

`functions/` still exists with its scheduled job `dailyBlogPublish` (`functions/src/index.ts`, region `us-central1`, cron `40 0 * * *`, Etc/UTC), which calls `GET /api/blogs/publish-scheduled`. That route no longer exists in this app (the Firestore-backed blog CMS it served was removed along with the dashboard), so the function now hits a 404 daily. This is expected to be manually undeployed outside of this repo/session — do not "fix" it by recreating the removed CMS route.

## Core architecture

### Blog content

The blog is a self-contained, file-based system with no backend dependency:

- Posts live as markdown files in `public/blog/*.md` with frontmatter (title, slug, dates, `status`, `scheduledAt`, etc.), parsed via `gray-matter`.
- `src/services/blog-content/blog-fs.ts` reads these files at request time and computes the effective status (`scheduled` flips to `published` once `scheduledAt` has passed) — no cron job or database involved.
- `src/features/blogs/` holds the public-facing view model, SEO helpers, and components (`types.ts`, `utils.ts`, `author.ts`, `seo.ts`, `components/blog-*`).
- New posts are added as new markdown files, not through an admin UI (there isn't one in this repo).

### Request and data flow

This repo has no API route handlers and no database — it's a static/server-rendered marketing and blog site. Pages read directly from `blog-fs.ts` (blog) or from static content/config (everything else). There is no auth, no session, and no tenant concept in this codebase.

### UI

- The root layout installs React Query, toast, and analytics providers (`src/components/providers/app-providers.tsx`) — no auth/session provider.
- Reuse shared primitives in `src/components/ui` and `src/components/common` before creating a feature-local replacement.
- Use existing design tokens and semantic Tailwind classes from `globals.css` and `src/config/design-tokens.ts` — don't introduce disconnected colour or spacing scales.

## Repository map

```text
src/
  app/          App Router pages, layouts, and metadata (marketing + blog only; no api/ routes)
  components/   Reusable cross-feature UI, layout, SEO, analytics, and marketing
  config/       Environment validation, design tokens
  features/     blogs/ — the only feature module (public blog view model, SEO, components)
  hooks/        Shared React hooks
  lib/          Cross-cutting infrastructure (email templates, errors, query, state, utils)
  services/     blog-content (markdown blog reader), seo/sitemap, email.service.ts
  types/        Shared contracts (api.ts, primitives.ts) and ambient type declarations
functions/      Orphaned Firebase Functions project — see note above; not actively maintained
docs/           Product and engineering documentation
```

## Coding conventions

- Avoid `any`, unsafe casts, and untyped JSON. Prefer `unknown` plus Zod parsing for external input.
- Use `@/` imports (aliases resolve from `src/`: `@/app`, `@/features`, `@/services`, `@/lib`, `@/hooks`, `@/types`, `@/components`, `@/config`), not long relative paths.
- Use `type` imports for type-only dependencies.
- React components in PascalCase; files in kebab-case; functions/variables in camelCase; UPPER_SNAKE_CASE for immutable constants.
- Prefer named exports. Default exports only where Next.js requires them (pages, layouts, config) or where the surrounding module already uses one.
- Use React Query for remote client state; don't duplicate API data in Zustand or local state without a clear UI-only reason.
- Use `cn()` from `src/lib/utils/cn.ts` for conditional Tailwind classes, and CVA variants for reusable component styling.

## Environment and secrets

`src/config/env.ts` parses variables at import time: `NEXT_PUBLIC_API_URL` (required), plus optional `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_APP_SUPPORT_EMAIL`, and `NEXT_PUBLIC_SMTP_*`. `src/lib/email/` and `src/services/email.service.ts` are kept in the codebase for possible future reuse (e.g. a contact form) but currently have no callers.

Server-only credentials must never be exposed through `NEXT_PUBLIC_*` names; only retain existing compatibility names when deliberately modifying legacy code.
