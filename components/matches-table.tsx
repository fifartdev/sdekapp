import { cn } from "@/lib/utils";
import type { AssignmentRole } from "@/lib/seasons";

export type MatchRow = {
  id: string;
  matchTime: string;
  matchDay: { date: string };
  homeTeam: { name: string };
  awayTeam: { name: string };
  arena: { name: string };
  assignments: { role: AssignmentRole; referee: { id: string; name: string } }[];
};

function assigneeName(match: MatchRow, role: AssignmentRole) {
  return match.assignments.find((a) => a.role === role)?.referee.name ?? null;
}

export function MatchesTable({
  matches,
  highlightRefereeId,
}: {
  matches: MatchRow[];
  highlightRefereeId?: string;
}) {
  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground">Δεν βρέθηκαν αγώνες.</p>;
  }

  // The 3rd referee is optional, so only show its column when at least one listed match has one.
  const showRefC = matches.some((m) => m.assignments.some((a) => a.role === "ref_c"));

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full divide-y divide-border bg-card text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold text-muted-foreground">
            <th className="px-3 py-2">Ημ/νία</th>
            <th className="px-3 py-2">Ώρα</th>
            <th className="px-3 py-2">Γήπεδο</th>
            <th className="px-3 py-2">Ομάδες</th>
            <th className="px-3 py-2">Διαιτητής Α</th>
            <th className="px-3 py-2">Διαιτητής Β</th>
            {showRefC ? <th className="px-3 py-2">Διαιτητής Γ</th> : null}
            <th className="px-3 py-2">Κομισάριος</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {matches.map((m) => {
            const refA = match_(m, "ref_a");
            const refB = match_(m, "ref_b");
            const commissioner = match_(m, "commissioner");
            return (
              <tr key={m.id} className="transition-colors hover:bg-secondary/50">
                <td className="whitespace-nowrap px-3 py-2">
                  {new Date(m.matchDay.date).toLocaleDateString("el-GR")}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{m.matchTime}</td>
                <td className="whitespace-nowrap px-3 py-2">{m.arena.name}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {m.homeTeam.name} - {m.awayTeam.name}
                </td>
                <Cell value={refA} highlight={highlightRefereeId} match={m} role="ref_a" />
                <Cell value={refB} highlight={highlightRefereeId} match={m} role="ref_b" />
                {showRefC ? (
                  <Cell value={match_(m, "ref_c")} highlight={highlightRefereeId} match={m} role="ref_c" />
                ) : null}
                <Cell value={commissioner} highlight={highlightRefereeId} match={m} role="commissioner" />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function match_(m: MatchRow, role: AssignmentRole) {
  return assigneeName(m, role);
}

function Cell({
  value,
  match,
  role,
  highlight,
}: {
  value: string | null;
  match: MatchRow;
  role: AssignmentRole;
  highlight?: string;
}) {
  const isHighlighted = highlight && match.assignments.some((a) => a.role === role && a.referee.id === highlight);
  return (
    <td className={cn("whitespace-nowrap px-3 py-2", isHighlighted && "font-bold text-destructive")}>
      {value ?? "—"}
    </td>
  );
}
