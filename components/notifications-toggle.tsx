"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { disablePush, enablePush, getSubscription, pushSupported } from "@/lib/push-client";

/** Per-device on/off switch for push notifications (sidebar footer). Hidden where push is unsupported. */
export function NotificationsToggle() {
  const [state, setState] = useState<"loading" | "unsupported" | "on" | "off">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported() || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      setState("unsupported");
      return;
    }
    getSubscription()
      .then((sub) => setState(sub && Notification.permission === "granted" ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  if (state === "loading" || state === "unsupported") return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (state === "on") {
        await disablePush();
        setState("off");
        toast.success("Οι ειδοποιήσεις απενεργοποιήθηκαν σε αυτή τη συσκευή");
        return;
      }
      if (Notification.permission === "denied") {
        toast.error("Οι ειδοποιήσεις είναι αποκλεισμένες από τις ρυθμίσεις της συσκευής");
        return;
      }
      const result = await enablePush();
      if (result === "granted") {
        setState("on");
        toast.success("Οι ειδοποιήσεις ενεργοποιήθηκαν");
      } else if (result === "denied") {
        toast.error("Οι ειδοποιήσεις είναι αποκλεισμένες από τις ρυθμίσεις της συσκευής");
      } else {
        toast.error("Οι ειδοποιήσεις δεν υποστηρίζονται σε αυτή τη συσκευή");
      }
    } catch (err) {
      console.error(err);
      toast.error("Δεν ήταν δυνατή η αλλαγή των ειδοποιήσεων");
    } finally {
      setBusy(false);
    }
  };

  const label = state === "on" ? "Απενεργοποίηση ειδοποιήσεων" : "Ενεργοποίηση ειδοποιήσεων";
  return (
    <Button variant="ghost" size="icon" onClick={toggle} disabled={busy} aria-label={label} title={label}>
      {state === "on" ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 opacity-60" />}
    </Button>
  );
}
