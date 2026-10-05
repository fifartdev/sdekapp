"use client";

import { useState } from "react";
import { updateReferee } from "@/app/actions/referees";
import { useSafeAction } from "@/lib/hooks/use-safe-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS } from "@/lib/seasons";
import type { referees } from "@/lib/db/schema";

export function RefereeEditForm({ referee }: { referee: typeof referees.$inferSelect }) {
  const { pending, run } = useSafeAction();
  const [category, setCategory] = useState(referee.category);
  const [isActive, setIsActive] = useState(String(referee.isActive));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Επεξεργασία Διαιτητή</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={(formData) =>
            run(() => updateReferee(referee.id, formData), "Ενημερώθηκε")
          }
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Όνομα</Label>
            <Input id="name" name="name" defaultValue={referee.name} required disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={referee.email} required disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortIndex">Α/Α</Label>
            <Input
              id="sortIndex"
              name="sortIndex"
              type="number"
              defaultValue={referee.sortIndex ?? undefined}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="landline">Σταθερό</Label>
            <Input id="landline" name="landline" defaultValue={referee.landline ?? ""} disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile">Κινητό</Label>
            <Input id="mobile" name="mobile" defaultValue={referee.mobile ?? ""} disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Κατηγορία</Label>
            <input type="hidden" name="category" value={category} />
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)} disabled={pending}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="isActive">Κατάσταση</Label>
            <input type="hidden" name="isActive" value={isActive} />
            <Select value={isActive} onValueChange={setIsActive} disabled={pending}>
              <SelectTrigger id="isActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Ενεργός</SelectItem>
                <SelectItem value="false">Ανενεργός</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={pending} className="sm:col-span-2 w-fit">
            Ενημέρωση
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
