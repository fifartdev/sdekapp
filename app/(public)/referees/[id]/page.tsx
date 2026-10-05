import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { referees } from "@/lib/db/schema";
import { getMatchesForReferee, getAvailableSeasons } from "@/lib/db/queries";
import { SeasonTabs } from "@/components/season-tabs";

export default async function RefereeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [referee] = await getDb().select().from(referees).where(eq(referees.id, id)).limit(1);
  if (!referee) notFound();

  const availableSeasons = await getAvailableSeasons();
  const seasons = await Promise.all(
    availableSeasons.map(async (season) => ({
      label: season.label,
      matches: await getMatchesForReferee(id, season.start, season.end),
    }))
  );

  const backHref = referee.category === "commissioner" ? "/komisarioi" : "/referees";

  return (
    <div className="space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-primary hover:underline">
          &larr; Πίσω
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Σελίδα Διαιτητή: {referee.name}</h1>
      </div>

      <SeasonTabs seasons={seasons} highlightRefereeId={referee.id} />
    </div>
  );
}
