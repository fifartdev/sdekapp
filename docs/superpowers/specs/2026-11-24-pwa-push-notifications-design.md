# PWA install + push notifications — design

Date: 2026-11-24
Status: awaiting approval

## Intent

Referees and admins use the app mostly from their phones. They should be invited to install it to the
home screen, and receive phone notifications in addition to (not instead of) the existing emails.

## Goals

- App is installable (manifest, square icons, standalone display, ΟΣΕΚΑ blue theme).
- Phone visitors see an install invitation:
  - Android/Chrome: real "Εγκατάσταση" button via `beforeinstallprompt`.
  - iOS Safari: instructions "Κοινή χρήση → Προσθήκη στην οθόνη Αφετηρίας" (iOS has no programmatic prompt).
- Logged-in users can enable notifications ("Ενεργοποίηση ειδοποιήσεων"). On iOS this is only offered
  when running installed (standalone), because iOS only allows web push there (iOS 16.4+).
- Push is sent at the same moments email is sent today:
  1. `sendAssignmentNotification(matchId)` → push to every assigned referee/commissioner who has a
     subscription. Title/body mirror the email subject/text (shortened). Click opens `/matches/{id}`.
  2. `setMyAvailability` / `setUnavailableForWholeDay` → push to all users with role `admin`.
     Body mirrors the federation email. Click opens `/match-days/{matchDayId}`.

## Non-goals

- Offline caching / offline mode (assignments are live data; no Serwist).
- New notification triggers beyond the two above.
- Per-user notification preferences UI beyond enable/disable on the current device.
- Third-party push services (OneSignal/Firebase).

## Anti-goals

- Push failures must never break or slow the existing action or its email. Push is best-effort,
  sent after/alongside email, errors swallowed and logged.
- The banner must not nag: dismissible, dismissal remembered per device (localStorage), and hidden
  on desktop and when already installed/subscribed.

## Constraints

- Next 16.3 App Router; follow `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md`.
- `proxy.ts` matcher does not cover `/sw.js`, `/manifest.webmanifest` or icons — they stay public. Keep it so.
- Drizzle schema in `lib/db/schema.ts`, applied with `npm run db:push`.
- New env vars: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto:). Must be added
  to `.env.local` and Vercel. If missing, push is silently skipped (app still works).

## Approaches considered

- **A. Built-in (chosen):** `app/manifest.ts` + `public/sw.js` + `web-push` + `push_subscriptions` table.
  No external accounts/cost; follows the official Next guide.
- B. Serwist: adds offline caching; extra build integration and dependency for little value here.
- C. OneSignal/Firebase: dashboard + stats, but external account, third party holds device data, heavier client script.

Picked A by the user.

## Design

**Data:** new table `push_subscriptions`:
`id uuid pk`, `profile_id uuid → profiles.id on delete cascade`, `endpoint text unique`, `p256dh text`,
`auth text`, `user_agent text null`, `created_at`. One user may have several devices.

**Server (`lib/push.ts`):** `sendPushToProfiles(profileIds, payload)` — loads subscriptions, sends with
`web-push` in parallel (`Promise.allSettled`), deletes subscriptions that return 404/410. No-op if VAPID
env vars missing. Payload: `{ title, body, url }`.

**Server actions (`app/actions/push.ts`):** `subscribePush(sub)` (upsert by endpoint for current user),
`unsubscribePush(endpoint)`. Both require a logged-in user.

**Hooks into `app/actions/matches.ts`:** after the existing email calls:
- assignment: resolve `referee.profileId` for each assignment (skip null) → `sendPushToProfiles`.
- availability: all `profiles` with role `admin` → `sendPushToProfiles`.

**Service worker (`public/sw.js`):** `push` → `showNotification(title, {body, icon, badge, data:{url}})`;
`notificationclick` → focus an open app window and navigate, or open `url`. Registered from the client
component with `scope: '/'`, `updateViaCache: 'none'`. Served with no-cache headers via `next.config` `headers()`.

**Manifest (`app/manifest.ts`):** name "ΚΕΔ ΟΣΕΚΑ - Ορισμοί Διαιτητών", short_name "ΚΕΔ ΟΣΕΚΑ",
start_url `/dashboard`, display `standalone`, theme/background from the primary blue, icons 192/512 +
maskable 512, plus `apple-touch-icon` 180. Icons generated once from `public/logo-oseka.png` centred on
the primary blue square, committed under `public/icons/`.

**Client UI (`components/pwa-prompt.tsx`, rendered in root layout):** a small bottom card, mobile only:
- not installed + Android with deferred prompt → "Εγκαταστήστε την εφαρμογή" + button.
- not installed + iOS Safari → install instructions.
- installed (or Android browser) + logged in + `Notification.permission === 'default'` + not subscribed →
  "Ενεργοποίηση ειδοποιήσεων" button → request permission → subscribe → `subscribePush`.
- Dismiss "Όχι τώρα" remembered in localStorage for 14 days.
Also an "Ειδοποιήσεις" on/off toggle in the dashboard sidebar footer so users can enable later or disable.

## Left to the builder

Exact copy wording/shortening of notification text, banner styling (match existing shadcn Card/Button),
icon generation tool (e.g. `sips`/sharp script — not a runtime dependency).

## Verification

`tsc`, `next build`, Lighthouse/Chrome DevTools "Application → Manifest" installability, local HTTPS
(`next dev --experimental-https`) push round-trip on desktop Chrome, then real Android + installed iOS test
after deploy.
