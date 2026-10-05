import { getParticipationCount } from "@/lib/db/queries";

export async function ParticipationBadge({
  refereeId,
  season,
}: {
  refereeId: string;
  season: { label: string; start: string; end: string };
}) {
  const count = await getParticipationCount(refereeId, season.start, season.end);
  return (
    <span className="text-xs text-accent">
      <strong>Σύνολο Συμμετοχών {season.label}:</strong> {count}
    </span>
  );
}
