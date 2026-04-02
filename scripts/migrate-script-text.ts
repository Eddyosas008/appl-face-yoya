import mysql from 'mysql2/promise';
import './load-env.js';

async function main() {
  const conn = await mysql.createPool({ uri: process.env.DATABASE_URL });
  
  try {
    await conn.execute('ALTER TABLE meditations ADD COLUMN scriptText LONGTEXT NULL AFTER language');
    console.log('✅ Column scriptText added to meditations');
  } catch (e: any) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Column scriptText already exists');
    } else {
      throw e;
    }
  }
  
  await conn.end();
}

main().catch(console.error);
