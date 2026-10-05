import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { teams } from "@/lib/db/schema";
import { createTeam, deleteTeam } from "@/app/actions/teams";
import { SimpleEntityManager } from "@/components/simple-entity-manager";

export default async function TeamsPage() {
  await requireAdmin();
  const allTeams = await getDb().select().from(teams).orderBy(asc(teams.name));

  return (
    <SimpleEntityManager
      title="Ομάδες"
      emptyLabel="Δεν υπάρχουν ακόμα ομάδες."
      addLabel="Προσθήκη"
      placeholder="Όνομα ομάδας"
      items={allTeams}
      onCreate={createTeam}
      onDelete={deleteTeam}
    />
  );
}
