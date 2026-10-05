import "server-only";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { profiles, referees, type refereeCategoryEnum } from "@/lib/db/schema";

export type CurrentUser = {
  id: string;
  email: string | undefined;
  role: "admin" | "referee";
  referee: typeof referees.$inferSelect | null;
};

/** Reads the current session from Supabase Auth and joins the app-level profile/referee row. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const db = getDb();
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (!profile) return null;

  const [referee] = await db
    .select()
    .from(referees)
    .where(eq(referees.profileId, profile.id))
    .limit(1);

  return {
    id: user.id,
    email: user.email,
    role: profile.role,
    referee: referee ?? null,
  };
}

/** For Server Components/pages: redirects unauthenticated visitors to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

/** For Server Components/pages: redirects non-admins away from admin-only routes. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

/**
 * For Server Actions: throws instead of redirecting, so the caller can show
 * a toast/error state rather than silently navigating the user away mid-mutation.
 */
export async function requireAdminAction(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "admin") throw new Error("Admins only");
  return user;
}

export async function requireUserAction(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}
