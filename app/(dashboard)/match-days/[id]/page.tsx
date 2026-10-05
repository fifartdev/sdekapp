import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { matchDays, teams, arenas } from "@/lib/db/schema";
import { CreateMatchForm } from "@/components/create-match-form";
import { MatchAvailabilityToggle } from "@/components/match-availability-toggle";
import { WholeDayOptOut } from "@/components/whole-day-opt-out";
import { Card, CardContent } from "@/components/ui/card";

export default async function MatchDayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const db = getDb();

  const [day] = await db.select().from(matchDays).where(eq(matchDays.id, id)).limit(1);
  if (!day) notFound();

  const dayMatches = await db.query.matches.findMany({
    where: (m, { eq: eq2 }) => eq2(m.matchDayId, id),
    orderBy: (m, { asc: asc2 }) => asc2(m.matchTime),
    with: {
      homeTeam: true,
      awayTeam: true,
      arena: true,
      availableReferees: true,
    },
  });

  const usedTeamIds = new Set(dayMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]));
  const [allTeams, allArenas] = await Promise.all([
    db.select().from(teams).orderBy(asc(teams.name)),
    db.select().from(arenas).orderBy(asc(arenas.name)),
  ]);
  const availableTeams = allTeams.filter((t) => !usedTeamIds.has(t.id));

  const daysUntil = Math.ceil((new Date(day.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const availabilityLocked = daysUntil < 1;

  const dateLabel = new Date(day.date).toLocaleDateString("el-GR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const refereeId = user.referee?.id;
  const isAvailableAnywhere =
    refereeId && dayMatches.some((m) => m.availableReferees.some((a) => a.refereeId === refereeId));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Ημερομηνία: {dateLabel}
        {user.referee ? ` - Γεία σου ${user.referee.name}` : null}
      </h1>

      {user.role !== "admin" && isAvailableAnywhere && !availabilityLocked ? (
        <WholeDayOptOut matchDayId={id} />
      ) : null}

      {user.role === "admin" ? <CreateMatchForm matchDayId={id} availableTeams={availableTeams} arenas={allArenas} /> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Όλοι οι Αγώνες της ημέρας</h2>

        {dayMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Δεν έχουν προστεθεί ακόμα αγώνες.</p>
        ) : (
          <ul className="grid gap-3">
            {dayMatches.map((m) => {
              const isAvailable = refereeId
                ? m.availableReferees.some((a) => a.refereeId === refereeId)
                : false;
              return (
                <li key={m.id}>
                  <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="space-y-1">
                        <div className="font-bold">
                          {m.homeTeam.name} - {m.awayTeam.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ώρα {m.matchTime} · Γήπεδο {m.arena.name}
                        </div>
                        {user.role !== "admin" ? (
                          <MatchAvailabilityToggle
                            matchId={m.id}
                            matchDayId={id}
                            isAvailable={isAvailable}
                            disabled={availabilityLocked}
                          />
                        ) : null}
                      </div>
                      {user.role === "admin" ? (
                        <Link
                          href={`/matches/${m.id}`}
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Περισσότερα
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
