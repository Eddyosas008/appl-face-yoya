import { and, asc, desc, eq, gt, gte, isNull, sum } from "drizzle-orm";
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
  ambientSounds,
  type AmbientSound,
  type InsertAmbientSound,
  emailAuth,
  passwordResets,
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

export async function getTodayMinutes(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = await db
    .select({ total: sum(sessionHistory.duration) })
    .from(sessionHistory)
    .where(and(eq(sessionHistory.userId, userId), gte(sessionHistory.completedAt, today)));
  return Number(rows[0]?.total ?? 0);
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

export async function completeProgramDay(userId: number, programSlug: string, dayNumber: number): Promise<{ isCompleted: boolean }> {
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
  return { isCompleted };
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

// Mettre à jour uniquement l'audio d'un jour de programme
export async function updateProgramDayAudio(
  programSlug: string,
  dayNumber: number,
  audioUrl: string | null,
  audioDurationSeconds: number = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(programDays)
    .set({ audioUrl: audioUrl ?? undefined, audioDurationSeconds })
    .where(and(eq(programDays.programSlug, programSlug), eq(programDays.dayNumber, dayNumber)));
}

// Retourne les programmes en cours (démarrés mais non terminés)
export async function getInProgressPrograms(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const progresses = await db
    .select()
    .from(userProgramProgress)
    .where(and(eq(userProgramProgress.userId, userId), eq(userProgramProgress.isCompleted, false)))
    .orderBy(desc(userProgramProgress.lastActivityAt));
  if (progresses.length === 0) return [];
  const results = await Promise.all(
    progresses.map(async (prog) => {
      const program = await getSleepProgramBySlug(prog.programSlug);
      const completedDays: number[] = JSON.parse(prog.completedDays || "[]");
      const totalDays = program?.durationDays ?? 1;
      const progressPct = Math.round((completedDays.length / totalDays) * 100);
      return {
        ...prog,
        programTitle: program?.title ?? prog.programSlug,
        programEmoji: program?.emoji ?? "🌙",
        programDurationDays: totalDays,
        programCoverColor: program?.coverColor ?? "#1E1B4B",
        programCoverColor2: program?.coverColor2 ?? "#312E81",
        programLevel: program?.level ?? "beginner",
        completedDaysCount: completedDays.length,
        progressPct,
        nextDay: prog.currentDay,
      };
    })
  );
  return results;
}

// Retourne les programmes terminés avec les infos du programme associé
export async function getCompletedPrograms(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Récupérer toutes les progressions terminées
  const progresses = await db
    .select()
    .from(userProgramProgress)
    .where(and(eq(userProgramProgress.userId, userId), eq(userProgramProgress.isCompleted, true)))
    .orderBy(desc(userProgramProgress.completedAt));
  if (progresses.length === 0) return [];
  // Pour chaque progression, récupérer les infos du programme
  const results = await Promise.all(
    progresses.map(async (prog) => {
      const program = await getSleepProgramBySlug(prog.programSlug);
      const completedDays: number[] = JSON.parse(prog.completedDays || "[]");
      return {
        ...prog,
        programTitle: program?.title ?? prog.programSlug,
        programEmoji: program?.emoji ?? "🌙",
        programDurationDays: program?.durationDays ?? completedDays.length,
        programCoverColor: program?.coverColor ?? "#1E1B4B",
        programCoverColor2: program?.coverColor2 ?? "#312E81",
        programLevel: program?.level ?? "beginner",
        completedDaysCount: completedDays.length,
      };
    })
  );
  return results;
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

// ─── Statistiques avancées 30 jours ──────────────────────────────────────────

export async function getMood30Days(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];
  const rows = await db
    .select({ createdAt: checkIns.createdAt, mood: checkIns.mood })
    .from(checkIns)
    .where(eq(checkIns.userId, userId))
    .orderBy(asc(checkIns.createdAt))
    .limit(60);
  const byDate = new Map<string, string>();
  for (const row of rows) {
    const rowDate = row.createdAt instanceof Date
      ? row.createdAt.toISOString().split("T")[0]
      : String(row.createdAt).split("T")[0];
    if (rowDate >= dateStr) {
      byDate.set(rowDate, row.mood ?? "neutral");
    }
  }
  return Array.from(byDate.entries()).map(([date, mood]) => ({ date, mood }));
}

export async function getSleep30Days(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];
  const rows = await db
    .select({
      sleepDate: sleepLogs.sleepDate,
      durationMinutes: sleepLogs.durationMinutes,
      quality: sleepLogs.quality,
    })
    .from(sleepLogs)
    .where(eq(sleepLogs.userId, userId))
    .orderBy(asc(sleepLogs.sleepDate))
    .limit(60);
  return rows.filter((r) => r.sleepDate >= dateStr);
}

export async function getSessions30Days(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const rows = await db
    .select({
      completedAt: sessionHistory.completedAt,
      duration: sessionHistory.duration,
      category: sessionHistory.category,
    })
    .from(sessionHistory)
    .where(eq(sessionHistory.userId, userId))
    .orderBy(asc(sessionHistory.completedAt))
    .limit(200);
  return rows.filter((r) => {
    if (!r.completedAt) return false;
    return new Date(r.completedAt) >= thirtyDaysAgo;
  });
}

export async function getWellnessScore(userId: number): Promise<{
  score: number;
  moodScore: number;
  sleepScore: number;
  consistencyScore: number;
  label: string;
}> {
  const db = await getDb();
  if (!db) return { score: 0, moodScore: 0, sleepScore: 0, consistencyScore: 0, label: "Pas de données" };

  const MOOD_WEIGHTS: Record<string, number> = {
    happy: 5, grateful: 5, calm: 4, neutral: 3,
    tired: 2, anxious: 2, sad: 1, overwhelmed: 1,
  };

  const moodData = await getMood30Days(userId);
  const recentMoods = moodData.slice(-7);
  const moodScore = recentMoods.length > 0
    ? Math.round((recentMoods.reduce((s, m) => s + (MOOD_WEIGHTS[m.mood] ?? 3), 0) / recentMoods.length) * 20)
    : 0;

  const sleepData = await getSleep30Days(userId);
  const recentSleep = sleepData.slice(-7);
  const avgDuration = recentSleep.length > 0
    ? recentSleep.reduce((s, l) => s + (l.durationMinutes ?? 0), 0) / recentSleep.length
    : 0;
  const avgQuality = recentSleep.length > 0
    ? recentSleep.reduce((s, l) => s + (l.quality ?? 0), 0) / recentSleep.length
    : 0;
  const durationScore = Math.min(100, (avgDuration / 480) * 100);
  const qualityScore = (avgQuality / 5) * 100;
  const sleepScore = Math.round((durationScore + qualityScore) / 2);

  const sessionsData = await getSessions30Days(userId);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const recentSessions = sessionsData.filter(
    (s) => s.completedAt && new Date(s.completedAt) >= sevenDaysAgo
  );
  const consistencyScore = Math.min(100, Math.round((recentSessions.length / 7) * 100));

  const score = Math.round((moodScore * 0.35) + (sleepScore * 0.45) + (consistencyScore * 0.20));
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Bon" : score >= 40 ? "Moyen" : "À améliorer";

  return { score, moodScore, sleepScore, consistencyScore, label };
}

// ─── Ambient Sounds ───────────────────────────────────────────────────────────
export async function getAmbientSounds(opts?: { category?: string; includeInactive?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(ambientSounds).$dynamic();
  if (!opts?.includeInactive) {
    query = query.where(eq(ambientSounds.isActive, true));
  }
  if (opts?.category) {
    query = query.where(eq(ambientSounds.category, opts.category));
  }
  return query.orderBy(asc(ambientSounds.sortOrder), asc(ambientSounds.name));
}

export async function getAmbientSoundBySlug(slug: string): Promise<AmbientSound | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(ambientSounds).where(eq(ambientSounds.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function upsertAmbientSound(data: InsertAmbientSound) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select({ id: ambientSounds.id }).from(ambientSounds)
    .where(eq(ambientSounds.slug, data.slug)).limit(1);
  if (existing.length > 0) {
    await db.update(ambientSounds).set(data).where(eq(ambientSounds.slug, data.slug));
  } else {
    await db.insert(ambientSounds).values(data);
  }
}

// ─── Email/Password Authentication ───────────────────────────────────────────

export async function createEmailUser(data: {
  email: string;
  passwordHash: string;
  name?: string;
}): Promise<{ userId: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Create user in the main users table with a synthetic openId
  const openId = `email:${data.email}`;
  await db.insert(users).values({
    openId,
    email: data.email,
    name: data.name ?? data.email.split("@")[0],
    loginMethod: "email",
    lastSignedIn: new Date(),
  }).onDuplicateKeyUpdate({ set: { lastSignedIn: new Date() } });

  const userRow = await db.select({ id: users.id }).from(users).where(eq(users.openId, openId)).limit(1);
  if (!userRow[0]) throw new Error("Failed to create user");
  const userId = userRow[0].id;

  // Store hashed password in emailAuth table
  await db.insert(emailAuth).values({
    userId,
    email: data.email,
    passwordHash: data.passwordHash,
    emailVerified: false,
  }).onDuplicateKeyUpdate({ set: { passwordHash: data.passwordHash } });

  return { userId };
}

export async function getEmailAuthByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({
      id: emailAuth.id,
      userId: emailAuth.userId,
      email: emailAuth.email,
      passwordHash: emailAuth.passwordHash,
      emailVerified: emailAuth.emailVerified,
    })
    .from(emailAuth)
    .where(eq(emailAuth.email, email))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEmailAuthByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({
      id: emailAuth.id,
      userId: emailAuth.userId,
      email: emailAuth.email,
      passwordHash: emailAuth.passwordHash,
      emailVerified: emailAuth.emailVerified,
    })
    .from(emailAuth)
    .where(eq(emailAuth.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

// ─── Password Reset Tokens ────────────────────────────────────────────────────

export async function createPasswordResetToken(userId: number, token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  // Invalidate previous tokens for this user
  await db.delete(passwordResets).where(
    and(eq(passwordResets.userId, userId), isNull(passwordResets.usedAt))
  );
  await db.insert(passwordResets).values({ userId, token, expiresAt });
}

export async function getValidPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const rows = await db
    .select()
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.token, token),
        gt(passwordResets.expiresAt, now),
        isNull(passwordResets.usedAt)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function consumePasswordResetToken(token: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const row = await getValidPasswordResetToken(token);
  if (!row) return null;
  await db.update(passwordResets)
    .set({ usedAt: new Date() })
    .where(eq(passwordResets.token, token));
  return row.userId;
}

export async function updateEmailPassword(userId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailAuth)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(emailAuth.userId, userId));
}
