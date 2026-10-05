import {
  pgSchema,
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  date,
  time,
  timestamp,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Reference to Supabase's auth.users table (owned by GoTrue, not managed by Drizzle migrations)
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const userRoleEnum = pgEnum("user_role", ["admin", "referee"]);
export const refereeCategoryEnum = pgEnum("referee_category", [
  "international",
  "cat_a",
  "cat_b",
  "cat_c",
  "commissioner",
]);
export const assignmentRoleEnum = pgEnum("assignment_role", [
  "ref_a",
  "ref_b",
  "ref_c",
  "commissioner",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull().default("referee"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referees = pgTable("referees", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  landline: text("landline"),
  mobile: text("mobile"),
  sortIndex: integer("sort_index"),
  category: refereeCategoryEnum("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
});

export const arenas = pgTable("arenas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
});

/** Seasons an admin explicitly opened (e.g. 2026-27 before any match day exists). Seasons that already
 * contain match days are also derived from their dates, so historical seasons need no row here. */
export const seasons = pgTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  startYear: integer("start_year").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matchDays = pgTable("match_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchDayId: uuid("match_day_id")
    .notNull()
    .references(() => matchDays.id, { onDelete: "cascade" }),
  homeTeamId: uuid("home_team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "restrict" }),
  awayTeamId: uuid("away_team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "restrict" }),
  arenaId: uuid("arena_id")
    .notNull()
    .references(() => arenas.id, { onDelete: "restrict" }),
  matchTime: time("match_time").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matchAvailableReferees = pgTable(
  "match_available_referees",
  {
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    refereeId: uuid("referee_id")
      .notNull()
      .references(() => referees.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.matchId, t.refereeId] })]
);

export const matchAssignments = pgTable(
  "match_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    refereeId: uuid("referee_id")
      .notNull()
      .references(() => referees.id, { onDelete: "restrict" }),
    role: assignmentRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("match_assignments_match_role_unique").on(t.matchId, t.role),
    // A referee can only hold one role per match (e.g. can't be both ref_a and commissioner).
    // ref_c (3rd referee) is optional - a match is fully staffed with ref_a, ref_b and commissioner.
    uniqueIndex("match_assignments_match_referee_unique").on(t.matchId, t.refereeId),
  ]
);

// --- Relations (for Drizzle's relational query API) ---

export const profilesRelations = relations(profiles, ({ one }) => ({
  referee: one(referees, {
    fields: [profiles.id],
    references: [referees.profileId],
  }),
}));

export const refereesRelations = relations(referees, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [referees.profileId],
    references: [profiles.id],
  }),
  availableForMatches: many(matchAvailableReferees),
  assignments: many(matchAssignments),
}));

export const matchDaysRelations = relations(matchDays, ({ many }) => ({
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  matchDay: one(matchDays, {
    fields: [matches.matchDayId],
    references: [matchDays.id],
  }),
  homeTeam: one(teams, {
    fields: [matches.homeTeamId],
    references: [teams.id],
  }),
  awayTeam: one(teams, {
    fields: [matches.awayTeamId],
    references: [teams.id],
  }),
  arena: one(arenas, {
    fields: [matches.arenaId],
    references: [arenas.id],
  }),
  availableReferees: many(matchAvailableReferees),
  assignments: many(matchAssignments),
}));

export const matchAvailableRefereesRelations = relations(matchAvailableReferees, ({ one }) => ({
  match: one(matches, {
    fields: [matchAvailableReferees.matchId],
    references: [matches.id],
  }),
  referee: one(referees, {
    fields: [matchAvailableReferees.refereeId],
    references: [referees.id],
  }),
}));

export const matchAssignmentsRelations = relations(matchAssignments, ({ one }) => ({
  match: one(matches, {
    fields: [matchAssignments.matchId],
    references: [matches.id],
  }),
  referee: one(referees, {
    fields: [matchAssignments.refereeId],
    references: [referees.id],
  }),
}));
