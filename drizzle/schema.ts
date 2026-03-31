import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── User Wellness Profiles ───────────────────────────────────────────────────

export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  firstName: varchar("firstName", { length: 100 }),
  ageRange: varchar("ageRange", { length: 20 }),
  mainGoal: varchar("mainGoal", { length: 50 }),
  meditationLevel: mysqlEnum("meditationLevel", ["beginner", "intermediate", "advanced"]).default("beginner"),
  preferredDuration: int("preferredDuration").default(10),
  guidanceTone: mysqlEnum("guidanceTone", ["gentle", "motivating", "neutral"]).default("gentle"),
  isPremium: boolean("isPremium").default(false).notNull(),
  totalSessions: int("totalSessions").default(0).notNull(),
  totalMinutes: int("totalMinutes").default(0).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastSessionDate: timestamp("lastSessionDate"),
  isOnboarded: boolean("isOnboarded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// ─── Emotional Check-Ins ──────────────────────────────────────────────────────

export const checkIns = mysqlTable("checkIns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mood: mysqlEnum("mood", ["anxious", "sad", "neutral", "calm", "happy", "energetic", "grateful"]).notNull(),
  intensity: int("intensity").default(5).notNull(),
  note: text("note"),
  triggers: text("triggers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;

// ─── Journal Entries ──────────────────────────────────────────────────────────

export const journalEntries = mysqlTable("journalEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  mood: mysqlEnum("mood", ["anxious", "sad", "neutral", "calm", "happy", "energetic", "grateful"]),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

// ─── Meditation Session History ───────────────────────────────────────────────

export const sessionHistory = mysqlTable("sessionHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  meditationId: varchar("meditationId", { length: 100 }).notNull(),
  meditationTitle: varchar("meditationTitle", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  duration: int("duration").notNull(),
  completed: boolean("completed").default(true).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type SessionHistoryRow = typeof sessionHistory.$inferSelect;
export type InsertSessionHistory = typeof sessionHistory.$inferInsert;

// ─── Favorites ────────────────────────────────────────────────────────────────

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  meditationId: varchar("meditationId", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

// ─── Chat Messages (AI support) ───────────────────────────────────────────────

export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
