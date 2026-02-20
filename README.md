# Garixo - Garage Management Simple

Production-ready Next.js 16 starter for long-term SaaS growth.

## Tech stack
- Next.js 16 App Router, React 19, TypeScript strict
- next-auth (JWT strategy + RBAC)
- Axios + TanStack Query + Zod
- React Hook Form + Zod Resolver
- TailwindCSS + CVA + clsx + Lucide icons
- Zustand for lightweight client state
- ESLint + Prettier + Husky + lint-staged

## Quick start
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Demo credentials
- `admin@garixo.com` / `password123`
- `staff@garixo.com` / `password123`
- `user@garixo.com` / `password123`

## Architecture decisions
- **Feature-first domain slices** in `src/features/*` keep behavior cohesive.
- **No business logic in page files**. Pages compose feature/UI modules only.
- **Typed API contract** uses shared `ApiResponse<T>` and centralized handlers.
- **Auth at multiple layers**:
  - server layout guard with `auth()`
  - edge `middleware.ts` for route-level protection + role checks
  - optional client guard via `ProtectedRoute`
- **Environment validation** via `zod` in `src/config/env.ts` to fail fast.
- **Service layer** in `src/services` keeps future backend integrations isolated.
- **Global providers** (`session`, `react-query`, `toast`) bootstrapped once.

## Folder map
```text
src/
  app/
    (public)/
      login/
    (dashboard)/
      dashboard/
    api/
  features/
    auth/
    user/
    dashboard/
  services/
  lib/
    api/
    auth/
    errors/
    react-query/
    state/
    utils/
  hooks/
  types/
  components/
    common/
    layout/
    providers/
    ui/
  config/
```

## Core patterns
- API response shape:
  ```ts
  type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
  };
  ```
- Axios interceptors:
  - request: attach token when available
  - response: handle `401` globally (sign out + redirect)
- React Query as default server-state layer
- Zod schemas for auth/user validation

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run format`

## Git hooks
`lint-staged` runs eslint + prettier on staged files via `.husky/pre-commit`.
