"use client";

import { Check, X } from "lucide-react";
import { setMyAvailability } from "@/app/actions/matches";
import { useSafeAction } from "@/lib/hooks/use-safe-action";
import { cn } from "@/lib/utils";

export function MatchAvailabilityToggle({
  matchId,
  matchDayId,
  isAvailable,
  disabled,
}: {
  matchId: string;
  matchDayId: string;
  isAvailable: boolean;
  disabled: boolean;
}) {
  const { pending, run } = useSafeAction();

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full text-white",
          isAvailable ? "bg-success" : "bg-destructive"
        )}
      >
        {isAvailable ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </span>
      {!disabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () => setMyAvailability(matchId, matchDayId, !isAvailable),
              isAvailable ? "Δηλώθηκε αδυναμία συμμετοχής" : "Δηλώθηκε διαθεσιμότητα"
            )
          }
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          {isAvailable ? "Αδυνατώ να συμμετέχω" : "Επιθυμώ να συμμετέχω"}
        </button>
      ) : null}
    </div>
  );
}
