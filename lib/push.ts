import webpush from "web-push";
import { inArray } from "drizzle-orm";

export type PushPayload = { title: string; body: string; url: string };

/** Push services answer 404/410 when a subscription has expired or been revoked. */
export function isGoneStatus(statusCode: number | undefined): boolean {
  return statusCode === 404 || statusCode === 410;
}

const PUSH_HOST_SUFFIXES = [
  "fcm.googleapis.com", // Chrome / Android / Edge (Chromium)
  ".push.apple.com", // Safari / iOS
  "updates.push.services.mozilla.com", // Firefox
  ".notify.windows.com", // legacy Edge / Windows
];

/** Only real browser push services: we POST to this URL server-side, so never accept arbitrary hosts. */
export function isAllowedPushEndpoint(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return PUSH_HOST_SUFFIXES.some((s) => (s.startsWith(".") ? url.hostname.endsWith(s) : url.hostname === s));
}

let configured: boolean | null = null;

function configure(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  configured = Boolean(publicKey && privateKey && subject);
  if (configured) webpush.setVapidDetails(subject!, publicKey!, privateKey!);
  return configured;
}

/**
 * Best-effort: sends to every device of the given profiles. Never throws; expired
 * subscriptions are removed. No-op when VAPID env vars are missing.
 */
export async function sendPushToProfiles(profileIds: string[], payload: PushPayload): Promise<void> {
  try {
    const ids = [...new Set(profileIds)];
    if (ids.length === 0 || !configure()) return;

    const { getDb } = await import("@/lib/db/client");
    const { pushSubscriptions } = await import("@/lib/db/schema");
    const db = getDb();
    const subs = await db.select().from(pushSubscriptions).where(inArray(pushSubscriptions.profileId, ids));
    if (subs.length === 0) return;

    const body = JSON.stringify(payload);
    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, {
          TTL: 60 * 60 * 24,
          timeout: 8000, // web-push has no default socket timeout; never let a push stall an action
        })
      )
    );

    const gone: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") return;
      const status = (r.reason as { statusCode?: number })?.statusCode;
      if (isGoneStatus(status)) gone.push(subs[i]!.endpoint);
      else console.error("[push] send failed", status, r.reason);
    });
    if (gone.length > 0) {
      await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, gone));
    }
  } catch (err) {
    console.error("[push] sendPushToProfiles failed", err);
  }
}
