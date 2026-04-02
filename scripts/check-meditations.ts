import * as db from '../server/db';

async function main() {
  const cats = await db.getMeditationCategories();
  console.log('=== CATEGORIES (' + cats.length + ') ===');
  cats.forEach((c: any) => console.log(c.id, c.emoji, c.name, '(' + c.slug + ')'));

  const meds = await db.getMeditations();
  console.log('\n=== MEDITATIONS (' + meds.length + ') ===');
  meds.forEach((m: any) => console.log('  cat:' + m.categoryId, m.id, m.title, m.duration + 'min'));
}

main().catch(console.error);
