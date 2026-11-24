"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import { requireUserAction } from "@/lib/auth/session";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

/** Stores (or re-assigns to the current user) this device's push subscription. */
export async function subscribePush(sub: unknown, userAgent?: string): Promise<void> {
  const user = await requireUserAction();
  const { endpoint, keys } = subscriptionSchema.parse(sub);
  const values = {
    profileId: user.id,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent: userAgent?.slice(0, 500) ?? null,
  };
  await getDb()
    .insert(pushSubscriptions)
    .values(values)
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: values });
}

/** Removes this device's subscription, only if it belongs to the current user. */
export async function unsubscribePush(endpoint: string): Promise<void> {
  const user = await requireUserAction();
  await getDb()
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.profileId, user.id)));
}
