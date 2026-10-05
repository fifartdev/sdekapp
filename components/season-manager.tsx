"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createSeason, deleteSeason } from "@/app/actions/seasons";
import { useSafeAction } from "@/lib/hooks/use-safe-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type SeasonRow = {
  label: string;
  startYear: number;
  matchDayCount: number;
  createdId: string | null;
};

function labelFor(startYear: number) {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function SeasonManager({ seasons, nextStartYear }: { seasons: SeasonRow[]; nextStartYear: number }) {
  const { pending, run } = useSafeAction();
  const [startYear, setStartYear] = useState(String(nextStartYear));
  const parsedYear = Number(startYear);
  const validYear = Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Αγωνιστικές Περίοδοι</h1>
        <p className="text-sm text-muted-foreground">
          Κάθε περίοδος διαρκεί από 1 Ιουλίου έως 30 Ιουνίου και εμφανίζεται σε όλους τους διαιτητές.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form
            action={(formData) =>
              run(async () => {
                await createSeason(formData);
                setStartYear(String(parsedYear + 1));
              }, `Η περίοδος ${labelFor(parsedYear)} δημιουργήθηκε`)
            }
            className="flex flex-wrap items-end gap-2"
          >
            <div className="space-y-1">
              <Label htmlFor="startYear">Έτος έναρξης</Label>
              <Input
                id="startYear"
                name="startYear"
                type="number"
                min={2000}
                max={2100}
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                required
                disabled={pending}
                className="w-32"
              />
            </div>
            <Button type="submit" disabled={pending || !validYear}>
              <Plus className="h-4 w-4" />
              {validYear ? `Δημιουργία ${labelFor(parsedYear)}` : "Δημιουργία"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {seasons.map((s) => (
          <li key={s.startYear}>
            <Card>
              <CardContent className="flex items-center justify-between gap-2 p-3">
                <div className="space-y-1">
                  <div className="font-medium">{s.label}</div>
                  <Badge variant="secondary">{s.matchDayCount} αγωνιστικές</Badge>
                </div>
                {s.createdId && s.matchDayCount === 0 ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pending}
                    onClick={() => run(() => deleteSeason(s.createdId!), "Διαγράφηκε")}
                    aria-label={`Διαγραφή ${s.label}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
