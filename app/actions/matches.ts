"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import {
  matchDays,
  matches,
  matchAvailableReferees,
  matchAssignments,
  referees,
  assignmentRoleEnum,
} from "@/lib/db/schema";
import { requireAdminAction, requireUserAction } from "@/lib/auth/session";
import { sendMail, sendMailToMany } from "@/lib/email";

const CONFEDERATION_RECIPIENTS = "ked.oseka@gmail.com, oseka@oseka.gr";

// --- Match days ---

export async function createMatchDay(formData: FormData) {
  await requireAdminAction();
  const date = z.string().min(1, "Η ημερομηνία είναι υποχρεωτική").parse(formData.get("date"));
  const [day] = await getDb().insert(matchDays).values({ date }).returning();
  revalidatePath("/match-days");
  return day;
}

// --- Matches ---

const createMatchSchema = z.object({
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  arenaId: z.string().uuid(),
  matchTime: z.string().min(1),
});

export async function createMatch(matchDayId: string, formData: FormData) {
  await requireAdminAction();

  const data = createMatchSchema.parse({
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    arenaId: formData.get("arenaId"),
    matchTime: formData.get("matchTime"),
  });

  if (data.homeTeamId === data.awayTeamId) {
    throw new Error("Επιλέξτε δύο διαφορετικές ομάδες");
  }

  const db = getDb();
  const [match] = await db
    .insert(matches)
    .values({ matchDayId, ...data })
    .returning();

  const activeReferees = await db
    .select({ id: referees.id })
    .from(referees)
    .where(eq(referees.isActive, true));

  if (activeReferees.length > 0) {
    await db
      .insert(matchAvailableReferees)
      .values(activeReferees.map((r) => ({ matchId: match!.id, refereeId: r.id })));
  }

  revalidatePath(`/match-days/${matchDayId}`);
  return match;
}

export async function deleteMatch(matchId: string, matchDayId: string) {
  await requireAdminAction();
  await getDb().delete(matches).where(eq(matches.id, matchId));
  revalidatePath(`/match-days/${matchDayId}`);
  revalidatePath("/match-days");
}

// --- Referee self-service availability ---

/** Best-effort - don't fail the availability toggle itself if the notification email can't be sent. */
async function notifyFederation(subject: string, message: string) {
  await sendMail({ to: CONFEDERATION_RECIPIENTS, subject, text: message }).catch(() => {});
}

export async function setMyAvailability(matchId: string, matchDayId: string, available: boolean) {
  const user = await requireUserAction();
  if (!user.referee) throw new Error("Μόνο διαιτητές μπορούν να δηλώσουν διαθεσιμότητα");

  const db = getDb();
  if (available) {
    await db
      .insert(matchAvailableReferees)
      .values({ matchId, refereeId: user.referee.id })
      .onConflictDoNothing();
  } else {
    await db
      .delete(matchAvailableReferees)
      .where(
        and(eq(matchAvailableReferees.matchId, matchId), eq(matchAvailableReferees.refereeId, user.referee.id))
      );
  }

  const match = await db.query.matches.findFirst({
    where: (m, { eq: eq2 }) => eq2(m.id, matchId),
    with: { matchDay: true, homeTeam: true, awayTeam: true },
  });
  if (match) {
    const date = new Date(match.matchDay.date).toLocaleDateString("el-GR");
    const teams = `${match.homeTeam.name}-${match.awayTeam.name}`;
    if (available) {
      await notifyFederation(
        `Δυνατότητα Συμμετοχής ${user.referee.name}`,
        `Επιθυμώ να συμμετέχω στον αγώνα ${teams} στις ${date}.`
      );
    } else {
      await notifyFederation(
        `Αδυναμία Συμμετοχής ${user.referee.name}`,
        `Αδυνατώ να συμμετέχω στον αγώνα ${teams} στις ${date}.`
      );
    }
  }

  revalidatePath(`/match-days/${matchDayId}`);
}

