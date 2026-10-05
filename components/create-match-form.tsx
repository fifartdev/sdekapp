"use client";

import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createMatch } from "@/app/actions/matches";
import { useSafeAction } from "@/lib/hooks/use-safe-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { id: string; name: string };

export function CreateMatchForm({
  matchDayId,
  availableTeams,
  arenas,
}: {
  matchDayId: string;
  availableTeams: Option[];
  arenas: Option[];
}) {
  const { pending, run } = useSafeAction();
  const formRef = useRef<HTMLFormElement>(null);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [arenaId, setArenaId] = useState("");

  const awayOptions = useMemo(
    () => availableTeams.filter((t) => t.id !== homeTeamId),
    [availableTeams, homeTeamId]
  );

  const disabled = pending || availableTeams.length < 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Προσθήκη Αγώνα</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={(formData) =>
            run(async () => {
              await createMatch(matchDayId, formData);
              formRef.current?.reset();
              setHomeTeamId("");
              setAwayTeamId("");
              setArenaId("");
            }, "Ο αγώνας δημιουργήθηκε")
          }
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label>Ομάδα Α</Label>
            <input type="hidden" name="homeTeamId" value={homeTeamId} />
            <Select
              value={homeTeamId}
              onValueChange={(v) => {
                setHomeTeamId(v);
                if (v === awayTeamId) setAwayTeamId("");
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε Ομάδα Α" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Ομάδα Β</Label>
            <input type="hidden" name="awayTeamId" value={awayTeamId} />
            <Select value={awayTeamId} onValueChange={setAwayTeamId} disabled={disabled || !homeTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε Ομάδα Β" />
              </SelectTrigger>
              <SelectContent>
                {awayOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Γήπεδο</Label>
            <input type="hidden" name="arenaId" value={arenaId} />
            <Select value={arenaId} onValueChange={setArenaId} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε Γήπεδο" />
              </SelectTrigger>
              <SelectContent>
                {arenas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="matchTime">Ώρα Αγώνα</Label>
            <Input id="matchTime" name="matchTime" type="time" required disabled={disabled} />
          </div>

          <Button
            type="submit"
            disabled={disabled || !homeTeamId || !awayTeamId || !arenaId}
            className="sm:col-span-2 w-fit"
          >
            <Plus className="h-4 w-4" />
            Προσθήκη
          </Button>

          {availableTeams.length < 2 ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Δεν υπάρχουν αρκετές διαθέσιμες ομάδες για νέο αγώνα σε αυτή την ημέρα.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
