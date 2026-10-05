"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { teams } from "@/lib/db/schema";
import { requireAdminAction } from "@/lib/auth/session";

const nameSchema = z.string().trim().min(1, "Το όνομα είναι υποχρεωτικό");

export async function createTeam(formData: FormData) {
  await requireAdminAction();
  const name = nameSchema.parse(formData.get("name"));
  await getDb().insert(teams).values({ name });
  revalidatePath("/teams");
}

export async function deleteTeam(id: string) {
  await requireAdminAction();
  try {
    await getDb().delete(teams).where(eq(teams.id, id));
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23503") {
      throw new Error("Η ομάδα συμμετέχει σε αγώνες και δεν μπορεί να διαγραφεί.");
    }
    throw err;
  }
  revalidatePath("/teams");
}
