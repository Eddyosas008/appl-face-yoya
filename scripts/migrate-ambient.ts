import { getDb } from '../server/db';
import { ambientSounds } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const db = await getDb();

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS \`ambientSounds\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`slug\` varchar(100) NOT NULL,
      \`name\` varchar(150) NOT NULL,
      \`emoji\` varchar(10) NOT NULL DEFAULT '🎵',
      \`category\` varchar(50) NOT NULL DEFAULT 'nature',
      \`audioUrl\` text,
      \`durationSeconds\` int DEFAULT 0,
      \`isPremium\` boolean NOT NULL DEFAULT false,
      \`isActive\` boolean NOT NULL DEFAULT true,
      \`sortOrder\` int NOT NULL DEFAULT 0,
      \`description\` text,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`ambientSounds_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`ambientSounds_slug_unique\` UNIQUE(\`slug\`)
    )
  `);
  console.log('✅ Table ambientSounds créée avec succès');

  // Insérer les sons de relaxation par défaut (URLs à remplir par l'admin)
  const defaultSounds = [
    { slug: 'rain', name: 'Pluie douce', emoji: '🌧️', category: 'nature', sortOrder: 1 },
    { slug: 'forest', name: 'Forêt', emoji: '🌲', category: 'nature', sortOrder: 2 },
    { slug: 'ocean', name: 'Océan', emoji: '🌊', category: 'nature', sortOrder: 3 },
    { slug: 'thunder', name: 'Orage', emoji: '⛈️', category: 'nature', sortOrder: 4 },
    { slug: 'wind', name: 'Vent', emoji: '💨', category: 'nature', sortOrder: 5 },
    { slug: 'fire', name: 'Feu de cheminée', emoji: '🔥', category: 'nature', sortOrder: 6 },
    { slug: 'white-noise', name: 'Bruit blanc', emoji: '📻', category: 'white-noise', sortOrder: 7 },
    { slug: 'brown-noise', name: 'Bruit brun', emoji: '🟤', category: 'white-noise', sortOrder: 8 },
    { slug: 'cafe', name: 'Café ambiant', emoji: '☕', category: 'urban', sortOrder: 9 },
    { slug: 'birds', name: "Chants d'oiseaux", emoji: '🐦', category: 'nature', sortOrder: 10 },
  ];

  let inserted = 0;
  for (const sound of defaultSounds) {
    try {
      await db.insert(ambientSounds).ignore().values({
        slug: sound.slug,
        name: sound.name,
        emoji: sound.emoji,
        category: sound.category,
        sortOrder: sound.sortOrder,
      });
      inserted++;
    } catch (e) {
      console.log(`  Skip (already exists): ${sound.slug}`);
    }
  }
  console.log(`✅ ${inserted} sons de relaxation insérés (URLs à configurer dans la DB)`);

  process.exit(0);
}

main().catch(e => { console.error('❌ Erreur:', e); process.exit(1); });
