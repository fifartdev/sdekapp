import "server-only";
import { and, gte, lt, eq, count } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { matches, matchDays, matchAssignments, referees, teams, arenas, seasons } from "@/lib/db/schema";
import { REQUIRED_ASSIGNMENT_ROLES, seasonFromStartYear, seasonStartYear, seasonsSpanning } from "@/lib/seasons";

/** Top-line counts + upcoming match days for the dashboard home page. */
export async function getDashboardOverview() {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [[refereeCount], [teamCount], [arenaCount], upcomingDays] = await Promise.all([
    db.select({ value: count() }).from(referees).where(eq(referees.isActive, true)),
    db.select({ value: count() }).from(teams),
    db.select({ value: count() }).from(arenas),
    db.query.matchDays.findMany({
      where: (d, { gte: gte2 }) => gte2(d.date, today),
      orderBy: (d, { asc }) => asc(d.date),
      limit: 5,
      with: {
        matches: {
          with: { homeTeam: true, awayTeam: true, assignments: true },
        },
      },
    }),
  ]);

  const matchesNeedingAttention = upcomingDays
    .flatMap((d) => d.matches.map((m) => ({ ...m, date: d.date })))
    .map((m) => ({
      ...m,
      requiredFilled: REQUIRED_ASSIGNMENT_ROLES.filter((role) => m.assignments.some((a) => a.role === role)).length,
    }))
    .filter((m) => m.requiredFilled < REQUIRED_ASSIGNMENT_ROLES.length);

  return {
    refereeCount: refereeCount?.value ?? 0,
    teamCount: teamCount?.value ?? 0,
    arenaCount: arenaCount?.value ?? 0,
    upcomingDays,
    matchesNeedingAttention,
  };
}

/** Every season (newest first) that has a match day or was explicitly created by an admin - drives the season tabs. */
export async function getAvailableSeasons() {
  const db = getDb();
  const [dayRows, seasonRows] = await Promise.all([
    db.selectDistinct({ date: matchDays.date }).from(matchDays),
    db.select({ startYear: seasons.startYear }).from(seasons),
  ]);
  return seasonsSpanning(
    dayRows.map((r) => r.date),
    seasonRows.map((r) => r.startYear)
  );
}

/** Seasons for the admin page: every visible season, with its match-day count and the created row (if any). */
export async function getSeasonsOverview() {
  const db = getDb();
  const [dayRows, seasonRows] = await Promise.all([
    db.select({ date: matchDays.date }).from(matchDays),
    db.select().from(seasons),
  ]);

  const dayCounts = new Map<number, number>();
  for (const { date } of dayRows) {
    const year = seasonStartYear(date);
    dayCounts.set(year, (dayCounts.get(year) ?? 0) + 1);
  }

  return seasonsSpanning(
    dayRows.map((r) => r.date),
    seasonRows.map((r) => r.startYear)
  ).map((season) => {
    const startYear = Number(season.start.slice(0, 4));
    return {
      ...seasonFromStartYear(startYear),
      startYear,
      matchDayCount: dayCounts.get(startYear) ?? 0,
      createdId: seasonRows.find((r) => r.startYear === startYear)?.id ?? null,
    };
  });
}

/** All matches a referee is involved in (any role) within a date range, newest first — for the season history tabs. */
export async function getMatchesForReferee(refereeId: string, start: string, end: string) {
  const db = getDb();

  const assignedMatchIds = db
    .selectDistinct({ matchId: matchAssignments.matchId })
    .from(matchAssignments)
    .where(eq(matchAssignments.refereeId, refereeId));

  const rows = await db.query.matches.findMany({
    where: (m, { inArray }) => inArray(m.id, assignedMatchIds),
    with: {
      matchDay: true,
      homeTeam: true,
      awayTeam: true,
      arena: true,
      assignments: { with: { referee: true } },
    },
  });

  return rows
    .filter((m) => m.matchDay.date >= start && m.matchDay.date < end)
    .sort((a, b) => (a.matchDay.date < b.matchDay.date ? -1 : 1));
}

/** How many matches a referee was assigned to (any role) within a date range - for the participation counter. */
export async function getParticipationCount(refereeId: string, start: string, end: string) {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(matchAssignments)
    .innerJoin(matches, eq(matchAssignments.matchId, matches.id))
    .innerJoin(matchDays, eq(matches.matchDayId, matchDays.id))
    .where(
      and(
        eq(matchAssignments.refereeId, refereeId),
        gte(matchDays.date, start),
        lt(matchDays.date, end)
      )
    );
  return row?.value ?? 0;
}
