"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { matchDays, seasons } from "@/lib/db/schema";
import { requireAdminAction } from "@/lib/auth/session";
import { seasonFromStartYear } from "@/lib/seasons";

const startYearSchema = z.coerce
  .number({ invalid_type_error: "Μη έγκυρο έτος" })
  .int("Μη έγκυρο έτος")
  .min(2000, "Μη έγκυρο έτος")
  .max(2100, "Μη έγκυρο έτος");

/** Season tabs/counters appear on every public referee page, so refresh the whole tree. */
function revalidateSeasonViews() {
  revalidatePath("/", "layout");
}

export async function createSeason(formData: FormData) {
  await requireAdminAction();
  const startYear = startYearSchema.parse(formData.get("startYear"));
  try {
    await getDb().insert(seasons).values({ startYear });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23505") {
      throw new Error(`Η περίοδος ${seasonFromStartYear(startYear).label} υπάρχει ήδη.`);
    }
    throw err;
  }
  revalidateSeasonViews();
}

export async function deleteSeason(id: string) {
  await requireAdminAction();
  const db = getDb();

  const [season] = await db.select().from(seasons).where(eq(seasons.id, id)).limit(1);
  if (!season) return;

  const { start, end, label } = seasonFromStartYear(season.startYear);
  const [days] = await db
    .select({ value: count() })
    .from(matchDays)
    .where(and(gte(matchDays.date, start), lt(matchDays.date, end)));
  if ((days?.value ?? 0) > 0) {
    throw new Error(`Η περίοδος ${label} έχει αγωνιστικές και δεν μπορεί να διαγραφεί.`);
  }

  await db.delete(seasons).where(eq(seasons.id, id));
  revalidateSeasonViews();
}
