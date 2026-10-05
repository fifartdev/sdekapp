export type Season = { label: string; start: string; end: string };

/** Greek basketball convention: a season runs July -> June. Every date has a home season. */
export function seasonStartYear(date: string): number {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1; // 1-12
  return month >= 7 ? year : year - 1;
}

export function seasonFromStartYear(startYear: number): Season {
  return {
    label: `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`,
    start: `${startYear}-07-01`,
    end: `${startYear + 1}-07-01`,
  };
}

export function seasonForDate(date: string): Season {
  return seasonFromStartYear(seasonStartYear(date));
}

/**
 * Builds the full list of seasons (newest first) spanning the given match dates plus any
 * explicitly created season start years.
 */
export function seasonsSpanning(dates: string[], extraStartYears: number[] = []): Season[] {
  const years = [...dates.map(seasonStartYear), ...extraStartYears];
  if (years.length === 0) return [seasonForDate(new Date().toISOString().slice(0, 10))];
  const min = Math.min(...years);
  const max = Math.max(...years);
  const seasons: Season[] = [];
  for (let y = max; y >= min; y--) seasons.push(seasonFromStartYear(y));
  return seasons;
}

export const CATEGORY_LABELS = {
  international: "ΔΙΕΘΝΗΣ",
  cat_a: "Α ΚΑΤΗΓΟΡΙΑ",
  cat_b: "Β ΚΑΤΗΓΟΡΙΑ",
  cat_c: "Γ ΚΑΤΗΓΟΡΙΑ",
  commissioner: "ΚΟΜΙΣΑΡΙΟΣ",
} as const;

export const ASSIGNMENT_ROLE_LABELS = {
  ref_a: "Διαιτητής Α",
  ref_b: "Διαιτητής Β",
  ref_c: "Διαιτητής Γ",
  commissioner: "Κομισάριος",
} as const;

export type AssignmentRole = keyof typeof ASSIGNMENT_ROLE_LABELS;

/** Roles every match needs; ref_c (3rd referee) is optional. */
export const REQUIRED_ASSIGNMENT_ROLES: AssignmentRole[] = ["ref_a", "ref_b", "commissioner"];
