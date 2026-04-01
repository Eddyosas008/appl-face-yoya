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

// ─── Meditation Categories ────────────────────────────────────────────────────────────────────────────────

export const meditationCategories = mysqlTable("meditationCategories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),       // ex: "stress", "sleep", "focus"
  name: varchar("name", { length: 100 }).notNull(),               // ex: "Stress & Anxiété"
  emoji: varchar("emoji", { length: 10 }),                        // ex: "🌿"
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeditationCategory = typeof meditationCategories.$inferSelect;
export type InsertMeditationCategory = typeof meditationCategories.$inferInsert;

// ─── Meditations Catalog ───────────────────────────────────────────────────────────────────────────────────────
// Central catalog of all guided meditations. Audio files are hosted externally
// (CDN, S3, or public URL). This table is the single source of truth for content.

export const meditations = mysqlTable("meditations", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),      // ex: "souffle-du-soir"
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),                 // ex: "Méditation guidée pour s'endormir"
  description: text("description"),
  // Audio
  audioUrl: text("audioUrl").notNull(),                           // URL du fichier MP3/M4A
  audioDurationSeconds: int("audioDurationSeconds").default(0).notNull(), // durée exacte en secondes
  audioSizeBytes: int("audioSizeBytes").default(0),               // taille fichier (optionnel)
  // Categorisation
  categorySlug: varchar("categorySlug", { length: 50 }).notNull(), // FK vers meditationCategories.slug
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  tags: text("tags"),                                             // JSON array ex: '["sommeil","relaxation"]'
  // Contenu
  instructor: varchar("instructor", { length: 100 }).default("Yoya").notNull(),
  language: varchar("language", { length: 10 }).default("fr").notNull(),
  scriptText: text("scriptText"),                                 // Texte de la méditation (optionnel)
  // Visuel
  coverColor: varchar("coverColor", { length: 20 }).default("#7C3AED"), // couleur de fond de la carte
  coverImageUrl: text("coverImageUrl"),                           // URL image de couverture (optionnel)
  // Accès
  isPremium: boolean("isPremium").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),     // mise en avant sur le dashboard
  sortOrder: int("sortOrder").default(0).notNull(),
  // Stats
  playCount: int("playCount").default(0).notNull(),               // nombre total d'écoutes
  averageRating: int("averageRating").default(0),                 // note moyenne x10 (ex: 45 = 4.5/5)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meditation = typeof meditations.$inferSelect;
export type InsertMeditation = typeof meditations.$inferInsert;

// ─── Meditation Ratings (user ratings) ────────────────────────────────────────────────────────────────────────────

export const meditationRatings = mysqlTable("meditationRatings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  meditationId: int("meditationId").notNull(),
  rating: int("rating").notNull(),                                // 1-5
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeditationRating = typeof meditationRatings.$inferSelect;
export type InsertMeditationRating = typeof meditationRatings.$inferInsert;
