import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { referees as refereesTable } from "@/lib/db/schema";
import { getAvailableSeasons } from "@/lib/db/queries";
import { RefereeDirectory } from "@/components/referee-directory";

export default async function KomisarioiPage() {
  const [all, seasons] = await Promise.all([
    getDb()
      .select()
      .from(refereesTable)
      .orderBy(asc(refereesTable.sortIndex), asc(refereesTable.name)),
    getAvailableSeasons(),
  ]);

  return (
    <RefereeDirectory
      title="«ΙΣΤΟΡΙΚΟ ΟΡΙΣΜΩΝ ΚΟΜΙΣΑΡΙΩΝ»"
      categories={["commissioner"]}
      referees={all}
      seasons={seasons}
    />
  );
}
