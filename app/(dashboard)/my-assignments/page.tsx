import { requireUser } from "@/lib/auth/session";
import { getMatchesForReferee } from "@/lib/db/queries";
import { MatchesTable } from "@/components/matches-table";

export default async function MyAssignmentsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Σελίδα Χρήστη</h1>
        {user.referee ? <p className="text-lg font-semibold">Προφίλ {user.referee.name}</p> : null}
      </div>

      {user.referee ? (
        <MatchesTable
          matches={await getMatchesForReferee(user.referee.id, "1900-01-01", "2100-01-01")}
          highlightRefereeId={user.referee.id}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          {user.role === "admin"
            ? "Οι διαχειριστές δεν έχουν προσωπικούς ορισμούς."
            : "Δεν βρέθηκε προφίλ διαιτητή."}
        </p>
      )}
    </div>
  );
}
