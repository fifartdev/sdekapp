import Link from "next/link";
import { desc } from "drizzle-orm";
import { CalendarDays, ChevronRight } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { matchDays } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";

export default async function MatchDaysPage() {
  const db = getDb();
  const days = await db.select().from(matchDays).orderBy(desc(matchDays.date));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Αγωνιστικές Ημέρες</h1>

      {days.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <CalendarDays className="h-8 w-8" />
            <p>Δεν υπάρχουν ακόμα αγωνιστικές ημέρες.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {days.map((day) => (
            <li key={day.id}>
              <Link href={`/match-days/${day.id}`}>
                <Card className="transition-colors hover:border-primary/40 hover:bg-secondary/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        {new Date(day.date).toLocaleDateString("el-GR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
