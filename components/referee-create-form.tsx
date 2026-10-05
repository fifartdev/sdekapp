"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createReferee } from "@/app/actions/referees";
import { useSafeAction } from "@/lib/hooks/use-safe-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS } from "@/lib/seasons";

export function RefereeCreateForm() {
  const { pending, run } = useSafeAction();
  const formRef = useRef<HTMLFormElement>(null);
  const [category, setCategory] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Προσθήκη Διαιτητή</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={(formData) =>
            run(async () => {
              await createReferee(formData);
              formRef.current?.reset();
              setCategory("");
            }, "Ο διαιτητής προστέθηκε")
          }
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Όνομα</Label>
            <Input id="name" name="name" required disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Κωδικός Πρόσβασης</Label>
            <Input id="password" name="password" type="password" minLength={8} required disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortIndex">Α/Α</Label>
            <Input id="sortIndex" name="sortIndex" type="number" disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="landline">Σταθερό</Label>
            <Input id="landline" name="landline" disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile">Κινητό</Label>
            <Input id="mobile" name="mobile" disabled={pending} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="category">Κατηγορία</Label>
            <input type="hidden" name="category" value={category} />
            <Select value={category} onValueChange={setCategory} disabled={pending}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Επιλέξτε κατηγορία" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={pending || !category} className="sm:col-span-2 w-fit">
            <Plus className="h-4 w-4" />
            Προσθήκη
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
