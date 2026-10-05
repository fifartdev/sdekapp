"use client";

import { useTransition } from "react";
import { toast } from "sonner";

/**
 * Runs a Server Action inside a transition, surfacing thrown errors as a toast
 * instead of an unhandled rejection - replaces the old app's window.alert() pattern.
 */
export function useSafeAction() {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>, successMessage?: string) {
    startTransition(async () => {
      try {
        await action();
        if (successMessage) toast.success(successMessage);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Κάτι πήγε στραβά");
      }
    });
  }

  return { pending, run };
}
