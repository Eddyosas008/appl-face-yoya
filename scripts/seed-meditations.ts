/**
 * Script de seed pour peupler la base de données avec le catalogue
 * de méditations guidées et les catégories.
 *
 * Usage : npx tsx scripts/seed-meditations.ts
 *
 * Les URLs audio pointent vers des fichiers hébergés sur le S3 du projet.
 * Pour ajouter de vraies méditations audio, uploadez vos fichiers MP3 via
 * la route tRPC catalog.upsert (admin uniquement) avec l'URL S3 retournée.
 */

import "../scripts/load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { meditations, meditationCategories } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// ─── Catégories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: "stress", name: "Stress & Anxiété", emoji: "🌿", description: "Libérez les tensions et retrouvez la sérénité", sortOrder: 1 },
  { slug: "sleep", name: "Sommeil", emoji: "🌙", description: "Préparez votre corps et votre esprit au repos", sortOrder: 2 },
  { slug: "focus", name: "Concentration", emoji: "🎯", description: "Aiguisez votre attention et votre clarté mentale", sortOrder: 3 },
  { slug: "self-love", name: "Amour de soi", emoji: "💜", description: "Cultivez la bienveillance envers vous-même", sortOrder: 4 },
  { slug: "morning", name: "Matin", emoji: "☀️", description: "Démarrez votre journée avec énergie et intention", sortOrder: 5 },
  { slug: "breathing", name: "Respiration", emoji: "💨", description: "Techniques de souffle pour réguler vos émotions", sortOrder: 6 },
  { slug: "gratitude", name: "Gratitude", emoji: "🌸", description: "Ouvrez votre cœur à la reconnaissance", sortOrder: 7 },
  { slug: "body-scan", name: "Scan corporel", emoji: "✨", description: "Reconnectez-vous à votre corps et relâchez les tensions", sortOrder: 8 },
];

// ─── Méditations ───────────────────────────────────────────────────────────────
// Note : les audioUrl sont des placeholders. Remplacez-les par vos vraies URLs
// S3 après avoir uploadé vos fichiers MP3 via la route admin catalog.upsert.
// Format recommandé : MP3 128kbps, mono, 44100Hz

