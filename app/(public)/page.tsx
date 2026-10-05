import { LoginForm } from "@/components/login-form";

export default function HomePage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Σύνδεση</h1>
          <p className="text-sm text-muted-foreground">Εφαρμογή Ορισμών Διαιτητών - ΚΕΔ ΟΣΕΚΑ</p>
        </div>

        <LoginForm />

        <p className="text-xs text-muted-foreground">Beta έκδοση 0.2.0</p>
      </div>
    </div>
  );
}
