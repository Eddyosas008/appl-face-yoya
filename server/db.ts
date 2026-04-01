import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  checkIns,
  journalEntries,
  sessionHistory,
  favorites,
  chatMessages,
  meditations,
  meditationCategories,
  sleepLogs,
  sleepPrograms,
  programDays,
  userProgramProgress,
  type InsertUserProfile,
  type InsertCheckIn,
  type InsertJournalEntry,
  type InsertSessionHistory,
  type InsertChatMessage,
  type InsertMeditation,
  type InsertMeditationCategory,
  type InsertSleepLog,
  type InsertSleepProgram,
  type InsertProgramDay,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── User Profiles ────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserProfile(data: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Partial<InsertUserProfile> = { ...data };
  delete (updateSet as Record<string, unknown>).userId;
  await db.insert(userProfiles).values(data).onDuplicateKeyUpdate({ set: updateSet });
}

export async function updateUserProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userProfiles).set({ ...data, updatedAt: new Date() }).where(eq(userProfiles.userId, userId));
}

export async function incrementSessionStats(userId: number, durationMinutes: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const profile = await getUserProfile(userId);
  if (!profile) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastSession = profile.lastSessionDate ? new Date(profile.lastSessionDate) : null;
  const lastSessionDay = lastSession ? new Date(lastSession.setHours(0, 0, 0, 0)) : null;

  let newStreak = profile.currentStreak;
  if (!lastSessionDay) {
    newStreak = 1;
  } else {
    const diffDays = Math.round((today.getTime() - lastSessionDay.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // same day, streak unchanged
    } else if (diffDays === 1) {
      newStreak = profile.currentStreak + 1;
    } else {
      newStreak = 1;
    }
  }

  await db.update(userProfiles).set({
    totalSessions: profile.totalSessions + 1,
    totalMinutes: profile.totalMinutes + durationMinutes,
    currentStreak: newStreak,
    longestStreak: Math.max(profile.longestStreak, newStreak),
    lastSessionDate: new Date(),
    updatedAt: new Date(),
  }).where(eq(userProfiles.userId, userId));
}

// ─── Check-Ins ─────────────────────────────────────────────────────────────────────

export async function getCheckIns(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checkIns)
    .where(eq(checkIns.userId, userId))
    .orderBy(desc(checkIns.createdAt))
    .limit(limit);
}

export async function createCheckIn(data: InsertCheckIn) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(checkIns).values(data);
  return result[0].insertId;
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

export async function getJournalEntries(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit);
}

export async function createJournalEntry(data: InsertJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(journalEntries).values(data);
  return result[0].insertId;
}

export async function updateJournalEntry(id: number, userId: number, data: Partial<InsertJournalEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(journalEntries)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

export async function deleteJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

// ─── Session History ──────────────────────────────────────────────────────────

export async function getSessionHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionHistory)
    .where(eq(sessionHistory.userId, userId))
    .orderBy(desc(sessionHistory.completedAt))
    .limit(limit);
}

export async function createSession(data: InsertSessionHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessionHistory).values(data);
  await incrementSessionStats(data.userId, data.duration);
  return result[0].insertId;
}

export async function getSessionStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalSessions: 0, totalMinutes: 0, currentStreak: 0, longestStreak: 0 };
  const profile = await getUserProfile(userId);
  return {
    totalSessions: profile?.totalSessions ?? 0,
    totalMinutes: profile?.totalMinutes ?? 0,
    currentStreak: profile?.currentStreak ?? 0,
    longestStreak: profile?.longestStreak ?? 0,
  };
}

// ─── Favorites ──────────────────────────────────────────────────────────────────

export async function getFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(favorites).where(eq(favorites.userId, userId));
  return rows.map((r) => r.meditationId);
}

export async function toggleFavorite(userId: number, meditationId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.meditationId, meditationId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.meditationId, meditationId)));
    return false;
  } else {
    await db.insert(favorites).values({ userId, meditationId });
    return true;
  }
}

// ─── Chat Messages ──────────────────────────────────────────────────────────────

export async function getChatMessages(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

export async function saveChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatMessages).values(data);
  return result[0].insertId;
}

