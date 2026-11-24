"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Download, Share, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { decidePrompt, type PromptView } from "@/lib/pwa-state";
import { enablePush, getSubscription, pushSupported, registerSw } from "@/lib/push-client";

const DISMISS_KEY = "pwa-prompt-dismissed-until";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function isDismissed(): boolean {
  try {
    return Number(localStorage.getItem(DISMISS_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS));
  } catch {
    // storage unavailable (private mode): banner just reappears next visit
  }
}

function detect() {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMobile = isIos || /android|mobile/i.test(ua);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { isIos, isMobile, isStandalone };
}

export function PwaPrompt({ loggedIn }: { loggedIn: boolean }) {
  const [view, setView] = useState<PromptView>("none");
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);

  const recompute = useCallback(
    async (evt: InstallPromptEvent | null) => {
      const supported = pushSupported();
      const subscribed = supported ? Boolean(await getSubscription().catch(() => null)) : false;
      setView(
        decidePrompt({
          ...detect(),
          hasInstallPrompt: evt !== null,
          pushSupported: supported,
          permission: supported ? (Notification.permission as "default" | "granted" | "denied") : "default",
          subscribed,
          loggedIn,
          dismissed: isDismissed(),
        })
      );
    },
    [loggedIn]
  );

  useEffect(() => {
    void registerSw().then(() => recompute(null));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      const evt = e as InstallPromptEvent;
      setInstallEvent(evt);
      void recompute(evt);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      void recompute(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [recompute]);

  if (view === "none") return null;

  const close = () => {
    dismiss();
    setView("none");
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    setInstallEvent(null);
    void recompute(null);
  };

  const enable = async () => {
    setBusy(true);
    try {
      const result = await enablePush();
      if (result === "granted") toast.success("Οι ειδοποιήσεις ενεργοποιήθηκαν");
      else if (result === "denied") toast.error("Οι ειδοποιήσεις είναι αποκλεισμένες από τις ρυθμίσεις της συσκευής");
      else toast.error("Οι ειδοποιήσεις δεν υποστηρίζονται σε αυτή τη συσκευή");
      setView("none");
    } catch (err) {
      console.error(err);
      toast.error("Δεν ήταν δυνατή η ενεργοποίηση των ειδοποιήσεων");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="relative rounded-lg border border-border bg-card p-4 pr-10 text-card-foreground shadow-lg">
        <button
          onClick={close}
          aria-label="Όχι τώρα"
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>

        {view === "install-android" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Εγκαταστήστε την εφαρμογή στο κινητό σας</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={install}>
                <Download className="h-4 w-4" />
                Εγκατάσταση
              </Button>
              <Button size="sm" variant="ghost" onClick={close}>
                Όχι τώρα
              </Button>
            </div>
          </div>
        ) : null}

        {view === "install-ios" ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Εγκαταστήστε την εφαρμογή στο iPhone σας</p>
            <p className="text-sm text-muted-foreground">
              Πατήστε <Share className="inline h-4 w-4 align-text-bottom" /> Κοινή χρήση και μετά «Προσθήκη στην
              οθόνη Αφετηρίας».
            </p>
          </div>
        ) : null}

        {view === "enable-notifications" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Λάβετε ειδοποιήσεις για τους ορισμούς σας</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={enable} disabled={busy}>
                <Bell className="h-4 w-4" />
                Ενεργοποίηση ειδοποιήσεων
              </Button>
              <Button size="sm" variant="ghost" onClick={close}>
                Όχι τώρα
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
