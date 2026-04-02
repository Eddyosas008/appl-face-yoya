import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  clearChatHistory,
  completeProgramDay,
  createCheckIn,
  createJournalEntry,
  createSession,
  createSleepLog,
  deleteJournalEntry,
  deleteSleepLog,
  getAllUserPrograms,
  getChatMessages,
  getCheckIns,
  getCompletedPrograms,
  getFavorites,
  getInProgressPrograms,
  getJournalEntries,
  getMeditationBySlug,
  getMeditationCategories,
  getMeditations,
  getProgramDay,
  getProgramDays,
  getSessionHistory,
  getSessionStats,
  getSleepLogByDate,
  getSleepLogs,
  getSleepProgramBySlug,
  getSleepPrograms,
  getSleepStats,
  getUserProfile,
  getUserProgramProgress,
  incrementPlayCount,
  saveChatMessage,
  startProgram,
  toggleFavorite,
  updateJournalEntry,
  updateProgramDayAudio,
  updateSleepLog,
  updateUserProfile,
  upsertMeditation,
  upsertMeditationCategory,
  upsertProgramDay,
  upsertSleepProgram,
  upsertUserProfile,
  getMood30Days,
  getSleep30Days,
  getSessions30Days,
  getWellnessScore,
} from "./db";
// Namespace alias pour compatibilité avec le code existant utilisant db.xxx
const db = {
  clearChatHistory,
  completeProgramDay,
  createCheckIn,
  createJournalEntry,
  createSession,
  createSleepLog,
  deleteJournalEntry,
  deleteSleepLog,
  getAllUserPrograms,
  getChatMessages,
  getCheckIns,
  getCompletedPrograms,
  getFavorites,
  getInProgressPrograms,
  getJournalEntries,
  getMeditationBySlug,
  getMeditationCategories,
  getMeditations,
  getProgramDay,
  getProgramDays,
  getSessionHistory,
  getSessionStats,
  getSleepLogByDate,
  getSleepLogs,
  getSleepProgramBySlug,
  getSleepPrograms,
  getSleepStats,
  getUserProfile,
  getUserProgramProgress,
  incrementPlayCount,
  saveChatMessage,
  startProgram,
  toggleFavorite,
  updateJournalEntry,
  updateProgramDayAudio,
  updateSleepLog,
  updateUserProfile,
  upsertMeditation,
  upsertMeditationCategory,
  upsertProgramDay,
  upsertSleepProgram,
  upsertUserProfile,
  getMood30Days,
  getSleep30Days,
  getSessions30Days,
  getWellnessScore,
};

