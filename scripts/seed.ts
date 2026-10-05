import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@thetailor.gr";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString("base64url");

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
  const db = drizzle(sql, { schema });

  let userId: string;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (createErr) {
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email === ADMIN_EMAIL);
    if (!existing) throw createErr;
    userId = existing.id;
    console.log(`User ${ADMIN_EMAIL} already exists, reusing id ${userId}`);
    console.log(`(password unchanged - not resetting an existing user's password)`);
  } else {
    userId = created.user.id;
    console.log(`Created auth user ${ADMIN_EMAIL} (${userId})`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`(save this now - it will not be shown again)`);
  }

  await db
    .insert(schema.profiles)
    .values({ id: userId, role: "admin" })
    .onConflictDoUpdate({ target: schema.profiles.id, set: { role: "admin" } });

  console.log(`Profile upserted with role=admin for ${ADMIN_EMAIL}`);

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
