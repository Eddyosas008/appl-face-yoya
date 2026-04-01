/**
 * Migration : Ajouter audioUrl et audioDurationSeconds dans la table programDays
 */
import mysql from "mysql2/promise";
import "../scripts/load-env.js";

async function migrate() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);

  console.log("✅ Connexion DB établie");

  // Vérifier si les colonnes existent déjà
  const [cols] = await conn.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'programDays' 
     AND COLUMN_NAME IN ('audioUrl', 'audioDurationSeconds')`
  ) as any[];

  const existingCols = (cols as any[]).map((c: any) => c.COLUMN_NAME);
  console.log("Colonnes existantes:", existingCols);

  if (!existingCols.includes("audioUrl")) {
    await conn.execute(`ALTER TABLE programDays ADD COLUMN audioUrl TEXT NULL AFTER journalPrompt`);
    console.log("✅ Colonne audioUrl ajoutée");
  } else {
    console.log("ℹ️  audioUrl existe déjà");
  }

  if (!existingCols.includes("audioDurationSeconds")) {
    await conn.execute(`ALTER TABLE programDays ADD COLUMN audioDurationSeconds INT NOT NULL DEFAULT 0 AFTER audioUrl`);
    console.log("✅ Colonne audioDurationSeconds ajoutée");
  } else {
    console.log("ℹ️  audioDurationSeconds existe déjà");
  }

  // Vérification finale
  const [finalCols] = await conn.execute(
    `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'programDays'
     AND COLUMN_NAME IN ('audioUrl', 'audioDurationSeconds')`
  ) as any[];
  console.log("\n📋 Résultat final:", finalCols);

  await conn.end();
  console.log("\n✅ Migration terminée avec succès !");
}

migrate().catch((err) => {
  console.error("❌ Erreur de migration:", err);
  process.exit(1);
});