const MoodEnum = z.enum(["anxious", "sad", "neutral", "calm", "happy", "energetic", "grateful"]);

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ───────────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── User Profile ────────────────────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProfile(ctx.user.id);
    }),

    upsert: protectedProcedure
      .input(z.object({
        firstName: z.string().max(100).optional(),
        ageRange: z.string().max(20).optional(),
        mainGoal: z.string().max(50).optional(),
        meditationLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        preferredDuration: z.number().min(1).max(60).optional(),
        guidanceTone: z.enum(["gentle", "motivating", "neutral"]).optional(),
        isOnboarded: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserProfile({ userId: ctx.user.id, ...input });
        return db.getUserProfile(ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        firstName: z.string().max(100).optional(),
        ageRange: z.string().max(20).optional(),
        mainGoal: z.string().max(50).optional(),
        meditationLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        preferredDuration: z.number().min(1).max(60).optional(),
        guidanceTone: z.enum(["gentle", "motivating", "neutral"]).optional(),
        isPremium: z.boolean().optional(),
        isOnboarded: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return db.getUserProfile(ctx.user.id);
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getSessionStats(ctx.user.id);
    }),
  }),

  // ─── Check-Ins ───────────────────────────────────────────────────────────────────
  checkIns: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(30) }).optional())
      .query(async ({ ctx, input }) => {
        return db.getCheckIns(ctx.user.id, input?.limit ?? 30);
      }),

    create: protectedProcedure
      .input(z.object({
        mood: MoodEnum,
        intensity: z.number().min(1).max(10).default(5),
        note: z.string().max(1000).optional(),
        triggers: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createCheckIn({ userId: ctx.user.id, ...input });
        return { id };
      }),
  }),

  // ─── Journal ───────────────────────────────────────────────────────────────────────
  journal: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return db.getJournalEntries(ctx.user.id, input?.limit ?? 50);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().max(255).optional(),
        content: z.string().min(1).max(10000),
        mood: MoodEnum.optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createJournalEntry({ userId: ctx.user.id, ...input });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().max(255).optional(),
        content: z.string().min(1).max(10000).optional(),
        mood: MoodEnum.optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateJournalEntry(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteJournalEntry(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Sessions ────────────────────────────────────────────────────────────────────
  sessions: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return db.getSessionHistory(ctx.user.id, input?.limit ?? 50);
      }),

    complete: protectedProcedure
      .input(z.object({
        meditationId: z.string().max(100),
        meditationTitle: z.string().max(255),
        category: z.string().max(100).optional(),
        duration: z.number().min(1).max(120),
        completed: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createSession({ userId: ctx.user.id, ...input });
        const stats = await db.getSessionStats(ctx.user.id);
        return { id, stats };
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getSessionStats(ctx.user.id);
    }),
  }),

  // ─── Favorites ─────────────────────────────────────────────────────────────────
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getFavorites(ctx.user.id);
    }),

    toggle: protectedProcedure
      .input(z.object({ meditationId: z.string().max(100) }))
      .mutation(async ({ ctx, input }) => {
        const added = await db.toggleFavorite(ctx.user.id, input.meditationId);
        return { added };
      }),
  }),

  // ─── Meditations Catalog ────────────────────────────────────────────────────
  catalog: router({
    // Public: list all active meditations (no auth required)
    list: publicProcedure
      .input(z.object({
        categorySlug: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        isFeatured: z.boolean().optional(),
        limit: z.number().min(1).max(200).default(100),
      }).optional())
      .query(async ({ input }) => {
        return db.getMeditations(input);
      }),

    // Public: get a single meditation by slug
    get: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getMeditationBySlug(input.slug);
      }),

    // Public: list all active categories
    categories: publicProcedure.query(async () => {
      return db.getMeditationCategories();
    }),

    // Protected: increment play count when user starts a meditation
    played: protectedProcedure
      .input(z.object({ meditationDbId: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementPlayCount(input.meditationDbId);
        return { success: true };
      }),

    // Admin: upsert a meditation (for seeding or admin panel)
    upsert: protectedProcedure
      .input(z.object({
        slug: z.string().max(100),
        title: z.string().max(255),
        subtitle: z.string().max(255).optional(),
        description: z.string().optional(),
        audioUrl: z.string().url(),
        audioDurationSeconds: z.number().default(0),
        categorySlug: z.string().max(50),
        level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
        tags: z.string().optional(),
        instructor: z.string().max(100).default("Yoya"),
        scriptText: z.string().optional(),
        coverColor: z.string().max(20).optional(),
        coverImageUrl: z.string().optional(),
        isPremium: z.boolean().default(false),
        isFeatured: z.boolean().default(false),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admin can upsert catalog content
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.upsertMeditation(input);
        return { success: true };
      }),

    // Admin: upsert a category
    upsertCategory: protectedProcedure
      .input(z.object({
        slug: z.string().max(50),
        name: z.string().max(100),
        emoji: z.string().max(10).optional(),
        description: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.upsertMeditationCategory({ ...input, isActive: true });
        return { success: true };
      }),
  }),

  // ─── Chat IA ────────────────────────────────────────────────────────────────────
  chat: router({
    history: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const messages = await db.getChatMessages(ctx.user.id, input?.limit ?? 50);
        return messages.reverse(); // chronological order
      }),

    send: protectedProcedure
      .input(z.object({ message: z.string().min(1).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        await db.saveChatMessage({ userId: ctx.user.id, role: "user", content: input.message });

        const history = await db.getChatMessages(ctx.user.id, 10);
        const contextMessages = history.reverse().map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

        const profile = await db.getUserProfile(ctx.user.id);

        const systemPrompt = `Tu es Yoya, une assistante bienveillante et empathique spécialisée dans le bien-être émotionnel, la méditation et la pleine conscience. Tu accompagnes des femmes dans leur voyage vers l'équilibre intérieur.

Ton style : chaleureux, doux, empathique, encourageant. Tu utilises le tutoiement avec douceur. Tu proposes des exercices pratiques quand c'est pertinent. Tu ne remplaces pas un professionnel de santé mentale.

${profile ? `Prénom : ${profile.firstName ?? "non renseigné"} | Objectif : ${profile.mainGoal ?? "bien-être général"} | Niveau : ${profile.meditationLevel ?? "débutant"}` : ""}

Réponds toujours en français. Sois concise (2-4 paragraphes max) mais profonde.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...contextMessages,
            { role: "user", content: input.message },
          ],
        });

        const rawContent = response.choices[0]?.message?.content;
        const reply = (typeof rawContent === "string" ? rawContent : null) ?? "Je suis là pour toi. Comment te sens-tu en ce moment ?";

        await db.saveChatMessage({ userId: ctx.user.id, role: "assistant", content: reply });

        return { reply };
      }),

     clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearChatHistory(ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── Sleep Programs ─────────────────────────────────────────────────────────────
  programs: router({
    // Liste tous les programmes actifs
    list: publicProcedure
      .input(z.object({ targetIssue: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getSleepPrograms(input ?? {});
      }),

    // Détail d'un programme + ses jours
    get: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const program = await db.getSleepProgramBySlug(input.slug);
        if (!program) throw new Error("Programme introuvable");
        const days = await db.getProgramDays(input.slug);
        return { ...program, days };
      }),

    // Détail d'un jour spécifique
    getDay: publicProcedure
      .input(z.object({ programSlug: z.string(), dayNumber: z.number() }))
      .query(async ({ input }) => {
        return db.getProgramDay(input.programSlug, input.dayNumber);
      }),

    // Progression de l'utilisateur sur un programme
    progress: protectedProcedure
      .input(z.object({ programSlug: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getUserProgramProgress(ctx.user.id, input.programSlug);
      }),

    // Tous les programmes de l'utilisateur
    myPrograms: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllUserPrograms(ctx.user.id);
    }),

    // Programmes terminés avec détail du programme
    completed: protectedProcedure.query(async ({ ctx }) => {
      return db.getCompletedPrograms(ctx.user.id);
    }),

    // Programmes en cours (démarrés mais non terminés)
    inProgress: protectedProcedure.query(async ({ ctx }) => {
      return db.getInProgressPrograms(ctx.user.id);
    }),

    // Démarrer un programme
    start: protectedProcedure
      .input(z.object({ programSlug: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return db.startProgram(ctx.user.id, input.programSlug);
      }),

    // Marquer un jour comme complété
    completeDay: protectedProcedure
      .input(z.object({ programSlug: z.string(), dayNumber: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.completeProgramDay(ctx.user.id, input.programSlug, input.dayNumber);
        return { success: true, isProgramCompleted: result.isCompleted };
      }),

    // Admin : créer/mettre à jour un programme
    upsert: protectedProcedure
      .input(z.object({
        slug: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        durationDays: z.number(),
        targetIssue: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        isPremium: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        coverColor: z.string().optional(),
        coverColor2: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertSleepProgram(input as Parameters<typeof db.upsertSleepProgram>[0]);
        return { success: true };
      }),

    // Admin : créer/mettre à jour un jour de programme
    upsertDay: protectedProcedure
      .input(z.object({
        programSlug: z.string(),
        dayNumber: z.number(),
        title: z.string(),
        theme: z.string().optional(),
        description: z.string().optional(),
        meditationSlug: z.string().optional(),
        breathingExercise: z.string().optional(),
        ambientSound: z.string().optional(),
        eveningRoutine: z.string().optional(),
        sleepTip: z.string().optional(),
        journalPrompt: z.string().optional(),
        estimatedMinutes: z.number().optional(),
        audioUrl: z.string().nullable().optional(),
        audioDurationSeconds: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertProgramDay(input as Parameters<typeof db.upsertProgramDay>[0]);
        return { success: true };
      }),

    // Admin : mettre à jour uniquement l'audio d'un jour de programme
    updateDayAudio: protectedProcedure
      .input(z.object({
        programSlug: z.string(),
        dayNumber: z.number(),
        audioUrl: z.string().nullable(),
        audioDurationSeconds: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        await db.updateProgramDayAudio(
          input.programSlug,
          input.dayNumber,
          input.audioUrl,
          input.audioDurationSeconds ?? 0
        );
        return { success: true };
      }),

    // Récupérer tous les jours d'un programme (admin + utilisateur)
    getDays: protectedProcedure
      .input(z.object({ programSlug: z.string() }))
      .query(async ({ input }) => {
        return db.getProgramDays(input.programSlug);
      }),
  }),

  // ─── Sleep Tracking ───────────────────────────────────────────────────────────────────────
  sleep: router({
    // Lister les logs de sommeil
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getSleepLogs(ctx.user.id, input?.limit ?? 30);
      }),

    // Récupérer le log d'une date spécifique
    getByDate: protectedProcedure
      .input(z.object({ sleepDate: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getSleepLogByDate(ctx.user.id, input.sleepDate);
      }),

    // Créer un log de sommeil
    create: protectedProcedure
      .input(z.object({
        sleepDate: z.string(),
        bedtime: z.string().optional(),
        wakeTime: z.string().optional(),
        durationMinutes: z.number().optional(),
        quality: z.number().min(1).max(5).optional(),
        hadNightWaking: z.boolean().optional(),
        nightWakings: z.number().optional(),
        dreamRecall: z.boolean().optional(),
        notes: z.string().optional(),
        eveningMood: MoodEnum.optional(),
        usedMeditation: z.boolean().optional(),
        usedBreathing: z.boolean().optional(),
        usedAmbient: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let durationMinutes = input.durationMinutes;
        if (!durationMinutes && input.bedtime && input.wakeTime) {
          const [bH, bM] = input.bedtime.split(":").map(Number);
          const [wH, wM] = input.wakeTime.split(":").map(Number);
          let bedMins = bH * 60 + bM;
          let wakeMins = wH * 60 + wM;
          if (wakeMins < bedMins) wakeMins += 24 * 60;
          durationMinutes = wakeMins - bedMins;
        }
        await db.createSleepLog({ ...input, userId: ctx.user.id, durationMinutes });
        return { success: true };
      }),

    // Mettre à jour un log
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        bedtime: z.string().optional(),
        wakeTime: z.string().optional(),
        durationMinutes: z.number().optional(),
        quality: z.number().min(1).max(5).optional(),
        hadNightWaking: z.boolean().optional(),
        nightWakings: z.number().optional(),
        dreamRecall: z.boolean().optional(),
        notes: z.string().optional(),
        eveningMood: MoodEnum.optional(),
        usedMeditation: z.boolean().optional(),
        usedBreathing: z.boolean().optional(),
        usedAmbient: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        let durationMinutes = data.durationMinutes;
        if (!durationMinutes && data.bedtime && data.wakeTime) {
          const [bH, bM] = data.bedtime.split(":").map(Number);
          const [wH, wM] = data.wakeTime.split(":").map(Number);
          let bedMins = bH * 60 + bM;
          let wakeMins = wH * 60 + wM;
          if (wakeMins < bedMins) wakeMins += 24 * 60;
          durationMinutes = wakeMins - bedMins;
        }
        await db.updateSleepLog(id, ctx.user.id, { ...data, durationMinutes });
        return { success: true };
      }),

    // Supprimer un log
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteSleepLog(input.id, ctx.user.id);
        return { success: true };
      }),

    // Statistiques globales de sommeil
    stats: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getSleepStats(ctx.user.id);
      }),

    // Rapport hebdomadaire de sommeil (7 derniers jours vs 7 jours précédents)
    weeklyReport: protectedProcedure
      .query(async ({ ctx }) => {
        const logs = await db.getSleepLogs(ctx.user.id, 14);
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);

        const thisWeek = logs.filter((l) => new Date(l.sleepDate) >= sevenDaysAgo);
        const lastWeek = logs.filter((l) => {
          const d = new Date(l.sleepDate);
          return d >= fourteenDaysAgo && d < sevenDaysAgo;
        });

        const avg = (arr: typeof logs, field: 'durationMinutes' | 'quality') => {
          const vals = arr.map((l) => l[field]).filter((v): v is number => v != null);
          return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
        };

        const thisAvgDuration = avg(thisWeek, 'durationMinutes');
        const lastAvgDuration = avg(lastWeek, 'durationMinutes');
        const thisAvgQuality = avg(thisWeek, 'quality');
        const lastAvgQuality = avg(lastWeek, 'quality');

        const durationTrend = thisAvgDuration != null && lastAvgDuration != null
          ? thisAvgDuration > lastAvgDuration ? 'up' : thisAvgDuration < lastAvgDuration ? 'down' : 'stable'
          : 'stable';
        const qualityTrend = thisAvgQuality != null && lastAvgQuality != null
          ? thisAvgQuality > lastAvgQuality ? 'up' : thisAvgQuality < lastAvgQuality ? 'down' : 'stable'
          : 'stable';

        return {
          thisWeek: {
            nights: thisWeek.length,
            avgDurationMinutes: thisAvgDuration,
            avgQuality: thisAvgQuality,
          },
          lastWeek: {
            nights: lastWeek.length,
            avgDurationMinutes: lastAvgDuration,
            avgQuality: lastAvgQuality,
          },
          trends: { duration: durationTrend, quality: qualityTrend },
          dailyData: thisWeek.map((l) => ({
            date: l.sleepDate,
            durationMinutes: l.durationMinutes,
            quality: l.quality,
          })),
        };
      }),
  }),

  // ─── Statistiques avancées ─────────────────────────────────────────────────
  stats: router({
    mood30: protectedProcedure.query(async ({ ctx }) => {
      return getMood30Days(ctx.user.id);
    }),

    sleep30: protectedProcedure.query(async ({ ctx }) => {
      return getSleep30Days(ctx.user.id);
    }),

    sessions30: protectedProcedure.query(async ({ ctx }) => {
      return getSessions30Days(ctx.user.id);
    }),

    wellnessScore: protectedProcedure.query(async ({ ctx }) => {
      return getWellnessScore(ctx.user.id);
    }),
  }),
});
export type AppRouter = typeof appRouter;
