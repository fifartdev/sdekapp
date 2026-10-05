/**
 * One-off migration: Appwrite (refs, teams, arenas, dates, matches) -> Supabase Postgres.
 *
 * Requires APPWRITE_API_KEY in .env.local (a server API key with read access to the
 * ODKE_DB database - create one in the Appwrite console under Project Settings > API Keys).
 *
 * Run a dry run first (default) to see counts and any unresolved references before
 * touching real data:
 *
 *   npm run migrate:appwrite -- --dry-run
 *   npm run migrate:appwrite -- --commit
 *
 * Notes on the source data model (see app/utils/appwrite.js in git history):
 * - `matches.availablereferees` stores Appwrite Account user_ids (refs.user_id), not ref
 *   document $ids - resolved via a userId -> new referee.id map.
 * - `matches.refA` / `refB` / `komisario` / `referees[]` store the referee's NAME as a
 *   plain string (the very bug this rewrite fixes) - resolved via a name -> referee.id map.
 *   If two referees ever shared a name, this resolves to whichever the map saw last; there
 *   is no way to recover the original distinction from the source data, so verify manually
 *   before committing if that's a possibility.
 */
import { Client, Databases, Query } from "node-appwrite";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import * as schema from "../lib/db/schema";

const COMMIT = process.argv.includes("--commit");

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  NEXT_PUBLIC_APPWRITE_DATABASE_ODKE_DB: DB_ID,
  NEXT_PUBLIC_APPWRITE_COL_REFS: COL_REFS,
  NEXT_PUBLIC_APPWRITE_COL_TEAMS: COL_TEAMS,
  NEXT_PUBLIC_APPWRITE_COL_MATCHES: COL_MATCHES,
  NEXT_PUBLIC_APPWRITE_COL_DATES: COL_DATES,
  NEXT_PUBLIC_APPWRITE_COL_ARENAS: COL_ARENAS,
  APPWRITE_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL,
} = process.env;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const CATEGORY_MAP: Record<string, (typeof schema.refereeCategoryEnum.enumValues)[number]> = {
  ΔΙΕΘΝΗΣ: "international",
  "Α ΚΑΤΗΓΟΡΙΑ": "cat_a",
  "Β ΚΑΤΗΓΟΡΙΑ": "cat_b",
  "Γ ΚΑΤΗΓΟΡΙΑ": "cat_c",
  ΚΟΜΙΣΑΡΙΟΣ: "commissioner",
  // Legacy value seen in the source data but absent from the current add-referee form -
  // mapped to commissioner as the closest equivalent; re-categorize manually if wrong.
  ΔΟΚΙΜΟΣ: "commissioner",
};

async function listAll<T>(databases: Databases, dbId: string, colId: string): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | undefined;
  for (;;) {
    const queries = [Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await databases.listDocuments(dbId, colId, queries);
    all.push(...(res.documents as T[]));
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1]!.$id;
  }
  return all;
}

type AppwriteRef = {
  $id: string;
  user_id: string;
  name: string;
  email: string;
  index?: number;
  landline?: string;
  mobile?: string;
  category: string;
  inactive: boolean;
};
type AppwriteTeam = { $id: string; name: string };
type AppwriteArena = { $id: string; name: string };
type AppwriteDate = { $id: string; date: string };
type AppwriteMatch = {
  $id: string;
  date_id: string;
  teams: { $id: string; name: string }[];
  arena: string;
  matchtime: string;
  fulldate: string;
  availablereferees: string[];
  refA: string | null;
  refB: string | null;
  komisario: string | null;
};

