"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { assignReferee, removeAssignment } from "@/app/actions/matches";
import { useSafeAction } from "@/lib/hooks/use-safe-action";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AssignmentRole } from "@/lib/seasons";

export function AssignmentSlot({
  matchId,
  matchDayId,
  role,
  label,
  assignedName,
  options,
}: {
  matchId: string;
  matchDayId: string;
  role: AssignmentRole;
  label: string;
  assignedName: string | null;
  options: { id: string; name: string }[];
}) {
  const { pending, run } = useSafeAction();
  const [selected, setSelected] = useState("");

  if (assignedName) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-medium">{assignedName}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={() => run(() => removeAssignment(matchId, matchDayId, role), "Αφαιρέθηκε")}
          aria-label="Αφαίρεση"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-dashed border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex gap-2">
        <Select value={selected} onValueChange={setSelected} disabled={pending}>
          <SelectTrigger>
            <SelectValue placeholder={`Επιλέξτε ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={pending || !selected}
          onClick={() =>
            run(async () => {
              await assignReferee(matchId, matchDayId, role, selected);
              setSelected("");
            }, "Ο ορισμός καταχωρήθηκε")
          }
        >
          Ορισμός
        </Button>
      </div>
    </div>
  );
}
