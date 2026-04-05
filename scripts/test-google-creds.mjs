import { readFileSync } from 'fs';
import { config } from 'dotenv';
config({ path: '.env' });

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('GOOGLE_CLIENT_ID set:', !!clientId, clientId ? `(length: ${clientId.length})` : '');
console.log('GOOGLE_CLIENT_SECRET set:', !!clientSecret, clientSecret ? `(length: ${clientSecret.length})` : '');

if (!clientId || !clientSecret) {
  console.error('ERROR: Google credentials not set');
  process.exit(1);
}
console.log('OK: Google credentials are set');
