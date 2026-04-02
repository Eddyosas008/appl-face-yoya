import mysql from 'mysql2/promise';
import './load-env.js';

async function main() {
  const conn = await mysql.createPool({ uri: process.env.DATABASE_URL });
  const [rows] = await conn.execute('DESCRIBE meditations') as any;
  console.log('=== COLUMNS IN meditations ===');
  rows.forEach((r: any) => console.log(r.Field, r.Type));
  await conn.end();
}

main().catch(console.error);
