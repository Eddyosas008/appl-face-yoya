/**
 * Migration manuelle : rendre audioUrl nullable + supprimer scriptText
 */
import "../scripts/load-env.js";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import mysql from "mysql2/promise";

async function migrate() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(conn);

  console.log("🔧 Migration : audioUrl nullable + suppression scriptText...");

  try {
    // 1. Rendre audioUrl nullable (enlever NOT NULL)
    await conn.execute("ALTER TABLE `meditations` MODIFY COLUMN `audioUrl` text NULL");
    console.log("  ✅ audioUrl rendu nullable");
  } catch (e: any) {
    console.log("  ⚠️  audioUrl déjà nullable ou erreur :", e.message);
  }

  try {
    // 2. Supprimer scriptText
    await conn.execute("ALTER TABLE `meditations` DROP COLUMN `scriptText`");
    console.log("  ✅ scriptText supprimé");
  } catch (e: any) {
    if (e.message?.includes("Can't DROP")) {
      console.log("  ℹ️  scriptText déjà supprimé");
    } else {
      console.log("  ⚠️  Erreur scriptText :", e.message);
    }
  }

  // 3. Vider les audioUrl qui sont des URLs placeholder (non réelles)
  const [rows] = await conn.execute(
    "SELECT COUNT(*) as count FROM `meditations` WHERE `audioUrl` IS NOT NULL AND `audioUrl` != ''"
  ) as any;
  console.log(`\n  📊 Méditations avec audioUrl actuel : ${rows[0].count}`);

  // Mettre à NULL les URLs placeholder (contenant "pixabay" ou "freesound" ou autres sources de démo)
  const [updated] = await conn.execute(
    "UPDATE `meditations` SET `audioUrl` = NULL WHERE `audioUrl` IS NOT NULL AND (`audioUrl` LIKE '%pixabay%' OR `audioUrl` LIKE '%freesound%' OR `audioUrl` LIKE '%example%' OR `audioUrl` LIKE '%placeholder%')"
  ) as any;
  console.log(`  🧹 ${updated.affectedRows} URLs placeholder remises à NULL`);

  const [final] = await conn.execute(
    "SELECT COUNT(*) as count FROM `meditations` WHERE `audioUrl` IS NOT NULL AND `audioUrl` != ''"
  ) as any;
  console.log(`  📊 Méditations avec audioUrl réel : ${final[0].count}`);

  await conn.end();
  console.log("\n✅ Migration terminée !");
  process.exit(0);
}

migrate().catch(console.error);
