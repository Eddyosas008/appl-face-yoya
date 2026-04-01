/**
 * Script de seed pour les programmes sommeil
 * Exécuter avec : npx tsx scripts/seed-programs.ts
 */
import "../scripts/load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { sleepPrograms, programDays } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

// ─── Programmes ───────────────────────────────────────────────────────────────

const PROGRAMS = [
  {
    slug: "initiation-sommeil",
    title: "Initiation au sommeil",
    subtitle: "Découvrez les bases d'un sommeil réparateur",
    description: "Un programme doux de 2 jours pour découvrir les fondamentaux du sommeil et commencer à transformer vos nuits. Idéal pour les débutants qui souhaitent explorer la méditation du soir.",
    emoji: "🌙",
    durationDays: 2,
    targetIssue: "general",
    level: "beginner" as const,
    isPremium: false,
    isFeatured: true,
    coverColor: "#1E1B4B",
    coverColor2: "#312E81",
    sortOrder: 1,
  },
  {
    slug: "retrouver-sommeil",
    title: "Retrouver le sommeil",
    subtitle: "Protocole anti-insomnie en 7 jours",
    description: "Un programme structuré de 7 jours pour briser le cycle de l'insomnie. Chaque jour apporte des outils concrets : méditations guidées, exercices de respiration, routines du soir et conseils scientifiques pour retrouver un sommeil naturel.",
    emoji: "🌛",
    durationDays: 7,
    targetIssue: "insomnia",
    level: "beginner" as const,
    isPremium: false,
    isFeatured: true,
    coverColor: "#1E3A5F",
    coverColor2: "#1E40AF",
    sortOrder: 2,
  },
  {
    slug: "transformation-sommeil",
    title: "Transformation du sommeil",
    subtitle: "Restructuration complète en 21 jours",
    description: "Le programme de référence pour transformer durablement votre sommeil. En 21 jours, vous allez reprogrammer votre horloge biologique, éliminer les pensées nocturnes et construire une hygiène du sommeil solide basée sur les dernières recherches en neurosciences.",
    emoji: "✨",
    durationDays: 21,
    targetIssue: "quality",
    level: "intermediate" as const,
    isPremium: true,
    isFeatured: true,
    coverColor: "#2D1B69",
    coverColor2: "#5B21B6",
    sortOrder: 3,
  },
  {
    slug: "maitre-sommeil",
    title: "Maître du sommeil",
    subtitle: "Programme expert 30 jours — Transformation totale",
    description: "Le programme ultime pour devenir maître de votre sommeil. 30 jours de pratique intensive combinant méditation avancée, cohérence cardiaque, journaling nocturne, et techniques de TCC-I (Thérapie Cognitive et Comportementale pour l'Insomnie). Pour ceux qui veulent des résultats durables.",
    emoji: "🌟",
    durationDays: 30,
    targetIssue: "advanced",
    level: "advanced" as const,
    isPremium: true,
    isFeatured: false,
    coverColor: "#1A0533",
    coverColor2: "#7C3AED",
    sortOrder: 4,
  },
];

// ─── Jours du programme "Initiation" (2 jours) ───────────────────────────────

const INITIATION_DAYS = [
  {
    dayNumber: 1,
    title: "Jour 1 — Préparer le terrain",
    theme: "Comprendre votre sommeil",
    description: "Aujourd'hui, nous allons explorer vos habitudes de sommeil et préparer votre environnement pour une nuit réparatrice.",
    meditationSlug: "voyage-nocturne",
    breathingExercise: "4-7-8",
    ambientSound: "rain",
    eveningRoutine: "1. Éteignez tous les écrans 1h avant le coucher\n2. Préparez votre chambre : température fraîche (18°C), obscurité totale\n3. Faites la méditation guidée de 10 minutes\n4. Pratiquez 3 cycles de respiration 4-7-8\n5. Notez 3 choses positives de votre journée",
    sleepTip: "La lumière bleue des écrans bloque la production de mélatonine pendant 2 à 3 heures. Activez le mode nuit sur vos appareils ou portez des lunettes anti-lumière bleue dès 19h.",
    journalPrompt: "Comment décririez-vous votre sommeil en ce moment ? Qu'est-ce qui vous empêche de dormir sereinement ?",
    estimatedMinutes: 20,
  },
  {
    dayNumber: 2,
    title: "Jour 2 — Ancrer la pratique",
    theme: "Créer votre rituel du soir",
    description: "Vous avez posé les bases hier. Aujourd'hui, nous allons consolider votre rituel du soir et explorer la technique de relaxation musculaire progressive.",
    meditationSlug: "relaxation-profonde",
    breathingExercise: "coherence",
    ambientSound: "forest",
    eveningRoutine: "1. Prenez un bain ou une douche chaude 1h avant de dormir\n2. Préparez une tisane à la camomille ou à la valériane\n3. Lisez un livre physique pendant 20 minutes (pas d'écran)\n4. Faites la méditation de relaxation musculaire progressive\n5. Pratiquez 5 minutes de cohérence cardiaque",
    sleepTip: "La relaxation musculaire progressive (RMP) réduit l'anxiété de 30% et améliore la qualité du sommeil. Contractez chaque groupe musculaire pendant 5 secondes, puis relâchez pendant 30 secondes, en remontant des pieds jusqu'au visage.",
    journalPrompt: "Avez-vous remarqué des changements dans votre sommeil après la première nuit ? Qu'avez-vous ressenti pendant la méditation ?",
    estimatedMinutes: 25,
  },
];

