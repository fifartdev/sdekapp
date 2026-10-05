"use server";

import { createClient } from "@/lib/supabase/server";

export type RequestResetState = { sent: boolean; error: string | null };

export async function requestPasswordReset(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { sent: false, error: "Συμπληρώστε το email σας." };

  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/reset-password`,
  });

  // Always report success regardless of whether the email exists, to avoid
  // leaking which addresses have accounts.
  if (error) {
    console.error("resetPasswordForEmail error:", {
      message: error.message,
      status: error.status,
      code: (error as { code?: string }).code,
      name: error.name,
    });
  }
  return { sent: true, error: null };
}

export type UpdatePasswordState = { error: string | null };

export async function updatePassword(
  _prev: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Ο σύνδεσμος έχει λήξει. Ζητήστε νέο email επαναφοράς." };

  return { error: null };
}
