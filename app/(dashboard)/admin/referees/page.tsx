import Link from "next/link";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { referees as refereesTable } from "@/lib/db/schema";
import { CATEGORY_LABELS } from "@/lib/seasons";
import { RefereeCreateForm } from "@/components/referee-create-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminRefereesPage() {
  await requireAdmin();
  const all = await getDb()
    .select()
    .from(refereesTable)
    .orderBy(asc(refereesTable.sortIndex), asc(refereesTable.name));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Διαχείριση Διαιτητών</h1>

      <RefereeCreateForm />

      <div className="space-y-3">
        <h2 className="text-lg font-bold">Όλοι οι Διαιτητές ({all.length})</h2>
        <ul className="grid gap-2">
          {all.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/referees/${r.id}`}>
                <Card className="transition-colors hover:border-primary/40 hover:bg-secondary/50">
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{r.sortIndex ?? "—"}</span>
                      <span className="font-medium">{r.name}</span>
                      <Badge variant="secondary">{CATEGORY_LABELS[r.category]}</Badge>
                      {!r.isActive ? <Badge variant="destructive">Ανενεργός</Badge> : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
