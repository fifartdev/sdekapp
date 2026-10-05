import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { referees } from "@/lib/db/schema";
import { RefereeEditForm } from "@/components/referee-edit-form";

export default async function AdminRefereeEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [referee] = await getDb().select().from(referees).where(eq(referees.id, id)).limit(1);
  if (!referee) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/referees" className="text-sm text-primary hover:underline">
          &larr; Πίσω
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Επεξεργασία: {referee.name}</h1>
      </div>

      <RefereeEditForm referee={referee} />

      <Link href={`/referees/${referee.id}`} className="text-sm text-primary hover:underline">
        Προβολή δημόσιου προφίλ &rarr;
      </Link>
    </div>
  );
}