// ─── Jours du programme "Retrouver le sommeil" (7 jours) ─────────────────────

const RETROUVER_DAYS = [
  {
    dayNumber: 1,
    title: "Jour 1 — Comprendre l'insomnie",
    theme: "Briser le cycle de l'anxiété nocturne",
    description: "L'insomnie est souvent alimentée par la peur de ne pas dormir. Aujourd'hui, nous allons comprendre ce mécanisme et commencer à le désamorcer.",
    meditationSlug: "voyage-nocturne",
    breathingExercise: "4-7-8",
    ambientSound: "rain",
    eveningRoutine: "1. Notez toutes vos inquiétudes sur papier avant 20h (vidage mental)\n2. Préparez votre chambre uniquement pour dormir (pas d'écran au lit)\n3. Méditez 10 minutes avec la méditation guidée\n4. Pratiquez 4 cycles de respiration 4-7-8\n5. Si vous ne dormez pas après 20 min, levez-vous et lisez dans une autre pièce",
    sleepTip: "Le paradoxe de l'insomnie : plus vous essayez de dormir, moins vous y arrivez. La technique de l'intention paradoxale consiste à rester éveillé passivement, sans effort. Cela réduit l'anxiété de performance et favorise l'endormissement naturel.",
    journalPrompt: "Depuis combien de temps souffrez-vous d'insomnie ? Quelles pensées vous traversent l'esprit quand vous ne dormez pas ?",
    estimatedMinutes: 25,
  },
  {
    dayNumber: 2,
    title: "Jour 2 — Réguler l'horloge biologique",
    theme: "Synchroniser votre rythme circadien",
    description: "Votre horloge biologique est votre meilleure alliée. Aujourd'hui, nous allons apprendre à la synchroniser pour des endormissements naturels.",
    meditationSlug: "pleine-lune",
    breathingExercise: "box",
    ambientSound: "ocean",
    eveningRoutine: "1. Exposez-vous à la lumière naturelle dès le matin (10 min dehors)\n2. Évitez la caféine après 14h\n3. Dînez léger au moins 3h avant le coucher\n4. Méditez avec la méditation de la pleine lune\n5. Couchez-vous à la même heure qu'hier, même si vous n'avez pas bien dormi",
    sleepTip: "La restriction du sommeil est contre-intuitive mais efficace : limitez votre temps au lit à votre temps de sommeil réel + 30 min. Cela crée une pression de sommeil qui améliore la qualité. Augmentez progressivement de 15 min quand votre efficacité dépasse 85%.",
    journalPrompt: "À quelle heure vous endormez-vous habituellement ? À quelle heure vous réveillez-vous ? Notez votre heure de coucher et de lever ce matin.",
    estimatedMinutes: 20,
  },
  {
    dayNumber: 3,
    title: "Jour 3 — Calmer le mental",
    theme: "Techniques de déconnexion mentale",
    description: "Les pensées envahissantes sont l'ennemi du sommeil. Aujourd'hui, nous explorons des techniques puissantes pour calmer le mental.",
    meditationSlug: "foret-apaisante",
    breathingExercise: "4-7-8",
    ambientSound: "forest",
    eveningRoutine: "1. Faites une liste de tâches pour demain (libérez le mental)\n2. Pratiquez 10 min de méditation de pleine conscience\n3. Essayez la technique des 4-7-8 pendant 4 cycles\n4. Si des pensées reviennent, notez-les sur papier et dites 'je m'en occupe demain'\n5. Visualisez un endroit sûr et paisible pendant 5 minutes",
    sleepTip: "La technique du 'train de pensées' : imaginez vos pensées comme des trains qui passent en gare. Vous êtes sur le quai, vous les observez passer sans monter dedans. Chaque pensée est un train qui repart. Vous restez immobile, en sécurité sur le quai.",
    journalPrompt: "Quelles sont les 3 pensées qui reviennent le plus souvent la nuit ? Comment vous sentez-vous après la méditation d'aujourd'hui ?",
    estimatedMinutes: 25,
  },
  {
    dayNumber: 4,
    title: "Jour 4 — Le corps comme ancre",
    theme: "Relaxation physique profonde",
    description: "La tension physique maintient l'éveil. Aujourd'hui, nous allons utiliser le corps comme porte d'entrée vers la relaxation profonde.",
    meditationSlug: "relaxation-profonde",
    breathingExercise: "coherence",
    ambientSound: "rain",
    eveningRoutine: "1. Faites 10 minutes de yoga doux ou d'étirements\n2. Pratiquez la relaxation musculaire progressive (pieds → tête)\n3. Méditez avec le scan corporel\n4. Appliquez de l'huile essentielle de lavande sur les poignets\n5. Dormez dans une position confortable, couverture légère",
    sleepTip: "La cohérence cardiaque (5 respirations par minute pendant 5 minutes) active le système nerveux parasympathique et réduit le cortisol de 23%. Inspirez 5 secondes, expirez 5 secondes. Faites-le 3 fois par jour pour des effets durables.",
    journalPrompt: "Où ressentez-vous la tension dans votre corps ? Après la relaxation musculaire, avez-vous remarqué une différence ?",
    estimatedMinutes: 30,
  },
  {
    dayNumber: 5,
    title: "Jour 5 — Nourrir le sommeil",
    theme: "Alimentation et sommeil",
    description: "Ce que vous mangez influence directement votre sommeil. Aujourd'hui, nous explorons le lien entre alimentation et qualité du sommeil.",
    meditationSlug: "gratitude-nocturne",
    breathingExercise: "4-7-8",
    ambientSound: "ocean",
    eveningRoutine: "1. Évitez l'alcool (il perturbe le sommeil paradoxal)\n2. Mangez des aliments riches en tryptophane au dîner (dinde, banane, noix)\n3. Buvez une tisane de passiflore ou de mélisse\n4. Méditez avec la méditation de gratitude\n5. Pratiquez 5 minutes de respiration abdominale profonde",
    sleepTip: "Le magnésium est le minéral du sommeil. Une carence (très fréquente) provoque des réveils nocturnes et des crampes. Mangez des amandes, épinards, chocolat noir, ou prenez un supplément de glycinate de magnésium le soir.",
    journalPrompt: "Qu'avez-vous mangé et bu aujourd'hui ? Avez-vous consommé de la caféine ou de l'alcool ? Comment cela a-t-il influencé votre soirée ?",
    estimatedMinutes: 20,
  },
  {
    dayNumber: 6,
    title: "Jour 6 — L'environnement du sommeil",
    theme: "Optimiser votre chambre",
    description: "Votre chambre doit être un sanctuaire du sommeil. Aujourd'hui, nous allons optimiser chaque aspect de votre environnement nocturne.",
    meditationSlug: "voyage-nocturne",
    breathingExercise: "box",
    ambientSound: "forest",
    eveningRoutine: "1. Vérifiez la température de votre chambre (idéal : 16-19°C)\n2. Bloquez toute lumière (masque de sommeil ou rideaux occultants)\n3. Utilisez des bouchons d'oreilles ou du bruit blanc si nécessaire\n4. Méditez avec la méditation guidée\n5. Pratiquez la technique de respiration carrée (4-4-4-4)",
    sleepTip: "Le bruit blanc (son constant à fréquence uniforme) masque les sons perturbateurs et réduit le temps d'endormissement de 38%. Vous pouvez utiliser un ventilateur, un humidificateur, ou une application de bruit blanc. La pluie et les vagues ont le même effet.",
    journalPrompt: "Comment est votre chambre ? Qu'est-ce qui pourrait être amélioré ? Avez-vous essayé de nouvelles choses cette semaine ?",
    estimatedMinutes: 25,
  },
  {
    dayNumber: 7,
    title: "Jour 7 — Célébrer et consolider",
    theme: "Votre nouveau rituel du sommeil",
    description: "Félicitations ! Vous avez terminé votre semaine de transformation. Aujourd'hui, nous consolidons vos acquis et créons votre rituel personnalisé durable.",
    meditationSlug: "pleine-lune",
    breathingExercise: "coherence",
    ambientSound: "ocean",
    eveningRoutine: "1. Relisez votre journal de la semaine\n2. Identifiez les 3 pratiques qui vous ont le plus aidé\n3. Créez votre rituel du soir personnalisé (20-30 min)\n4. Méditez avec la méditation de la pleine lune\n5. Écrivez votre engagement pour les prochaines semaines",
    sleepTip: "La régularité est la clé. Votre cerveau aime les routines. En maintenant votre rituel du soir pendant 21 jours supplémentaires, vous créerez des connexions neuronales durables qui associeront automatiquement ces pratiques à l'endormissement.",
    journalPrompt: "Qu'avez-vous appris sur votre sommeil cette semaine ? Quels changements avez-vous remarqués ? Quel est votre engagement pour la suite ?",
    estimatedMinutes: 35,
  },
];

