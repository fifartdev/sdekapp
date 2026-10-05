import Link from "next/link";
import { CalendarDays, Users, Building2, ShieldAlert, ArrowRight, ClipboardList } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getDashboardOverview, getMatchesForReferee } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { StaggerList } from "@/components/stagger-list";

export default async function DashboardPage() {
  const user = await requireUser();
  const overview = await getDashboardOverview();

  const myUpcoming =
    user.role !== "admin" && user.referee
      ? (
          await getMatchesForReferee(
            user.referee.id,
            new Date().toISOString().slice(0, 10),
            "2100-01-01"
          )
        ).slice(0, 5)
      : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Γεια σου, {user.referee?.name ?? (user.role === "admin" ? "Διαχειριστή" : "")}
        </h1>
        <p className="text-sm text-muted-foreground">Επισκόπηση ΚΕΔ ΟΣΕΚΑ</p>
      </div>

      {user.role === "admin" ? (
        <StaggerList className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} label="Ενεργοί Διαιτητές" value={overview.refereeCount} href="/admin/referees" />
          <StatCard icon={Users} label="Ομάδες" value={overview.teamCount} href="/teams" />
          <StatCard icon={Building2} label="Γήπεδα" value={overview.arenaCount} href="/arenas" />
        </StaggerList>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" />
              Επερχόμενες Αγωνιστικές
            </CardTitle>
            <Link href="/match-days" className="text-xs text-primary hover:underline">
              Όλες <ArrowRight className="inline h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview.upcomingDays.length === 0 ? (
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν προσεχείς αγωνιστικές.</p>
            ) : (
              overview.upcomingDays.map((d) => (
                <Link
                  key={d.id}
                  href={`/match-days/${d.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm transition-colors hover:bg-secondary/50"
                >
                  <span>
                    {new Date(d.date).toLocaleDateString("el-GR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <Badge variant="secondary">{d.matches.length} αγώνες</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {user.role === "admin" ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                Χρειάζονται Ορισμό
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overview.matchesNeedingAttention.length === 0 ? (
                <p className="text-sm text-muted-foreground">Όλοι οι επερχόμενοι αγώνες έχουν πλήρεις ορισμούς.</p>
              ) : (
                overview.matchesNeedingAttention.map((m) => (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="flex items-center justify-between rounded-md border border-border p-3 text-sm transition-colors hover:bg-secondary/50"
                  >
                    <span>
                      {m.homeTeam.name} - {m.awayTeam.name}
                    </span>
                    <Badge variant="destructive">{m.requiredFilled}/3</Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4 text-primary" />
                Οι Επόμενοι Ορισμοί μου
              </CardTitle>
              <Link href="/my-assignments" className="text-xs text-primary hover:underline">
                Όλοι <ArrowRight className="inline h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {myUpcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Δεν έχετε προσεχείς ορισμούς.</p>
              ) : (
                myUpcoming.map((m) => (
                  <div key={m.id} className="rounded-md border border-border p-3 text-sm">
                    <div className="font-medium">
                      {m.homeTeam.name} - {m.awayTeam.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(m.matchDay.date).toLocaleDateString("el-GR")} · {m.matchTime} · {m.arena.name}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