export async function setUnavailableForWholeDay(matchDayId: string) {
  const user = await requireUserAction();
  if (!user.referee) throw new Error("Μόνο διαιτητές μπορούν να δηλώσουν διαθεσιμότητα");

  const db = getDb();
  const dayMatches = await db.select({ id: matches.id }).from(matches).where(eq(matches.matchDayId, matchDayId));

  for (const m of dayMatches) {
    await db
      .delete(matchAvailableReferees)
      .where(and(eq(matchAvailableReferees.matchId, m.id), eq(matchAvailableReferees.refereeId, user.referee.id)));
  }

  const [day] = await db.select().from(matchDays).where(eq(matchDays.id, matchDayId)).limit(1);
  if (day) {
    const date = new Date(day.date).toLocaleDateString("el-GR");
    await notifyFederation(
      `Αδυναμία Συμμετοχής ${user.referee.name}`,
      `Αδυνατώ να συμμετέχω συνολικά στις ${date}.`
    );
  }

  revalidatePath(`/match-days/${matchDayId}`);
}

// --- Admin assignment ---

const roleValues = assignmentRoleEnum.enumValues;

export async function assignReferee(matchId: string, matchDayId: string, role: (typeof roleValues)[number], refereeId: string) {
  await requireAdminAction();
  try {
    await getDb().insert(matchAssignments).values({ matchId, role, refereeId });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23505") {
      throw new Error("Ο ρόλος αυτός έχει ήδη οριστεί ή ο διαιτητής έχει ήδη ρόλο σε αυτόν τον αγώνα");
    }
    throw err;
  }
  revalidatePath(`/matches/${matchId}`);
  revalidatePath(`/match-days/${matchDayId}`);
}

export async function removeAssignment(matchId: string, matchDayId: string, role: (typeof roleValues)[number]) {
  await requireAdminAction();
  await getDb()
    .delete(matchAssignments)
    .where(and(eq(matchAssignments.matchId, matchId), eq(matchAssignments.role, role)));
  revalidatePath(`/matches/${matchId}`);
  revalidatePath(`/match-days/${matchDayId}`);
}

export async function sendAssignmentNotification(matchId: string) {
  await requireAdminAction();

  const db = getDb();
  const match = await db.query.matches.findFirst({
    where: (m, { eq: eq2 }) => eq2(m.id, matchId),
    with: {
      matchDay: true,
      homeTeam: true,
      awayTeam: true,
      arena: true,
      assignments: { with: { referee: true } },
    },
  });
  if (!match) throw new Error("Ο αγώνας δεν βρέθηκε");
  if (match.assignments.length === 0) throw new Error("Δεν υπάρχουν ορισμοί για ενημέρωση");

  const date = new Date(match.matchDay.date).toLocaleDateString("el-GR");
  const refA = match.assignments.find((a) => a.role === "ref_a")?.referee.name ?? "-";
  const refB = match.assignments.find((a) => a.role === "ref_b")?.referee.name ?? "-";
  const refC = match.assignments.find((a) => a.role === "ref_c")?.referee.name;
  const commissioner = match.assignments.find((a) => a.role === "commissioner")?.referee.name ?? "-";

  const recipients = match.assignments.map((a) => a.referee.email);
  const { failed } = await sendMailToMany(recipients, () => ({
    subject: `Έχετε οριστεί στις ${date}, ώρα ${match.matchTime}`,
    text: `Οριστίκατε σε αγώνα ${match.homeTeam.name}-${match.awayTeam.name}, στο Γήπεδο ${match.arena.name}, ημερομηνία ${date}, ώρα ${match.matchTime}. Οι ορισμοί έχουν ως εξής. Διαιτητής Α: ${refA}, Διαιτητής Β: ${refB}, ${refC ? `Διαιτητής Γ: ${refC}, ` : ""}Κομισάριος: ${commissioner}`,
  }));

  if (failed.length > 0) {
    throw new Error(`Απέτυχε η αποστολή σε: ${failed.join(", ")}`);
  }
}
