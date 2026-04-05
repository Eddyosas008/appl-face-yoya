import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  try {
    const env = readFileSync('.env', 'utf8');
    const match = env.match(/DATABASE_URL=(.+)/);
    if (match) dbUrl = match[1].trim();
  } catch {}
}

if (!dbUrl) { console.log('No DATABASE_URL'); process.exit(0); }

const conn = await createConnection(dbUrl);

// Supprimer les entrées corrompues (slugs non-standard) et corriger les noms
const fixes = [
  // Corriger les entrées existantes par ID
  { id: 1, slug: 'rain',         name: 'Pluie douce',       emoji: '🌧️', category: 'nature' },
  { id: 2, slug: 'forest',       name: 'Forêt enchantée',   emoji: '🌲', category: 'nature' },
  { id: 5, slug: 'wind',         name: 'Vent léger',        emoji: '💨', category: 'nature' },
  { id: 6, slug: 'ocean',        name: 'Océan',             emoji: '🌊', category: 'water'  },
  { id: 7, slug: 'white-noise',  name: 'Bruit blanc',       emoji: '🌫️', category: 'meditation' },
  { id: 8, slug: 'brown-noise',  name: 'Bruit brun',        emoji: '📻', category: 'meditation' },
  { id: 9, slug: 'cafe',         name: 'Café ambiant',      emoji: '☕', category: 'urban'  },
  { id: 19, slug: 'birds',       name: "Chants d'oiseaux",  emoji: '🐦', category: 'nature' },
];

// Supprimer les entrées corrompues (IDs 3 et 4 avec slugs non-standard)
await conn.execute('DELETE FROM ambientSounds WHERE id IN (3, 4)');
console.log('✅ Entrées corrompues supprimées (IDs 3, 4)');

// Corriger les entrées existantes
for (const fix of fixes) {
  await conn.execute(
    'UPDATE ambientSounds SET slug=?, name=?, emoji=?, category=? WHERE id=?',
    [fix.slug, fix.name, fix.emoji, fix.category, fix.id]
  );
  console.log(`✅ Corrigé: ${fix.slug} → "${fix.name}"`);
}

// Ajouter les sons manquants (fire, tibetan_bowl, cosmos)
const missing = [
  { slug: 'fire',         name: 'Feu de cheminée',   emoji: '🔥', category: 'fire',      sortOrder: 6  },
  { slug: 'tibetan-bowl', name: 'Bol tibétain',       emoji: '🪘', category: 'meditation', sortOrder: 11 },
  { slug: 'cosmos',       name: 'Cosmos',             emoji: '🌌', category: 'cosmos',    sortOrder: 12 },
  { slug: 'thunder',      name: 'Orage',              emoji: '⛈️', category: 'nature',    sortOrder: 13 },
  { slug: 'river',        name: 'Rivière',            emoji: '🏞️', category: 'water',     sortOrder: 14 },
];

for (const s of missing) {
  try {
    await conn.execute(
      'INSERT IGNORE INTO ambientSounds (slug, name, emoji, category, sortOrder, isActive, isPremium) VALUES (?, ?, ?, ?, ?, 1, 0)',
      [s.slug, s.name, s.emoji, s.category, s.sortOrder]
    );
    console.log(`✅ Ajouté: ${s.slug} → "${s.name}"`);
  } catch (e) {
    console.log(`  Skip: ${s.slug} (${e.message})`);
  }
}

// Vérification finale
const [rows] = await conn.execute('SELECT id, slug, name, category FROM ambientSounds ORDER BY sortOrder, id');
console.log('\n📋 Sons en DB après correction:');
console.log(JSON.stringify(rows, null, 2));

await conn.end();
