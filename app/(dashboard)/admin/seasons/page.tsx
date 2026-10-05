import { requireAdmin } from "@/lib/auth/session";
import { getSeasonsOverview } from "@/lib/db/queries";
import { SeasonManager } from "@/components/season-manager";

export default async function SeasonsPage() {
  await requireAdmin();
  const seasons = await getSeasonsOverview();
  const nextStartYear = (seasons[0]?.startYear ?? new Date().getFullYear() - 1) + 1;

  return <SeasonManager seasons={seasons} nextStartYear={nextStartYear} />;
}