const MEDITATIONS = [
  // ── Stress & Anxiété ──
  {
    slug: "souffle-apaisant",
    title: "Souffle Apaisant",
    subtitle: "Libérez le stress en 10 minutes",
    description: "Une méditation guidée pour relâcher les tensions du quotidien. Suivez votre souffle et laissez partir les pensées qui vous encombrent.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/souffle-apaisant.mp3",
    audioDurationSeconds: 600,
    categorySlug: "stress",
    level: "beginner" as const,
    tags: JSON.stringify(["stress", "respiration", "débutant"]),
    instructor: "Yoya",
    coverColor: "#7C3AED",
    isPremium: false,
    isFeatured: true,
    sortOrder: 1,
    scriptText: `Installez-vous confortablement, fermez les yeux...

Prenez une grande inspiration par le nez... retenez... et expirez lentement par la bouche.

Sentez vos épaules se détendre. Votre mâchoire se relâche. Votre front se lisse.

Avec chaque expiration, imaginez que vous soufflez toutes vos tensions, tous vos soucis, comme des nuages qui s'éloignent dans le ciel.

Inspirez la paix... expirez le stress...

Vous êtes en sécurité. Vous êtes ici, maintenant. Rien d'autre n'a d'importance en ce moment.

Continuez à respirer doucement, à votre rythme...`,
  },
  {
    slug: "ancrage-terre",
    title: "Ancrage à la Terre",
    subtitle: "Retrouvez votre centre en 15 minutes",
    description: "Quand l'anxiété vous emporte, cette méditation vous aide à retrouver votre ancrage. Sentez le sol sous vos pieds, la solidité de la terre.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/ancrage-terre.mp3",
    audioDurationSeconds: 900,
    categorySlug: "stress",
    level: "beginner" as const,
    tags: JSON.stringify(["anxiété", "ancrage", "pleine conscience"]),
    instructor: "Yoya",
    coverColor: "#059669",
    isPremium: false,
    isFeatured: false,
    sortOrder: 2,
    scriptText: `Asseyez-vous ou allongez-vous confortablement...

Portez votre attention sur les points de contact entre votre corps et la surface qui vous soutient.

Sentez le poids de votre corps. La gravité qui vous retient doucement à la terre.

Vous êtes ancré(e). Stable. Solide comme un arbre dont les racines plongent profondément dans la terre.

Respirez... et avec chaque expiration, enfoncez-vous un peu plus dans cette stabilité.`,
  },
  {
    slug: "vague-de-calme",
    title: "Vague de Calme",
    subtitle: "Méditation pour les moments de crise",
    description: "Pour les moments où l'anxiété monte brusquement. Une technique rapide et efficace pour retrouver votre équilibre en quelques minutes.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/vague-de-calme.mp3",
    audioDurationSeconds: 480,
    categorySlug: "stress",
    level: "intermediate" as const,
    tags: JSON.stringify(["anxiété", "urgence", "rapide"]),
    instructor: "Yoya",
    coverColor: "#0EA5E9",
    isPremium: true,
    isFeatured: false,
    sortOrder: 3,
  },

  // ── Sommeil ──
  {
    slug: "voyage-nocturne",
    title: "Voyage Nocturne",
    subtitle: "Glissez doucement vers le sommeil",
    description: "Une méditation guidée pour préparer votre esprit et votre corps au sommeil. Laissez-vous porter par une visualisation apaisante.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/voyage-nocturne.mp3",
    audioDurationSeconds: 1200,
    categorySlug: "sleep",
    level: "beginner" as const,
    tags: JSON.stringify(["sommeil", "visualisation", "nuit"]),
    instructor: "Yoya",
    coverColor: "#1E1B4B",
    isPremium: false,
    isFeatured: true,
    sortOrder: 1,
    scriptText: `Il est temps de laisser la journée derrière vous...

Allongez-vous confortablement. Fermez les yeux. Laissez votre corps s'enfoncer dans le matelas.

Imaginez que vous marchez dans une forêt la nuit. L'air est doux et frais. Les étoiles brillent entre les feuilles.

Chaque pas vous rapproche d'un endroit douillet, sûr, fait juste pour vous.

Votre esprit ralentit... vos pensées deviennent légères comme des plumes...

Vous êtes en sécurité. Il est temps de vous reposer.`,
  },
  {
    slug: "scan-corporel-nuit",
    title: "Scan Corporel du Soir",
    subtitle: "Relâchez chaque tension avant de dormir",
    description: "Parcourez votre corps de la tête aux pieds pour identifier et relâcher toutes les tensions accumulées dans la journée.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/scan-corporel-nuit.mp3",
    audioDurationSeconds: 1500,
    categorySlug: "sleep",
    level: "beginner" as const,
    tags: JSON.stringify(["sommeil", "scan corporel", "relaxation"]),
    instructor: "Yoya",
    coverColor: "#312E81",
    isPremium: false,
    isFeatured: false,
    sortOrder: 2,
  },
  {
    slug: "lacher-prise-nuit",
    title: "Lâcher Prise",
    subtitle: "Déposez le poids de la journée",
    description: "Une méditation pour vous aider à lâcher prise sur les pensées intrusives et les ruminations nocturnes.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/lacher-prise-nuit.mp3",
    audioDurationSeconds: 900,
    categorySlug: "sleep",
    level: "intermediate" as const,
    tags: JSON.stringify(["sommeil", "rumination", "lâcher prise"]),
    instructor: "Yoya",
    coverColor: "#4C1D95",
    isPremium: true,
    isFeatured: false,
    sortOrder: 3,
  },

  // ── Concentration ──
  {
    slug: "clarté-mentale",
    title: "Clarté Mentale",
    subtitle: "Aiguisez votre focus en 5 minutes",
    description: "Une courte méditation pour clarifier votre esprit avant une tâche importante. Idéale avant une réunion, un examen ou une session de travail.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/clarte-mentale.mp3",
    audioDurationSeconds: 300,
    categorySlug: "focus",
    level: "beginner" as const,
    tags: JSON.stringify(["concentration", "travail", "rapide"]),
    instructor: "Yoya",
    coverColor: "#D97706",
    isPremium: false,
    isFeatured: true,
    sortOrder: 1,
    scriptText: `Asseyez-vous droit. Posez vos mains sur vos genoux.

Prenez trois grandes respirations pour signaler à votre cerveau qu'il est temps de se concentrer.

Imaginez votre esprit comme un lac. En ce moment, il est peut-être agité, avec des vagues de pensées.

Avec chaque respiration, le lac se calme. L'eau devient limpide. Vous pouvez voir jusqu'au fond.

Cette clarté est disponible en vous à tout moment. Il suffit de respirer.`,
  },
  {
    slug: "pleine-conscience-travail",
    title: "Pleine Conscience au Travail",
    subtitle: "Restez ancré(e) dans le moment présent",
    description: "Apprenez à rester pleinement présent(e) pendant vos activités quotidiennes pour améliorer votre productivité et réduire le stress.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/pleine-conscience-travail.mp3",
    audioDurationSeconds: 600,
    categorySlug: "focus",
    level: "intermediate" as const,
    tags: JSON.stringify(["concentration", "productivité", "présence"]),
    instructor: "Yoya",
    coverColor: "#B45309",
    isPremium: true,
    isFeatured: false,
    sortOrder: 2,
  },

  // ── Amour de soi ──
  {
    slug: "amour-inconditionnel",
    title: "Amour Inconditionnel",
    subtitle: "Cultivez la bienveillance envers vous-même",
    description: "La méditation Metta (amour bienveillant) adaptée pour vous apprendre à vous traiter avec la même douceur que vous offrez à vos proches.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/amour-inconditionnel.mp3",
    audioDurationSeconds: 900,
    categorySlug: "self-love",
    level: "beginner" as const,
    tags: JSON.stringify(["amour de soi", "metta", "bienveillance"]),
    instructor: "Yoya",
    coverColor: "#BE185D",
    isPremium: false,
    isFeatured: true,
    sortOrder: 1,
    scriptText: `Placez une main sur votre cœur. Sentez sa chaleur.

Répétez intérieurement, avec douceur :

"Puissé-je être heureuse.
Puissé-je être en bonne santé.
Puissé-je être en paix.
Puissé-je m'aimer telle que je suis."

Laissez ces mots résonner en vous. Pas besoin d'y croire pleinement tout de suite. Plantez juste la graine.

Vous méritez votre propre amour autant que n'importe qui d'autre.`,
  },
  {
    slug: "confiance-en-soi",
    title: "Confiance en Soi",
    subtitle: "Reconnectez-vous à votre force intérieure",
    description: "Une méditation pour retrouver confiance en vous, reconnaître vos qualités et vous ancrer dans votre valeur intrinsèque.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/confiance-en-soi.mp3",
    audioDurationSeconds: 720,
    categorySlug: "self-love",
    level: "beginner" as const,
    tags: JSON.stringify(["confiance", "estime de soi", "force"]),
    instructor: "Yoya",
    coverColor: "#9D174D",
    isPremium: false,
    isFeatured: false,
    sortOrder: 2,
  },

  // ── Matin ──
  {
    slug: "eveil-doux",
    title: "Éveil Doux",
    subtitle: "Commencez votre journée avec intention",
    description: "Une méditation matinale pour vous ancrer dans le moment présent, définir votre intention du jour et aborder la journée avec sérénité.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/eveil-doux.mp3",
    audioDurationSeconds: 480,
    categorySlug: "morning",
    level: "beginner" as const,
    tags: JSON.stringify(["matin", "intention", "énergie"]),
    instructor: "Yoya",
    coverColor: "#F59E0B",
    isPremium: false,
    isFeatured: true,
    sortOrder: 1,
    scriptText: `Bonjour. Une nouvelle journée commence.

Avant de vous lever, prenez un moment pour vous.

Respirez profondément. Sentez votre corps s'éveiller doucement.

Demandez-vous : quelle est mon intention pour aujourd'hui ? Comment est-ce que je veux me sentir ?

Choisissez un mot. Un seul. Peut-être "calme", "courageuse", "présente", "joyeuse"...

Portez ce mot avec vous tout au long de la journée.`,
  },
  {
    slug: "energie-matinale",
    title: "Énergie Matinale",
    subtitle: "Activez votre vitalité pour la journée",
    description: "Une méditation dynamique pour réveiller votre énergie, stimuler votre motivation et vous préparer à accueillir la journée avec enthousiasme.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/energie-matinale.mp3",
    audioDurationSeconds: 600,
    categorySlug: "morning",
    level: "intermediate" as const,
    tags: JSON.stringify(["matin", "énergie", "motivation"]),
    instructor: "Yoya",
    coverColor: "#D97706",
    isPremium: true,
    isFeatured: false,
    sortOrder: 2,
  },

  // ── Gratitude ──
  {
    slug: "coeur-reconnaissant",
    title: "Cœur Reconnaissant",
    subtitle: "Ouvrez-vous à la gratitude",
    description: "La pratique de la gratitude est l'une des plus puissantes pour transformer votre état d'esprit. Cette méditation vous guide vers une reconnaissance profonde.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/coeur-reconnaissant.mp3",
    audioDurationSeconds: 720,
    categorySlug: "gratitude",
    level: "beginner" as const,
    tags: JSON.stringify(["gratitude", "bonheur", "positivité"]),
    instructor: "Yoya",
    coverColor: "#EC4899",
    isPremium: false,
    isFeatured: false,
    sortOrder: 1,
    scriptText: `Fermez les yeux. Placez une main sur votre cœur.

Pensez à trois choses pour lesquelles vous êtes reconnaissante aujourd'hui.

Elles peuvent être grandes ou toutes petites. Une tasse de thé chaud. Un sourire reçu. Le fait de respirer.

Laissez la gratitude remplir votre poitrine comme une lumière dorée.

Plus vous pratiquez, plus vous remarquez les beautés cachées de votre vie.`,
  },

  // ── Scan corporel ──
  {
    slug: "scan-corporel-complet",
    title: "Scan Corporel Complet",
    subtitle: "Reconnectez-vous à votre corps",
    description: "Un voyage de pleine conscience à travers votre corps, de la tête aux pieds. Idéal pour relâcher les tensions et développer la conscience corporelle.",
    audioUrl: "https://placeholder.yoya-wellness.com/audio/scan-corporel-complet.mp3",
    audioDurationSeconds: 1200,
    categorySlug: "body-scan",
    level: "beginner" as const,
    tags: JSON.stringify(["scan corporel", "relaxation", "corps"]),
    instructor: "Yoya",
    coverColor: "#6D28D9",
    isPremium: false,
    isFeatured: false,
    sortOrder: 1,
    scriptText: `Allongez-vous confortablement. Fermez les yeux.

Portez votre attention sur le sommet de votre tête. Sentez-vous quelque chose ? Une légèreté ? Une tension ?

Descendez lentement vers votre front... vos sourcils... vos yeux... votre mâchoire...

Relâchez tout ce que vous trouvez. Pas besoin de forcer. Juste observer et laisser aller.

Continuez vers votre gorge... vos épaules... vos bras... vos mains...

Votre poitrine... votre ventre... votre dos...

Vos hanches... vos cuisses... vos genoux... vos mollets... vos pieds...

Votre corps entier est maintenant détendu et en paix.`,
  },
];

