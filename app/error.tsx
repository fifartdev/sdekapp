"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="el">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h1 className="text-xl font-bold">Κάτι πήγε στραβά</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Παρουσιάστηκε ένα απρόσμενο σφάλμα. Δοκιμάστε ξανά.
          </p>
          <Button onClick={reset}>Δοκιμή ξανά</Button>
        </div>
      </body>
    </html>
  );
}
