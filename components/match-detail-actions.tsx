"use client";

import { useRouter } from "next/navigation";
import { Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteMatch, sendAssignmentNotification } from "@/app/actions/matches";
import { useSafeAction } from "@/lib/hooks/use-safe-action";

export function MatchDetailActions({
  matchId,
  matchDayId,
  hasAssignments,
}: {
  matchId: string;
  matchDayId: string;
  hasAssignments: boolean;
}) {
  const { pending, run } = useSafeAction();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {hasAssignments ? (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => sendAssignmentNotification(matchId), "Το μήνυμα εστάλη")}
        >
          <Mail className="h-4 w-4" />
          Αποστολή Ενημέρωσης
        </Button>
      ) : null}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={pending}>
            <Trash2 className="h-4 w-4" />
            Διαγραφή Αγώνα
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή Αγώνα</AlertDialogTitle>
            <AlertDialogDescription>
              Προσοχή, πρόκειται να διαγράψετε τον αγώνα. Η ενέργεια δεν αναιρείται.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Άκυρο</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                run(async () => {
                  await deleteMatch(matchId, matchDayId);
                  router.push(`/match-days/${matchDayId}`);
                })
              }
            >
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
