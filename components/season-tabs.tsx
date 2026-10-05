"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MatchesTable, type MatchRow } from "@/components/matches-table";

export function SeasonTabs({
  seasons,
  highlightRefereeId,
}: {
  seasons: { label: string; matches: MatchRow[] }[];
  highlightRefereeId?: string;
}) {
  const [active, setActive] = useState(seasons[0]?.label);
  const current = seasons.find((s) => s.label === active);

  return (
    <div>
      <div role="tablist" className="flex border-b border-border">
        {seasons.map((s) => (
          <button
            key={s.label}
            role="tab"
            aria-selected={active === s.label}
            onClick={() => setActive(s.label)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active === s.label
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {current ? (
        <motion.div
          key={current.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-4"
        >
          <MatchesTable matches={current.matches} highlightRefereeId={highlightRefereeId} />
        </motion.div>
      ) : null}
    </div>
  );
}
