# PWA Install + Push Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the app installable on phones and send web-push notifications alongside the two existing email sends.

**Architecture:** `app/manifest.ts` + square icons make it installable; `public/sw.js` receives pushes; `web-push` sends from server actions using subscriptions stored in a new `push_subscriptions` table. A client `PwaPrompt` banner handles install invitation and permission; a sidebar toggle enables/disables per device. Pure decision logic lives in small tested modules.

**Tech Stack:** Next 16.3 App Router, Drizzle + Supabase Postgres, `web-push`, Tailwind/shadcn, `node:test` via `tsx --test`.

**Spec:** `docs/superpowers/specs/2026-11-24-pwa-push-notifications-design.md`

## Global Constraints

- Follow `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md` (Next 16.3 differs from training data).
- Env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:` value). Missing → push silently skipped.
- Push never throws out of, or blocks, an existing action or email: `Promise.allSettled`, errors `console.error`ed.
- `proxy.ts` matcher must NOT gain `/sw.js`, `/manifest.webmanifest`, `/icons/*`.
- Theme colour: `#143694` (hsl 224 76% 33%, the light `--primary`). Background `#143694`.
- Manifest: name `ΚΕΔ ΟΣΕΚΑ - Ορισμοί Διαιτητών`, short_name `ΚΕΔ ΟΣΕΚΑ`, start_url `/dashboard`, display `standalone`, lang `el`.
- All user-facing copy in Greek. Banner dismissal key `pwa-prompt-dismissed-until`, 14 days; localStorage wrapped in try/catch.
- Tests: `npx tsx --test lib/*.test.ts` (no new test framework).

## Review Focus

- Referee assignment whose `referees.profile_id` is null → skipped, others still notified (Task 3 test).
- Subscription endpoint returning 404/410 → row deleted; other errors → row kept (Task 3 test).
- iOS Safari not installed → instructions shown, notifications button NOT shown (Task 4 test).
- `Notification.permission === "denied"` → no enable button, sidebar toggle shows disabled state with hint (Task 4 test).
- Same device subscribing twice / switching user → upsert by `endpoint` reassigns `profile_id` (Task 2, verified manually in Task 5).

---

### Task 1: Installability (manifest, icons, metadata, sw headers)

**Files:**
- Create: `app/manifest.ts`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/maskable-512.png`, `public/icons/apple-touch-icon.png` (180), `public/icons/badge-96.png` (white glyph on transparent — may be the logo whitened), `scripts/generate-icons.sh`
- Modify: `app/layout.tsx` (metadata: `appleWebApp: { capable: true, title: "ΚΕΔ ΟΣΕΚΑ", statusBarStyle: "default" }`, `icons.apple`, plus `export const viewport = { themeColor: "#143694" }`), `next.config.mjs` (`headers()` for `/sw.js`: `Cache-Control: no-cache, no-store, must-revalidate`, `Content-Type: application/javascript; charset=utf-8`, `Content-Security-Policy: default-src 'self'; script-src 'self'`)

- [ ] **Step 1:** Write `scripts/generate-icons.sh` using macOS `sips` (+ `python3 -I` with stdlib only if compositing is needed; no npm deps): logo `public/logo-oseka.png` (292×90) centred on `#143694` square at ~80% width (~60% for maskable). Run it; open the PNGs to eyeball.
- [ ] **Step 2:** Implement `app/manifest.ts` returning `MetadataRoute.Manifest` with the Global Constraints values and the four icons (`purpose: "maskable"` on the maskable one).
- [ ] **Step 3:** Update `app/layout.tsx` and `next.config.mjs` as listed.
- [ ] **Step 4:** Verify: `npx tsc --noEmit` clean; `npm run build` succeeds; `curl -s localhost:3000/manifest.webmanifest` (with `npm start`) returns the JSON while logged out.
- [ ] **Step 5:** Commit `feat(pwa): add web app manifest and icons`.

### Task 2: Subscription storage + server push sender

**Files:**
- Modify: `lib/db/schema.ts` (add `pushSubscriptions`), `package.json` (`web-push`, `@types/web-push`; script `"test": "tsx --test lib/*.test.ts"`)
- Create: `lib/push.ts`, `lib/push.test.ts`, `app/actions/push.ts`

**Interfaces:**
- Produces:
  - table `pushSubscriptions` (`push_subscriptions`): `id uuid pk defaultRandom`, `profileId uuid notNull → profiles.id onDelete cascade`, `endpoint text notNull unique`, `p256dh text notNull`, `auth text notNull`, `userAgent text`, `createdAt timestamptz defaultNow`.
  - `type PushPayload = { title: string; body: string; url: string }`
  - `isGoneStatus(statusCode: number | undefined): boolean` — true for 404 and 410 only.
  - `sendPushToProfiles(profileIds: string[], payload: PushPayload): Promise<void>` — dedupes ids, no-op on empty list or missing VAPID env, deletes gone endpoints.
  - server actions `subscribePush(sub: { endpoint: string; keys: { p256dh: string; auth: string } }, userAgent?: string): Promise<void>` (requireUserAction; zod-validate; upsert on `endpoint` setting `profileId`=current user) and `unsubscribePush(endpoint: string): Promise<void>` (deletes only the current user's row).

- [ ] **Step 1: Failing test** `lib/push.test.ts`: `isGoneStatus(404) === true`, `isGoneStatus(410) === true`, `isGoneStatus(500) === false`, `isGoneStatus(undefined) === false`.
- [ ] **Step 2:** `npm test` → FAIL (module missing).
- [ ] **Step 3:** Install deps; add schema; implement `lib/push.ts` (import db lazily inside `sendPushToProfiles` so the test doesn't need DB env) and `app/actions/push.ts`.
- [ ] **Step 4:** `npm test` PASS; `npx tsc --noEmit` clean; `npm run db:push` creates the table (confirm in output).
- [ ] **Step 5:** Commit `feat(push): subscription table and web-push sender`.

### Task 3: Send pushes from the existing email moments

**Files:**
- Create: `lib/push-messages.ts`, `lib/push-messages.test.ts`
- Modify: `app/actions/matches.ts` (`setMyAvailability`, `setUnavailableForWholeDay`, `sendAssignmentNotification`)

**Interfaces:**
- Consumes: `sendPushToProfiles`, `PushPayload` (Task 2).
- Produces:
  - `assignmentPush(a: { matchId: string; home: string; away: string; arena: string; date: string; time: string }): PushPayload` → title `Έχετε οριστεί στις ${date}, ώρα ${time}`, body `${home}-${away}, ${arena}`, url `/matches/${matchId}`.
  - `availabilityPush(a: { matchDayId: string; subject: string; message: string }): PushPayload` → title = subject, body = message, url `/match-days/${matchDayId}`.
  - `assignedProfileIds(assignments: { referee: { profileId: string | null } }[]): string[]` — non-null, deduped.

- [ ] **Step 1: Failing tests** for the three functions with the exact strings above, and `assignedProfileIds([{referee:{profileId:"a"}},{referee:{profileId:null}},{referee:{profileId:"a"}}])` deep-equals `["a"]`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement `lib/push-messages.ts`. In `matches.ts`: change `notifyFederation(subject, message)` to also take `matchDayId` and, after the email, query admin profile ids (`profiles.role = 'admin'`) and `sendPushToProfiles(ids, availabilityPush(...))`, wrapped so failures are swallowed. In `sendAssignmentNotification`, run push in parallel with `sendMailToMany` (`Promise.allSettled` for push), push must not change the existing thrown-error behaviour for failed emails.
- [ ] **Step 4:** `npm test` PASS; `npx tsc --noEmit` clean.
- [ ] **Step 5:** Commit `feat(push): notify referees on assignment and admins on availability`.

### Task 4: Service worker + client prompt + sidebar toggle

**Files:**
- Create: `public/sw.js`, `lib/pwa-state.ts`, `lib/pwa-state.test.ts`, `lib/push-client.ts`, `components/pwa-prompt.tsx`, `components/notifications-toggle.tsx`
- Modify: `app/layout.tsx` (render `<PwaPrompt loggedIn={...} />` — get `loggedIn` via `getCurrentUser()`; layout becomes `async`), `components/dashboard-shell.tsx` (`<NotificationsToggle />` in `SidebarFooter`)

**Interfaces:**
- Consumes: `subscribePush`, `unsubscribePush` (Task 2).
- Produces:
  - `type PwaEnv = { isMobile: boolean; isIos: boolean; isStandalone: boolean; hasInstallPrompt: boolean; pushSupported: boolean; permission: "default" | "granted" | "denied"; subscribed: boolean; loggedIn: boolean; dismissed: boolean }`
  - `type PromptView = "none" | "install-android" | "install-ios" | "enable-notifications"`
  - `decidePrompt(env: PwaEnv): PromptView` — order: dismissed or !isMobile → none; !isStandalone && isIos → install-ios; !isStandalone && hasInstallPrompt → install-android; loggedIn && pushSupported && permission==="default" && !subscribed && (isStandalone || !isIos) → enable-notifications; else none.
  - `lib/push-client.ts`: `registerSw(): Promise<ServiceWorkerRegistration | null>`, `getSubscription(): Promise<PushSubscription | null>`, `enablePush(): Promise<"granted" | "denied" | "unsupported">` (requestPermission → `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` → `subscribePush(sub.toJSON(), navigator.userAgent)`), `disablePush(): Promise<void>`.

- [ ] **Step 1: Failing tests** `lib/pwa-state.test.ts`, one per branch: desktop → none; dismissed → none; iOS Safari not standalone → install-ios (even if loggedIn & permission default); Android with prompt → install-android; standalone iOS, loggedIn, default, not subscribed → enable-notifications; permission denied → none; logged out standalone → none; subscribed → none.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement `decidePrompt`, `public/sw.js` (`push` → `showNotification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/badge-96.png", data: { url } })`; `notificationclick` → close, focus an existing same-origin client and `navigate(url)` else `clients.openWindow(url)`), `push-client.ts`, `PwaPrompt` (fixed bottom card, `lg:hidden`, shadcn Card/Button; captures `beforeinstallprompt`; "Όχι τώρα" sets dismissal 14 days; copy: install-android "Εγκαταστήστε την εφαρμογή στο κινητό σας" + button "Εγκατάσταση"; install-ios "Πατήστε Κοινή χρήση και μετά «Προσθήκη στην οθόνη Αφετηρίας»"; enable "Λάβετε ειδοποιήσεις για τους ορισμούς σας" + button "Ενεργοποίηση ειδοποιήσεων"; sonner toast on result), and `NotificationsToggle` (ghost icon button `Bell`/`BellOff`; hidden when push unsupported; denied → tooltip/toast "Οι ειδοποιήσεις είναι αποκλεισμένες από τις ρυθμίσεις της συσκευής").
- [ ] **Step 4:** `npm test` PASS; `npx tsc --noEmit` clean; `npm run build` succeeds.
- [ ] **Step 5:** Commit `feat(pwa): service worker, install prompt and notifications toggle`.

### Task 5: VAPID keys + end-to-end verification

**Files:** Modify: `.env.local` (not committed)

- [ ] **Step 1:** `npx web-push generate-vapid-keys`; write the three env vars into `.env.local` (`VAPID_SUBJECT=mailto:` + the federation sender address already used in `lib/email.ts`'s `from`, ask user if unclear).
- [ ] **Step 2:** `npx next dev --experimental-https`; in desktop Chrome: DevTools → Application → Manifest shows installable with no errors; Service Worker registered for `/`.
- [ ] **Step 3:** Log in as an admin, enable notifications via sidebar toggle, confirm a `push_subscriptions` row exists; trigger availability change as a referee (or call `sendPushToProfiles` via a one-off `tsx` script) → notification appears; clicking opens `/match-days/{id}`.
- [ ] **Step 4:** Check mobile viewport (375px) for the public header with the new "Έκθεση Κομισαρίου" link and the dashboard top bar; fix overflow if any.
- [ ] **Step 5:** Commit any fixes; report to user the Vercel env vars to add and the real-device test checklist (Android Chrome install + push; iPhone: Add to Home Screen → open → enable → push).
