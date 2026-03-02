# Firebase Functions (Garixo)

This folder contains background automation functions for Garixo.  
Current scope is scheduled publishing for blog content.

## What This Functions Module Does

- Runs scheduled tasks in Firebase Cloud Functions (Gen 2).
- Uses Cloud Scheduler-style cron expressions via `onSchedule`.
- Calls Garixo HTTP APIs to execute server-side jobs.
- Writes operational logs with `firebase-functions/logger`.

## Current Function: `weeklyBlogPublish`

Source: `/functions/src/index.ts`

`weeklyBlogPublish` is a scheduled function that triggers blog publish automation.

### Purpose

- Trigger Garixo blog publishing workflow on a fixed schedule.
- Call `/api/blogs/publish-scheduled` so due scheduled posts can be published.

### Schedule Configuration

- Cron: `40 0 * * 3`
- Timezone: `Asia/Ho_Chi_Minh`
- Region: `us-central1`

This means it runs every Wednesday at **00:40 (UTC+7)**.

### Runtime Flow

1. Scheduler triggers `weeklyBlogPublish`.
2. Function writes start log with current timestamp and scheduler time.
3. Function sends HTTP `GET` request to:
   - `https://www.garixo.com/api/blogs/publish-scheduled`
4. Function logs response status and payload text.
5. If request fails, function logs the error.

### Important Operational Notes

- If the target API requires authorization in production, this function must send required auth headers/secrets.
- Logs are available via Firebase Functions logs.
- Keep this function idempotent-safe by relying on API-side publish checks.

## Prerequisites

- Node.js 20+
- Firebase CLI (`firebase-tools`)
- Access to Firebase project used by Garixo

## Local Setup

```bash
cd functions
npm install
```

## Scripts

```bash
# Compile TypeScript
npm run build

# Run local emulator (if configured)
npm run serve

# Deploy functions
npm run deploy

# View logs
npm run logs
```

## Folder Structure

- `src/`: TypeScript source files (entry: `src/index.ts`)
- `lib/`: compiled JavaScript output
- `package.json`: dependencies and scripts for functions workspace

## Deployment Guidance

- Run `npm run build` before deploy.
- Deploy from repository root using Firebase CLI project config.
- Validate schedule and timezone after deploy in Firebase console.

## How to Deploy

### 1) Login and select project

From repository root:

```bash
firebase login
firebase use <your-firebase-project-id> | garixo-pro or garixo-dev
```

### 2) Install and build functions

```bash
cd functions
npm install
npm run build
cd ..
```

### 3) Deploy only functions

```bash
firebase deploy --only functions
```

### 4) Verify deployment

- Open Firebase Console -> Functions.
- Confirm `weeklyBlogPublish` is deployed in `us-central1`.
- Open Scheduler/Triggers and verify:
  - cron: `40 0 * * 3`
  - timezone: `Asia/Ho_Chi_Minh`

### 5) Check logs after first run

```bash
firebase functions:log
```

### 6) Manual smoke test (API side)

- Call production endpoint used by the function:
  - `GET https://www.garixo.com/api/blogs/publish-scheduled`
- Confirm API response and function logs are successful.

### Rollback strategy

- If deploy introduces issues:
  - redeploy previous known-good commit/tag
  - or temporarily disable schedule by redeploying with safe no-op logic
