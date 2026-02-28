# Garixo - Garage Management SaaS

Garixo is a production-focused garage operations platform built with Next.js 16, React 19, TypeScript, Firebase, and NextAuth.

It supports the full workshop flow: onboarding, customer and vehicle management, work-order lifecycle, service and inventory catalogs, staff operations, dashboard metrics, and email verification.

## Core capabilities

- Authentication and authorization:
- NextAuth credentials flow with JWT sessions.
- Role-based access for owner/manager/staff/user.
- Middleware and server-side route protection.

- Garage onboarding:
- Setup garage with `industryType` (`General Repair`, `Tire Shop`, `Quick Lube`, `Mobile Mechanic`, `Other`).
- Seed default services and inventory based on industry type during onboarding.

- Operations modules:
- Work Orders: draft-to-paid lifecycle, status transitions, timeline, parts/services, payment, cancellation.
- Customers: relation-based model with `totalVehicles` and customer-level financial metrics.
- Vehicles: linked to customer by `customerId`, customer filtering, service history integration.
- Services: catalog CRUD, pricing, categories, active/inactive state.
- Inventory: stock tracking, adjustments, low-stock awareness.
- Staff: assignment and workload tracking.

- Verification and email:
- Verify-email flow with resend and cooldown.
- SMTP email templates/services for verification and password reset.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict mode)
- NextAuth (JWT)
- Firebase + Firebase Admin
- TanStack React Query
- Zod
- React Hook Form + `@hookform/resolvers`
- Tailwind CSS + CVA + clsx + Lucide
- ESLint + Prettier + Husky + lint-staged

## Project architecture

- Feature-based structure in `src/features/*`
- App routes and API handlers in `src/app/*`
- Firebase service layer in `src/services/firebase/*`
- Shared libraries in `src/lib/*`
- Typed contracts in `src/types/*`

Key patterns:

- No business logic in page files.
- Typed API response envelope:

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

- Validation through Zod in API and form layers.
- React Query for server-state orchestration.

## Quick start

### 1) Install

```bash
npm install
```

### 2) Environment

```bash
cp .env.example .env.local
```

Required (validated):

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL`

Common optional integrations:

- Firebase Admin: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`
- Firebase Client: `NEXT_PUBLIC_FIREBASE_*`
- SMTP: `NEXT_PUBLIC_SMTP_*`
- Google Analytics (GA4): `NEXT_PUBLIC_GA_MEASUREMENT_ID` (production only)

### 3) Run

```bash
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint project
- `npm run typecheck` - run TypeScript checks
- `npm run format` - format code
- `npm run format:check` - check formatting

## Notable directories

```text
src/
  app/                    # App Router pages + API routes
  features/               # Domain modules (auth, work-orders, customers, ...)
  services/firebase/      # Firestore/Firebase service layer
  lib/                    # Auth, API client/handler, query client, utils
  components/             # UI and layout components
  config/                 # env + design/app config
  types/                  # shared types and contracts
```

## Quality and release

- Pre-commit hooks run eslint + prettier on staged files.
- Changelog is maintained in `CHANGELOG.md`.
- Recent tagged release: `v0.1.6`.
