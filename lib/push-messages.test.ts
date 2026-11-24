import { test } from "node:test";
import assert from "node:assert/strict";
import { assignmentPush, availabilityPush, assignedProfileIds } from "./push-messages";

test("assignmentPush mirrors the assignment email and links to the referee's own assignments page", () => {
  assert.deepEqual(
    assignmentPush({ matchId: "m1", home: "Α", away: "Β", arena: "Γήπεδο 1", date: "1/12/2026", time: "18:00" }),
    { title: "Έχετε οριστεί στις 1/12/2026, ώρα 18:00", body: "Α-Β, Γήπεδο 1", url: "/my-assignments" }
  );
});

test("availabilityPush uses the federation email subject/message and links to the match day", () => {
  assert.deepEqual(availabilityPush({ matchDayId: "d1", subject: "S", message: "M" }), {
    title: "S",
    body: "M",
    url: "/match-days/d1",
  });
});

test("assignedProfileIds skips referees without an account and dedupes", () => {
  assert.deepEqual(
    assignedProfileIds([{ referee: { profileId: "a" } }, { referee: { profileId: null } }, { referee: { profileId: "a" } }]),
    ["a"]
  );
});
