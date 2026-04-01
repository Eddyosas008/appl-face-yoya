import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

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
});

export type AppRouter = typeof appRouter;
