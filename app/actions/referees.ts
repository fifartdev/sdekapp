"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { profiles, referees, refereeCategoryEnum } from "@/lib/db/schema";
import { requireAdminAction } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const categoryValues = refereeCategoryEnum.enumValues;

const refereeSchema = z.object({
  name: z.string().trim().min(1, "Το όνομα είναι υποχρεωτικό"),
  email: z.string().trim().email("Μη έγκυρο email"),
  landline: z.string().trim().optional(),
  mobile: z.string().trim().optional(),
  category: z.enum(categoryValues as [string, ...string[]], { message: "Επιλέξτε κατηγορία" }),
  sortIndex: z.coerce.number().int().optional(),
});

export async function createReferee(formData: FormData) {
  await requireAdminAction();

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    throw new Error("Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες");
  }

  const data = refereeSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    landline: formData.get("landline") || undefined,
    mobile: formData.get("mobile") || undefined,
    category: formData.get("category"),
    sortIndex: formData.get("sortIndex") || undefined,
  });

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email: data.email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);

  const db = getDb();
  await db.insert(profiles).values({ id: created.user.id, role: "referee" });
  await db.insert(referees).values({
    profileId: created.user.id,
    name: data.name,
    email: data.email,
    landline: data.landline,
    mobile: data.mobile,
    category: data.category as (typeof categoryValues)[number],
    sortIndex: data.sortIndex,
  });

  revalidatePath("/referees");
  revalidatePath("/komisarioi");
  revalidatePath("/admin/referees");
}

const updateSchema = refereeSchema.extend({
  isActive: z.coerce.boolean(),
});

export async function updateReferee(id: string, formData: FormData) {
  await requireAdminAction();

  const data = updateSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    landline: formData.get("landline") || undefined,
    mobile: formData.get("mobile") || undefined,
    category: formData.get("category"),
    sortIndex: formData.get("sortIndex") || undefined,
    isActive: formData.get("isActive") === "true",
  });

  await getDb()
    .update(referees)
    .set({
      name: data.name,
      email: data.email,
      landline: data.landline,
      mobile: data.mobile,
      category: data.category as (typeof categoryValues)[number],
      sortIndex: data.sortIndex,
      isActive: data.isActive,
    })
    .where(eq(referees.id, id));

  revalidatePath("/referees");
  revalidatePath("/komisarioi");
  revalidatePath(`/referees/${id}`);
  revalidatePath("/admin/referees");
  revalidatePath(`/admin/referees/${id}`);
}