// ─── Jours du programme "Transformation" (21 jours — semaines 1-3) ────────────

const TRANSFORMATION_DAYS = Array.from({ length: 21 }, (_, i) => {
  const day = i + 1;
  const week = Math.ceil(day / 7);
  const themes = [
    // Semaine 1 : Fondations
    "Évaluation et fondations",
    "Hygiène du sommeil avancée",
    "Gestion du stress nocturne",
    "Respiration et système nerveux",
    "Alimentation et sommeil",
    "Environnement optimal",
    "Bilan semaine 1",
    // Semaine 2 : Approfondissement
    "TCC-I : Restriction du sommeil",
    "Contrôle du stimulus",
    "Restructuration cognitive",
    "Pleine conscience nocturne",
    "Gestion des réveils",
    "Chronobiologie personnelle",
    "Bilan semaine 2",
    // Semaine 3 : Consolidation
    "Méditation avancée du sommeil",
    "Yoga nidra",
    "Hypnose et auto-suggestion",
    "Gestion des rechutes",
    "Ancrage des habitudes",
    "Votre programme personnalisé",
    "Célébration et engagement",
  ];

  const meditations = [
    "voyage-nocturne", "relaxation-profonde", "foret-apaisante", "pleine-lune",
    "gratitude-nocturne", "voyage-nocturne", "relaxation-profonde",
    "foret-apaisante", "pleine-lune", "gratitude-nocturne", "voyage-nocturne",
    "relaxation-profonde", "foret-apaisante", "pleine-lune",
    "gratitude-nocturne", "voyage-nocturne", "relaxation-profonde",
    "foret-apaisante", "pleine-lune", "gratitude-nocturne", "voyage-nocturne",
  ];

  const breathings = [
    "4-7-8", "coherence", "box", "4-7-8", "coherence", "box", "4-7-8",
    "coherence", "box", "4-7-8", "coherence", "box", "4-7-8", "coherence",
    "box", "4-7-8", "coherence", "box", "4-7-8", "coherence", "box",
  ];

  const ambients = [
    "rain", "forest", "ocean", "rain", "forest", "ocean", "rain",
    "forest", "ocean", "rain", "forest", "ocean", "rain", "forest",
    "ocean", "rain", "forest", "ocean", "rain", "forest", "ocean",
  ];

  return {
    dayNumber: day,
    title: `Jour ${day} — ${themes[i]}`,
    theme: `Semaine ${week} : ${week === 1 ? "Fondations" : week === 2 ? "Approfondissement" : "Consolidation"}`,
    description: `Jour ${day} de votre transformation. Thème : ${themes[i]}. Suivez le programme du soir et notez vos observations dans le journal.`,
    meditationSlug: meditations[i],
    breathingExercise: breathings[i],
    ambientSound: ambients[i],
    eveningRoutine: `Programme du soir — Jour ${day}\n1. Méditation guidée (15 min)\n2. Exercice de respiration (5 min)\n3. Sons d'ambiance pour l'endormissement\n4. Journaling (5 min)\n5. Couchez-vous à votre heure habituelle`,
    sleepTip: `Conseil du jour ${day} : Maintenez la régularité de vos horaires. Votre horloge biologique se synchronise en 3 semaines de pratique constante.`,
    journalPrompt: `Jour ${day} : Comment s'est passée votre nuit ? Notez votre heure d'endormissement, vos réveils et votre qualité de sommeil sur 10.`,
    estimatedMinutes: 25,
  };
});

