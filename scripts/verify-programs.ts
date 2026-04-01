import "../scripts/load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { programDays } from "../drizzle/schema";
import { eq, count } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function verify() {
  const t21 = await db.select({ count: count() }).from(programDays).where(eq(programDays.programSlug, "transformation-sommeil"));
  const t30 = await db.select({ count: count() }).from(programDays).where(eq(programDays.programSlug, "maitre-sommeil"));

  console.log("Programme 21j (transformation-sommeil) :", t21[0].count, "jours en DB");
  console.log("Programme 30j (maitre-sommeil) :", t30[0].count, "jours en DB");

  // Vérifier quelques jours spécifiques
  const days21 = await db.select({ dayNumber: programDays.dayNumber, title: programDays.title, theme: programDays.theme })
    .from(programDays)
    .where(eq(programDays.programSlug, "transformation-sommeil"))
    .orderBy(programDays.dayNumber);

  console.log("\n--- Programme 21j : liste des jours ---");
  for (const d of days21) {
    console.log(`  J${d.dayNumber}: ${d.title} [${d.theme}]`);
  }

  const days30 = await db.select({ dayNumber: programDays.dayNumber, title: programDays.title, theme: programDays.theme })
    .from(programDays)
    .where(eq(programDays.programSlug, "maitre-sommeil"))
    .orderBy(programDays.dayNumber);

  console.log("\n--- Programme 30j : liste des jours ---");
  for (const d of days30) {
    console.log(`  J${d.dayNumber}: ${d.title} [${d.theme}]`);
  }

  process.exit(0);
}

verify().catch(console.error);
