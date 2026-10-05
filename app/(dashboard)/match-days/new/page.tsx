import { requireAdmin } from "@/lib/auth/session";
import { NewMatchDayForm } from "@/components/new-match-day-form";

export default async function NewMatchDayPage() {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Νέα Αγωνιστική</h1>
      <p className="text-sm italic text-muted-foreground">
        (Η ημερομηνία δεν μπορεί να είναι νωρίτερα από 7 ημέρες από τη σημερινή.)
      </p>
      <NewMatchDayForm />
    </div>
  );
}
