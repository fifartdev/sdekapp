"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updatePassword, type UpdatePasswordState } from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Ορισμός Κωδικού
    </Button>
  );
}

const initialState: UpdatePasswordState = { error: null };

export function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [done, setDone] = useState(false);
  const [state, formAction] = useActionState(updatePassword, initialState);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // The recovery link's #access_token is parsed client-side on load; this
    // fires once the browser client has turned it into a real session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });
    // In case the event already fired before this listener attached.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (ready) return;
    const timeout = setTimeout(() => setInvalid(true), 4000);
    return () => clearTimeout(timeout);
  }, [ready]);

  useEffect(() => {
    if (!state.error && state !== initialState) {
      setDone(true);
      const t = setTimeout(() => router.push("/"), 2000);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  if (done) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-8 w-8 text-success" />
        <p className="text-sm">Ο κωδικός ενημερώθηκε. Μεταφορά στη σύνδεση...</p>
      </div>
    );
  }

  if (invalid && !ready) {
    return (
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Ο σύνδεσμος δεν είναι έγκυρος ή έχει λήξει. Ζητήστε νέο σύνδεσμο επαναφοράς.
      </p>
    );
  }

  if (!ready) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  }

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Νέος Κωδικός</Label>
        <Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
      </div>
      {state.error ? <p className="text-sm font-medium text-destructive">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