// ─── Jours du programme "Maître du sommeil" (30 jours) ───────────────────────

const MAITRE_DAYS = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const week = Math.ceil(day / 7);

  const weekThemes = [
    "Diagnostic et fondations avancées",
    "TCC-I et restructuration cognitive",
    "Pratiques contemplatives avancées",
    "Intégration et maîtrise",
  ];

  const meditations = [
    "voyage-nocturne", "relaxation-profonde", "foret-apaisante", "pleine-lune",
    "gratitude-nocturne", "voyage-nocturne", "relaxation-profonde",
  ];

  return {
    dayNumber: day,
    title: `Jour ${day} — ${weekThemes[Math.min(week - 1, 3)]}`,
    theme: `Semaine ${week} : ${weekThemes[Math.min(week - 1, 3)]}`,
    description: `Programme expert — Jour ${day}. Pratique avancée de transformation du sommeil.`,
    meditationSlug: meditations[i % 7],
    breathingExercise: ["4-7-8", "coherence", "box", "energizing"][i % 4],
    ambientSound: ["rain", "forest", "ocean", "fire"][i % 4],
    eveningRoutine: `Programme expert du soir — Jour ${day}\n1. Yoga nidra ou méditation avancée (20 min)\n2. Cohérence cardiaque (5 min)\n3. Journaling structuré (10 min)\n4. Technique d'auto-hypnose\n5. Sons d'ambiance pour l'endormissement`,
    sleepTip: `Conseil expert jour ${day} : La maîtrise du sommeil est un processus. Chaque nuit imparfaite est une donnée, pas un échec. Observez sans juger.`,
    journalPrompt: `Jour ${day} : Évaluez votre sommeil (qualité/10, durée, réveils). Qu'avez-vous appris sur vous-même cette semaine ?`,
    estimatedMinutes: 35,
  };
});

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌙 Seeding sleep programs...\n");

  // Insérer les programmes
  for (const prog of PROGRAMS) {
    try {
      await db.insert(sleepPrograms).values(prog).onDuplicateKeyUpdate({
        set: {
          title: prog.title,
          subtitle: prog.subtitle,
          description: prog.description,
          emoji: prog.emoji,
          durationDays: prog.durationDays,
          targetIssue: prog.targetIssue,
          level: prog.level,
          isPremium: prog.isPremium,
          isFeatured: prog.isFeatured,
          coverColor: prog.coverColor,
          coverColor2: prog.coverColor2,
          sortOrder: prog.sortOrder,
        },
      });
      console.log(`✅ Programme : ${prog.title} (${prog.durationDays}j)`);
    } catch (e) {
      console.error(`❌ Erreur programme ${prog.slug}:`, e);
    }
  }

  // Insérer les jours
  const allDays = [
    ...INITIATION_DAYS.map(d => ({ ...d, programSlug: "initiation-sommeil" })),
    ...RETROUVER_DAYS.map(d => ({ ...d, programSlug: "retrouver-sommeil" })),
    ...TRANSFORMATION_DAYS.map(d => ({ ...d, programSlug: "transformation-sommeil" })),
    ...MAITRE_DAYS.map(d => ({ ...d, programSlug: "maitre-sommeil" })),
  ];

  console.log(`\n📅 Inserting ${allDays.length} program days...`);

  for (const day of allDays) {
    try {
      await db.insert(programDays).values(day).onDuplicateKeyUpdate({
        set: {
          title: day.title,
          theme: day.theme,
          description: day.description,
          meditationSlug: day.meditationSlug,
          breathingExercise: day.breathingExercise,
          ambientSound: day.ambientSound,
          eveningRoutine: day.eveningRoutine,
          sleepTip: day.sleepTip,
          journalPrompt: day.journalPrompt,
          estimatedMinutes: day.estimatedMinutes,
        },
      });
    } catch (e) {
      console.error(`❌ Erreur jour ${day.programSlug} J${day.dayNumber}:`, e);
    }
  }

  console.log(`\n✅ ${allDays.length} jours insérés avec succès !`);
  console.log("\n🎉 Seed terminé !");
  process.exit(0);
}

seed().catch(console.error);