async function main() {
  console.log(COMMIT ? "Running in COMMIT mode - writes real data." : "Running in DRY RUN mode (pass --commit to write).");

  const client = new Client()
    .setEndpoint(requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT", NEXT_PUBLIC_APPWRITE_ENDPOINT))
    .setProject(requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT", NEXT_PUBLIC_APPWRITE_PROJECT))
    .setKey(requireEnv("APPWRITE_API_KEY", APPWRITE_API_KEY));
  const databases = new Databases(client);
  const dbId = requireEnv("NEXT_PUBLIC_APPWRITE_DATABASE_ODKE_DB", DB_ID);

  console.log("Fetching Appwrite collections...");
  const [awRefs, awTeams, awArenas, awDates, awMatches] = await Promise.all([
    listAll<AppwriteRef>(databases, dbId, requireEnv("NEXT_PUBLIC_APPWRITE_COL_REFS", COL_REFS)),
    listAll<AppwriteTeam>(databases, dbId, requireEnv("NEXT_PUBLIC_APPWRITE_COL_TEAMS", COL_TEAMS)),
    listAll<AppwriteArena>(databases, dbId, requireEnv("NEXT_PUBLIC_APPWRITE_COL_ARENAS", COL_ARENAS)),
    listAll<AppwriteDate>(databases, dbId, requireEnv("NEXT_PUBLIC_APPWRITE_COL_DATES", COL_DATES)),
    listAll<AppwriteMatch>(databases, dbId, requireEnv("NEXT_PUBLIC_APPWRITE_COL_MATCHES", COL_MATCHES)),
  ]);
  console.log(
    `Fetched: ${awRefs.length} refs, ${awTeams.length} teams, ${awArenas.length} arenas, ${awDates.length} dates, ${awMatches.length} matches`
  );

  const sql = postgres(requireEnv("DATABASE_URL", DATABASE_URL), { prepare: false });
  const db = drizzle(sql, { schema });
  const supabaseAdmin = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", NEXT_PUBLIC_SUPABASE_URL),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // --- Teams ---
  const teamIdMap = new Map<string, string>(); // appwrite $id -> new uuid
  for (const t of awTeams) {
    if (COMMIT) {
      const [row] = await db.insert(schema.teams).values({ name: t.name }).returning();
      teamIdMap.set(t.$id, row!.id);
    } else {
      teamIdMap.set(t.$id, `dry-run-${t.$id}`);
    }
  }
  console.log(`Teams: ${teamIdMap.size}`);

  // --- Arenas (dedupe by name, since matches reference arenas by name string) ---
  const arenaIdByName = new Map<string, string>();
  const arenaNames = new Set([...awArenas.map((a) => a.name), ...awMatches.map((m) => m.arena).filter(Boolean)]);
  for (const name of arenaNames) {
    if (COMMIT) {
      const [row] = await db.insert(schema.arenas).values({ name }).returning();
      arenaIdByName.set(name, row!.id);
    } else {
      arenaIdByName.set(name, `dry-run-${name}`);
    }
  }
  console.log(`Arenas: ${arenaIdByName.size}`);

  // --- Referees (+ Supabase Auth user + profile) ---
  const refereeIdByAppwriteUserId = new Map<string, string>(); // refs.user_id -> new referee.id
  const refereeIdByName = new Map<string, string>(); // refs.name -> new referee.id (last write wins on collision)
  const skippedRefs: string[] = [];

  for (const r of awRefs) {
    const category = CATEGORY_MAP[r.category];
    if (!category) {
      skippedRefs.push(`${r.name} (unknown category "${r.category}")`);
      continue;
    }

    if (!COMMIT) {
      refereeIdByAppwriteUserId.set(r.user_id, `dry-run-${r.$id}`);
      refereeIdByName.set(r.name, `dry-run-${r.$id}`);
      continue;
    }

    // Appwrite passwords can't be carried over - create the Supabase user with a random
    // password and expect referees to use "forgot password" to set their own.
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: r.email,
      password: `${crypto.randomUUID()}Aa1!`,
      email_confirm: true,
    });
    if (error || !created.user) {
      skippedRefs.push(`${r.name} (auth create failed: ${error?.message})`);
      continue;
    }

    await db.insert(schema.profiles).values({ id: created.user.id, role: "referee" });
    const [row] = await db
      .insert(schema.referees)
      .values({
        profileId: created.user.id,
        name: r.name,
        email: r.email,
        landline: r.landline || null,
        mobile: r.mobile || null,
        sortIndex: r.index ?? null,
        category,
        isActive: !r.inactive,
      })
      .returning();

    refereeIdByAppwriteUserId.set(r.user_id, row!.id);
    refereeIdByName.set(r.name, row!.id);
  }
  console.log(`Referees: ${refereeIdByName.size}, skipped: ${skippedRefs.length}`);
  if (skippedRefs.length) console.log("Skipped referees:\n" + skippedRefs.map((s) => `  - ${s}`).join("\n"));

  // --- Match days ---
  const matchDayIdMap = new Map<string, string>();
  for (const d of awDates) {
    const dateOnly = d.date.slice(0, 10);
    if (COMMIT) {
      const [row] = await db.insert(schema.matchDays).values({ date: dateOnly }).returning();
      matchDayIdMap.set(d.$id, row!.id);
    } else {
      matchDayIdMap.set(d.$id, `dry-run-${d.$id}`);
    }
  }
  console.log(`Match days: ${matchDayIdMap.size}`);

  // --- Matches (+ available referees + assignments) ---
  let matchesCreated = 0;
  let assignmentsCreated = 0;
  let availabilityCreated = 0;
  const unresolved: string[] = [];

  for (const m of awMatches) {
    const matchDayId = matchDayIdMap.get(m.date_id);
    const homeTeamId = m.teams?.[0] ? teamIdMap.get(m.teams[0].$id) : undefined;
    const awayTeamId = m.teams?.[1] ? teamIdMap.get(m.teams[1].$id) : undefined;
    const arenaId = arenaIdByName.get(m.arena);

    if (!matchDayId || !homeTeamId || !awayTeamId || !arenaId) {
      unresolved.push(`Match ${m.$id}: missing matchDay/team/arena reference, skipped`);
      continue;
    }

    let matchId: string;
    if (COMMIT) {
      const [row] = await db
        .insert(schema.matches)
        .values({ matchDayId, homeTeamId, awayTeamId, arenaId, matchTime: m.matchtime })
        .returning();
      matchId = row!.id;
    } else {
      matchId = `dry-run-${m.$id}`;
    }
    matchesCreated++;

    for (const userId of m.availablereferees ?? []) {
      const refereeId = refereeIdByAppwriteUserId.get(userId);
      if (!refereeId) {
        unresolved.push(`Match ${m.$id}: available referee userId ${userId} not found`);
        continue;
      }
      if (COMMIT) {
        await db.insert(schema.matchAvailableReferees).values({ matchId, refereeId }).onConflictDoNothing();
      }
      availabilityCreated++;
    }

    const roleAssignments: [string | null, (typeof schema.assignmentRoleEnum.enumValues)[number]][] = [
      [m.refA, "ref_a"],
      [m.refB, "ref_b"],
      [m.komisario, "commissioner"],
    ];
    for (const [name, role] of roleAssignments) {
      if (!name) continue;
      const refereeId = refereeIdByName.get(name);
      if (!refereeId) {
        unresolved.push(`Match ${m.$id}: assignment name "${name}" (${role}) not found`);
        continue;
      }
      if (COMMIT) {
        await db.insert(schema.matchAssignments).values({ matchId, refereeId, role }).onConflictDoNothing();
      }
      assignmentsCreated++;
    }
  }

  console.log(`Matches: ${matchesCreated}, assignments: ${assignmentsCreated}, availability rows: ${availabilityCreated}`);
  if (unresolved.length) console.log("Unresolved references:\n" + unresolved.map((s) => `  - ${s}`).join("\n"));

  await sql.end();
  console.log(COMMIT ? "Done." : "Dry run complete - re-run with --commit to write.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
