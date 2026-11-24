import type { PushPayload } from "./push";

export function assignmentPush(a: {
  matchId: string;
  home: string;
  away: string;
  arena: string;
  date: string;
  time: string;
}): PushPayload {
  return {
    title: `Έχετε οριστεί στις ${a.date}, ώρα ${a.time}`,
    body: `${a.home}-${a.away}, ${a.arena}`,
    url: `/matches/${a.matchId}`,
  };
}

export function availabilityPush(a: { matchDayId: string; subject: string; message: string }): PushPayload {
  return { title: a.subject, body: a.message, url: `/match-days/${a.matchDayId}` };
}

/** Profile ids of assigned referees who have an app account (referees without one get email only). */
export function assignedProfileIds(assignments: { referee: { profileId: string | null } }[]): string[] {
  const ids = assignments.map((a) => a.referee.profileId).filter((id): id is string => id !== null);
  return [...new Set(ids)];
}
