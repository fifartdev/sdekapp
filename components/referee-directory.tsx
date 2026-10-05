import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/seasons";
import type { Season } from "@/lib/seasons";
import { ParticipationBadge } from "@/components/participation-badge";
import { Card, CardContent } from "@/components/ui/card";

type Referee = {
  id: string;
  name: string;
  category: keyof typeof CATEGORY_LABELS;
  isActive: boolean;
};

export function RefereeDirectory({
  title,
  categories,
  referees,
  seasons,
}: {
  title: string;
  categories: (keyof typeof CATEGORY_LABELS)[];
  referees: Referee[];
  seasons: Season[];
}) {
  const active = referees.filter((r) => r.isActive);
  const inactive = referees.filter((r) => !r.isActive);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{title}</h1>

      {categories.map((cat) => {
        const group = active.filter((r) => r.category === cat);
        if (group.length === 0) return null;
        return (
          <section key={cat} className="space-y-3">
            {categories.length > 1 ? <h2 className="text-lg font-bold">{CATEGORY_LABELS[cat]}</h2> : null}
            <ul className="grid gap-3">
              {group.map((r, i) => (
                <li key={r.id}>
                  <Card>
                    <CardContent className="flex flex-col gap-1 p-4">
                      <Link href={`/referees/${r.id}`} className="font-bold text-destructive hover:underline">
                        {i + 1}. {r.name}
                      </Link>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {seasons.map((season) => (
                          <ParticipationBadge key={season.label} refereeId={r.id} season={season} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {inactive.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">ΑΡΧΕΙΟ ΠΡΩΗΝ ΔΙΑΙΤΗΤΩΝ</h2>
          {categories.map((cat) => {
            const group = inactive.filter((r) => r.category === cat);
            if (group.length === 0) return null;
            return (
              <div key={cat} className="space-y-2">
                {categories.length > 1 ? (
                  <h3 className="text-base font-semibold text-muted-foreground">{CATEGORY_LABELS[cat]}</h3>
                ) : null}
                <ul className="grid gap-2">
                  {group.map((r, i) => (
                    <li key={r.id}>
                      <Link href={`/referees/${r.id}`} className="text-sm hover:underline">
                        {i + 1}. {r.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}
