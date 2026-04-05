import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

// Lire les variables d'environnement
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  try {
    const env = readFileSync('.env', 'utf8');
    const match = env.match(/DATABASE_URL=(.+)/);
    if (match) dbUrl = match[1].trim();
  } catch {}
}

if (!dbUrl) {
  console.log('No DATABASE_URL found');
  process.exit(0);
}

try {
  const conn = await createConnection(dbUrl);
  const [rows] = await conn.execute('SELECT id, slug, name, category FROM ambientSounds LIMIT 20');
  console.log(JSON.stringify(rows, null, 2));
  await conn.end();
} catch (e) {
  console.log('Error:', e.message);
}
