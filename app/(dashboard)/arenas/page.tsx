import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { arenas } from "@/lib/db/schema";
import { createArena, deleteArena } from "@/app/actions/arenas";
import { SimpleEntityManager } from "@/components/simple-entity-manager";

export default async function ArenasPage() {
  await requireAdmin();
  const allArenas = await getDb().select().from(arenas).orderBy(asc(arenas.name));

  return (
    <SimpleEntityManager
      title="Γήπεδα"
      emptyLabel="Δεν υπάρχουν ακόμα γήπεδα."
      addLabel="Προσθήκη"
      placeholder="Όνομα γηπέδου"
      items={allArenas}
      onCreate={createArena}
      onDelete={deleteArena}
    />
  );
}
