/**
 * Script de déduplication des jours de programme
 * Supprime les anciens jours génériques et ne garde que les jours enrichis
 */
import "../scripts/load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { programDays } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

// Titres des jours enrichis (pour les identifier)
const ENRICHED_TITLES_21 = [
  "Jour 1 — Évaluation et fondations",
  "Jour 2 — Hygiène du sommeil avancée",
  "Jour 3 — Gestion du stress nocturne",
  "Jour 4 — Respiration et système nerveux",
  "Jour 5 — Alimentation, lumière et sommeil",
  "Jour 6 — Optimiser l'environnement du sommeil",
  "Jour 7 — Bilan semaine 1 et consolidation",
  "Jour 8 — TCC-I : La restriction du sommeil",
  "Jour 9 — Contrôle du stimulus",
  "Jour 10 — Restructuration cognitive",
  "Jour 11 — Pleine conscience nocturne",
  "Jour 12 — Gestion des réveils nocturnes",
  "Jour 13 — Chronobiologie personnelle",
  "Jour 14 — Bilan semaine 2 et ajustements",
  "Jour 15 — Méditation avancée du sommeil",
  "Jour 16 — Yoga Nidra : le sommeil yogique",
  "Jour 17 — Auto-hypnose et suggestion",
  "Jour 18 — Gestion des rechutes",
  "Jour 19 — Ancrage des habitudes",
  "Jour 20 — Votre programme personnalisé",
  "Jour 21 — Célébration et engagement durable",
];

const ENRICHED_TITLES_30 = [
  "Jour 1 — Diagnostic expert du sommeil",
  "Jour 2 — Neurosciences du sommeil",
  "Jour 3 — Protocole anti-cortisol",
  "Jour 4 — Optimisation circadienne avancée",
  "Jour 5 — Nutrition avancée pour le sommeil",
  "Jour 6 — Exercice physique et sommeil",
  "Jour 7 — Bilan semaine 1 et plan d'action",
  "Jour 8 — TCC-I avancée : protocole complet",
  "Jour 9 — Thérapie d'acceptation et d'engagement",
  "Jour 10 — Restructuration des croyances profondes",
  "Jour 11 — Gestion de l'hyperactivation",
  "Jour 12 — Protocole de gestion des ruminations",
  "Jour 13 — Techniques de distraction cognitive",
  "Jour 14 — Bilan semaine 2 et ajustement du protocole",
  "Jour 15 — Yoga Nidra avancé",
  "Jour 16 — Méditation Vipassana du sommeil",
  "Jour 17 — Hypnose ericksonienne du sommeil",
  "Jour 18 — Cohérence cardiaque avancée",
  "Jour 19 — Méditation des 4 éléments",
  "Jour 20 — Pratique du non-faire (Wu Wei)",
  "Jour 21 — Bilan semaine 3 et intégration",
  "Jour 22 — Construire votre programme maître",
  "Jour 23 — Gestion des voyages et décalages horaires",
  "Jour 24 — Sommeil et performance cognitive",
  "Jour 25 — Sommeil et régulation émotionnelle",
  "Jour 26 — Sommeil et relations",
  "Jour 27 — Sommeil et longévité",
  "Jour 28 — Transmission et enseignement",
  "Jour 29 — Évaluation finale et mesure des progrès",
  "Jour 30 — Maître du sommeil : célébration et engagement",
];

async function deduplicate() {
  console.log("🧹 Déduplication des jours de programme...\n");

  // Récupérer tous les jours des 2 programmes
  const all21 = await db.select({ id: programDays.id, dayNumber: programDays.dayNumber, title: programDays.title })
    .from(programDays)
    .where(eq(programDays.programSlug, "transformation-sommeil"))
    .orderBy(programDays.dayNumber, programDays.id);

  const all30 = await db.select({ id: programDays.id, dayNumber: programDays.dayNumber, title: programDays.title })
    .from(programDays)
    .where(eq(programDays.programSlug, "maitre-sommeil"))
    .orderBy(programDays.dayNumber, programDays.id);

  console.log(`Programme 21j : ${all21.length} entrées trouvées`);
  console.log(`Programme 30j : ${all30.length} entrées trouvées`);

  // Pour chaque numéro de jour, garder uniquement l'entrée avec le titre enrichi
  let deleted = 0;

  // Traiter le programme 21j
  const grouped21 = new Map<number, typeof all21>();
  for (const row of all21) {
    if (!grouped21.has(row.dayNumber)) grouped21.set(row.dayNumber, []);
    grouped21.get(row.dayNumber)!.push(row);
  }

  for (const [dayNum, rows] of grouped21) {
    if (rows.length > 1) {
      // Identifier le titre enrichi
      const enrichedTitle = `Jour ${dayNum} — ${ENRICHED_TITLES_21[dayNum - 1]?.split("— ")[1] || ""}`;
      const toKeep = rows.find(r => r.title === ENRICHED_TITLES_21[dayNum - 1]) || rows[rows.length - 1];
      const toDelete = rows.filter(r => r.id !== toKeep.id);
      
      for (const row of toDelete) {
        await db.delete(programDays).where(eq(programDays.id, row.id));
        deleted++;
        console.log(`  🗑️  Supprimé [21j] J${dayNum}: "${row.title}"`);
      }
    }
  }

  // Traiter le programme 30j
  const grouped30 = new Map<number, typeof all30>();
  for (const row of all30) {
    if (!grouped30.has(row.dayNumber)) grouped30.set(row.dayNumber, []);
    grouped30.get(row.dayNumber)!.push(row);
  }

  for (const [dayNum, rows] of grouped30) {
    if (rows.length > 1) {
      const toKeep = rows.find(r => r.title === ENRICHED_TITLES_30[dayNum - 1]) || rows[rows.length - 1];
      const toDelete = rows.filter(r => r.id !== toKeep.id);
      
      for (const row of toDelete) {
        await db.delete(programDays).where(eq(programDays.id, row.id));
        deleted++;
        console.log(`  🗑️  Supprimé [30j] J${dayNum}: "${row.title}"`);
      }
    }
  }

  console.log(`\n✅ ${deleted} doublons supprimés`);

  // Vérification finale
  const final21 = await db.select({ count: sql<number>`count(*)` }).from(programDays).where(eq(programDays.programSlug, "transformation-sommeil"));
  const final30 = await db.select({ count: sql<number>`count(*)` }).from(programDays).where(eq(programDays.programSlug, "maitre-sommeil"));

  console.log(`\nRésultat final :`);
  console.log(`  Programme 21j : ${final21[0].count} jours`);
  console.log(`  Programme 30j : ${final30[0].count} jours`);
  console.log("\n🎉 Déduplication terminée !");
  process.exit(0);
}

deduplicate().catch(console.error);
