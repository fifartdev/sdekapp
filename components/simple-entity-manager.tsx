"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSafeAction } from "@/lib/hooks/use-safe-action";

type Entity = { id: string; name: string };

export function SimpleEntityManager({
  title,
  emptyLabel,
  addLabel,
  placeholder,
  items,
  onCreate,
  onDelete,
}: {
  title: string;
  emptyLabel: string;
  addLabel: string;
  placeholder: string;
  items: Entity[];
  onCreate: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { pending, run } = useSafeAction();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>

      <Card>
        <CardContent className="p-4">
          <form
            ref={formRef}
            action={(formData) =>
              run(async () => {
                await onCreate(formData);
                formRef.current?.reset();
              }, "Προστέθηκε")
            }
            className="flex gap-2"
          >
            <Input name="name" placeholder={placeholder} required disabled={pending} />
            <Button type="submit" disabled={pending}>
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          </form>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <Card>
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="text-sm font-medium">{item.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() => run(() => onDelete(item.id), "Διαγράφηκε")}
                      aria-label="Διαγραφή"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
