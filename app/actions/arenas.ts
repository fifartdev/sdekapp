"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { arenas } from "@/lib/db/schema";
import { requireAdminAction } from "@/lib/auth/session";

const nameSchema = z.string().trim().min(1, "Το όνομα είναι υποχρεωτικό");

export async function createArena(formData: FormData) {
  await requireAdminAction();
  const name = nameSchema.parse(formData.get("name"));
  await getDb().insert(arenas).values({ name });
  revalidatePath("/arenas");
}

export async function deleteArena(id: string) {
  await requireAdminAction();
  try {
    await getDb().delete(arenas).where(eq(arenas.id, id));
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23503") {
      throw new Error("Το γήπεδο χρησιμοποιείται σε αγώνες και δεν μπορεί να διαγραφεί.");
    }
    throw err;
  }
  revalidatePath("/arenas");
}