async function seed() {
  console.log("🌱 Seeding meditation categories...");

  for (const cat of CATEGORIES) {
    try {
      await db.insert(meditationCategories)
        .values({ ...cat, isActive: true })
        .onDuplicateKeyUpdate({
          set: {
            name: cat.name,
            emoji: cat.emoji,
            description: cat.description,
            sortOrder: cat.sortOrder,
          },
        });
      console.log(`  ✓ Category: ${cat.name}`);
    } catch (err) {
      console.error(`  ✗ Category ${cat.slug}:`, err);
    }
  }

  console.log("\n🎵 Seeding meditations...");

  for (const med of MEDITATIONS) {
    try {
      await db.insert(meditations)
        .values({ ...med, isActive: true, playCount: 0 })
        .onDuplicateKeyUpdate({
          set: {
            title: med.title,
            subtitle: med.subtitle,
            description: med.description,
            audioUrl: med.audioUrl,
            audioDurationSeconds: med.audioDurationSeconds,
            categorySlug: med.categorySlug,
            level: med.level,
            tags: med.tags,
            instructor: med.instructor,
            coverColor: med.coverColor,
            isPremium: med.isPremium,
            isFeatured: med.isFeatured,
            sortOrder: med.sortOrder,
            scriptText: (med as { scriptText?: string }).scriptText,
          },
        });
      console.log(`  ✓ Meditation: ${med.title}`);
    } catch (err) {
      console.error(`  ✗ Meditation ${med.slug}:`, err);
    }
  }

  console.log("\n✅ Seed completed!");
  console.log(`   ${CATEGORIES.length} categories | ${MEDITATIONS.length} meditations`);
  console.log("\n⚠️  Note: audioUrl are placeholders.");
  console.log("   Upload real MP3 files via the admin route: trpc.catalog.upsert");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
