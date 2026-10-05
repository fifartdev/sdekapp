import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Επαναφορά Κωδικού</h1>
          <p className="text-sm text-muted-foreground">
            Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
