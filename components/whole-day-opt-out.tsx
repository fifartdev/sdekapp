"use client";

import { Button } from "@/components/ui/button";
import { setUnavailableForWholeDay } from "@/app/actions/matches";
import { useSafeAction } from "@/lib/hooks/use-safe-action";

export function WholeDayOptOut({ matchDayId }: { matchDayId: string }) {
  const { pending, run } = useSafeAction();

  return (
    <Button
      variant="destructive"
      disabled={pending}
      onClick={() => run(() => setUnavailableForWholeDay(matchDayId), "Δηλώθηκε αδυναμία για όλη την ημέρα")}
    >
      Αδυναμία συμμετοχής σε ολόκληρη την αγωνιστική ημέρα
    </Button>
  );
}
