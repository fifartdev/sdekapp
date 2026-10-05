import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Ορισμός Νέου Κωδικού</h1>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
