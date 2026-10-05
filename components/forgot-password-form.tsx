"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, MailCheck } from "lucide-react";
import { requestPasswordReset, type RequestResetState } from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Αποστολή Συνδέσμου
    </Button>
  );
}

const initialState: RequestResetState = { sent: false, error: null };

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState);

  if (state.sent) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
        <MailCheck className="h-8 w-8 text-success" />
        <p className="text-sm">
          Αν υπάρχει λογαριασμός με αυτό το email, θα λάβετε σύντομα σύνδεσμο επαναφοράς κωδικού.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error ? <p className="text-sm font-medium text-destructive">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
