"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMatchDay } from "@/app/actions/matches";
import { useSafeAction } from "@/lib/hooks/use-safe-action";

export function NewMatchDayForm() {
  const { pending, run } = useSafeAction();
  const router = useRouter();

  return (
    <form
      action={(formData) =>
        run(async () => {
          const day = await createMatchDay(formData);
          if (day) router.push(`/match-days/${day.id}`);
        }, "Η αγωνιστική δημιουργήθηκε")
      }
      className="max-w-xs space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="date">Ημερομηνία</Label>
        <Input id="date" name="date" type="date" required disabled={pending} />
      </div>
      <Button type="submit" disabled={pending}>
        Δημιουργία
      </Button>
    </form>
  );
}
