import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { AssignmentSlot } from "@/components/assignment-slot";
import { MatchDetailActions } from "@/components/match-detail-actions";
import { Card, CardContent } from "@/components/ui/card";
import type { AssignmentRole } from "@/lib/seasons";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const match = await getDb().query.matches.findFirst({
    where: (m, { eq }) => eq(m.id, id),
    with: {
      matchDay: true,
      homeTeam: true,
      awayTeam: true,
      arena: true,
      availableReferees: { with: { referee: true } },
      assignments: { with: { referee: true } },
    },
  });
  if (!match) notFound();

  const assignedRefereeIds = new Set(match.assignments.map((a) => a.refereeId));
  const options = match.availableReferees
    .filter((a) => !assignedRefereeIds.has(a.refereeId))
    .map((a) => ({ id: a.referee.id, name: a.referee.name }));

  const dateLabel = new Date(match.matchDay.date).toLocaleDateString("el-GR");
  const findAssignment = (role: AssignmentRole) =>
    match.assignments.find((a) => a.role === role)?.referee.name ?? null;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/match-days/${match.matchDayId}`} className="text-sm text-primary hover:underline">
          &larr; Πίσω στην Αγωνιστική
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-1 p-4">
          <h1 className="text-lg font-bold">{dateLabel}</h1>
          <p className="text-sm text-muted-foreground">
            {match.homeTeam.name} - {match.awayTeam.name} · Ώρα {match.matchTime} · Γήπεδο {match.arena.name}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AssignmentSlot
          matchId={match.id}
          matchDayId={match.matchDayId}
          role="ref_a"
          label="Διαιτητής Α"
          assignedName={findAssignment("ref_a")}
          options={options}
        />
        <AssignmentSlot
          matchId={match.id}
          matchDayId={match.matchDayId}
          role="ref_b"
          label="Διαιτητής Β"
          assignedName={findAssignment("ref_b")}
          options={options}
        />
        <AssignmentSlot
          matchId={match.id}
          matchDayId={match.matchDayId}
          role="ref_c"
          label="Διαιτητής Γ (προαιρετικό)"
          assignedName={findAssignment("ref_c")}
          options={options}
        />
        <AssignmentSlot
          matchId={match.id}
          matchDayId={match.matchDayId}
          role="commissioner"
          label="Κομισάριος"
          assignedName={findAssignment("commissioner")}
          options={options}
        />
      </div>

      <MatchDetailActions
        matchId={match.id}
        matchDayId={match.matchDayId}
        hasAssignments={match.assignments.length > 0}
      />
    </div>
  );
}
