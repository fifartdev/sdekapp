import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { referees as refereesTable } from "@/lib/db/schema";
import { getAvailableSeasons } from "@/lib/db/queries";
import { RefereeDirectory } from "@/components/referee-directory";

export default async function RefereesPage() {
  const [all, seasons] = await Promise.all([
    getDb()
      .select()
      .from(refereesTable)
      .orderBy(asc(refereesTable.sortIndex), asc(refereesTable.name)),
    getAvailableSeasons(),
  ]);

  return (
    <RefereeDirectory
      title="«ΙΣΤΟΡΙΚΟ ΟΡΙΣΜΩΝ ΔΙΑΙΤΗΤΩΝ»"
      categories={["international", "cat_a", "cat_b", "cat_c"]}
      referees={all}
      seasons={seasons}
    />
  );
}