export async function clearChatHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
}

// ─── Meditations Catalog ──────────────────────────────────────────────────────

export async function getMeditations(opts?: {
  categorySlug?: string;
  level?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(meditations);
  const conditions = [eq(meditations.isActive, true)];
  if (opts?.categorySlug) conditions.push(eq(meditations.categorySlug, opts.categorySlug));
  if (opts?.level) conditions.push(eq(meditations.level, opts.level as "beginner" | "intermediate" | "advanced"));
  if (opts?.isPremium !== undefined) conditions.push(eq(meditations.isPremium, opts.isPremium));
  if (opts?.isFeatured !== undefined) conditions.push(eq(meditations.isFeatured, opts.isFeatured));
  return query
    .where(and(...conditions))
    .orderBy(asc(meditations.sortOrder), desc(meditations.playCount))
    .limit(opts?.limit ?? 100);
}

export async function getMeditationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(meditations)
    .where(and(eq(meditations.slug, slug), eq(meditations.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getMeditationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(meditations)
    .where(eq(meditations.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function incrementPlayCount(meditationId: number) {
  const db = await getDb();
  if (!db) return;
  const current = await getMeditationById(meditationId);
  if (!current) return;
  await db.update(meditations)
    .set({ playCount: current.playCount + 1, updatedAt: new Date() })
    .where(eq(meditations.id, meditationId));
}

export async function upsertMeditation(data: InsertMeditation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Partial<InsertMeditation> = { ...data };
  delete (updateSet as Record<string, unknown>).slug;
  await db.insert(meditations).values(data).onDuplicateKeyUpdate({ set: updateSet });
}

export async function updateMeditationAudioUrl(
  slug: string,
  audioUrl: string | null,
  audioDurationSeconds?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  type UpdateFields = { audioUrl: string | null; audioDurationSeconds?: number };
  const updateData: UpdateFields = { audioUrl };
  if (audioDurationSeconds !== undefined) updateData.audioDurationSeconds = audioDurationSeconds;
  await db.update(meditations).set(updateData).where(eq(meditations.slug, slug));
}

export async function getMeditationCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(meditationCategories)
    .where(eq(meditationCategories.isActive, true))
    .orderBy(asc(meditationCategories.sortOrder));
}

export async function upsertMeditationCategory(data: InsertMeditationCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Partial<InsertMeditationCategory> = { ...data };
  delete (updateSet as Record<string, unknown>).slug;
  await db.insert(meditationCategories).values(data).onDuplicateKeyUpdate({ set: updateSet });
}

// ──// ─// ─── Sleep Programs ───────────────────────────────────────────────

export async function getSleepPrograms(opts?: { targetIssue?: string }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(sleepPrograms).where(eq(sleepPrograms.isActive, true));
  return query.orderBy(asc(sleepPrograms.sortOrder));
}

export async function getSleepProgramBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(sleepPrograms).where(eq(sleepPrograms.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getProgramDays(programSlug: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(programDays)
    .where(eq(programDays.programSlug, programSlug))
    .orderBy(asc(programDays.dayNumber));
}

export async function getProgramDay(programSlug: string, dayNumber: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(programDays)
    .where(and(eq(programDays.programSlug, programSlug), eq(programDays.dayNumber, dayNumber)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getUserProgramProgress(userId: number, programSlug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(userProgramProgress)
    .where(and(eq(userProgramProgress.userId, userId), eq(userProgramProgress.programSlug, programSlug)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllUserPrograms(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgramProgress).where(eq(userProgramProgress.userId, userId));
}

export async function startProgram(userId: number, programSlug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserProgramProgress(userId, programSlug);
  if (existing) return existing;
  await db.insert(userProgramProgress).values({
    userId,
    programSlug,
    currentDay: 1,
    completedDays: "[]",
    isCompleted: false,
    startedAt: new Date(),
    lastActivityAt: new Date(),
  });
  // Increment enrollment count
  const prog = await getSleepProgramBySlug(programSlug);
  if (prog) {
    await db.update(sleepPrograms)
      .set({ totalEnrollments: prog.totalEnrollments + 1 })
      .where(eq(sleepPrograms.slug, programSlug));
  }
  return getUserProgramProgress(userId, programSlug);
}

export async function completeProgramDay(userId: number, programSlug: string, dayNumber: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const progress = await getUserProgramProgress(userId, programSlug);
  if (!progress) throw new Error("Program not started");
  const completedDays: number[] = JSON.parse(progress.completedDays || "[]");
  if (!completedDays.includes(dayNumber)) completedDays.push(dayNumber);
  const prog = await getSleepProgramBySlug(programSlug);
  const isCompleted = prog ? completedDays.length >= prog.durationDays : false;
  await db.update(userProgramProgress)
    .set({
      completedDays: JSON.stringify(completedDays),
      currentDay: Math.min(dayNumber + 1, prog?.durationDays ?? dayNumber + 1),
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
      lastActivityAt: new Date(),
    })
    .where(and(eq(userProgramProgress.userId, userId), eq(userProgramProgress.programSlug, programSlug)));
}

export async function upsertSleepProgram(data: InsertSleepProgram) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Partial<InsertSleepProgram> = { ...data };
  delete (updateSet as Record<string, unknown>).slug;
  await db.insert(sleepPrograms).values(data).onDuplicateKeyUpdate({ set: updateSet });
}

export async function upsertProgramDay(data: InsertProgramDay) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(programDays).values(data).onDuplicateKeyUpdate({ set: { ...data } });
}

// ─── Sleep Logs ───────────────────────────────────────────────────────────────────────

export async function createSleepLog(data: InsertSleepLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(sleepLogs).values(data);
  return result;
}

export async function getSleepLogs(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(sleepLogs)
    .where(eq(sleepLogs.userId, userId))
    .orderBy(desc(sleepLogs.sleepDate))
    .limit(limit);
}

export async function getSleepLogByDate(userId: number, sleepDate: string) {
  const db = await getDb();
  if (!db) return null;
  const [log] = await db
    .select()
    .from(sleepLogs)
    .where(and(eq(sleepLogs.userId, userId), eq(sleepLogs.sleepDate, sleepDate)))
    .limit(1);
  return log ?? null;
}

export async function updateSleepLog(id: number, userId: number, data: Partial<InsertSleepLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(sleepLogs)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(sleepLogs.id, id), eq(sleepLogs.userId, userId)));
}

export async function deleteSleepLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sleepLogs).where(and(eq(sleepLogs.id, id), eq(sleepLogs.userId, userId)));
}

export async function getSleepStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const logs = await db
    .select()
    .from(sleepLogs)
    .where(eq(sleepLogs.userId, userId))
    .orderBy(desc(sleepLogs.sleepDate))
    .limit(30);

  if (logs.length === 0) return null;

  const logsWithDuration = logs.filter((l) => l.durationMinutes != null && l.durationMinutes > 0);
  const logsWithQuality = logs.filter((l) => l.quality != null && l.quality > 0);

  const avgDuration =
    logsWithDuration.length > 0
      ? Math.round(logsWithDuration.reduce((s, l) => s + (l.durationMinutes ?? 0), 0) / logsWithDuration.length)
      : 0;

  const avgQuality =
    logsWithQuality.length > 0
      ? Math.round((logsWithQuality.reduce((s, l) => s + (l.quality ?? 0), 0) / logsWithQuality.length) * 10) / 10
      : 0;

  const bestNight = logsWithDuration.reduce(
    (best, l) => ((l.durationMinutes ?? 0) > (best?.durationMinutes ?? 0) ? l : best),
    logsWithDuration[0] ?? null
  );

  const SLEEP_GOAL_MINUTES = 450; // 7h30
  const nightsAtGoal = logsWithDuration.filter((l) => (l.durationMinutes ?? 0) >= SLEEP_GOAL_MINUTES).length;

  return {
    totalLogs: logs.length,
    avgDurationMinutes: avgDuration,
    avgQuality,
    bestNightMinutes: bestNight?.durationMinutes ?? 0,
    nightsAtGoal,
    goalMinutes: SLEEP_GOAL_MINUTES,
    last7Days: logs.slice(0, 7),
  };
}
