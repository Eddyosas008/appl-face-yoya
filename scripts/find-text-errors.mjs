import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const files = execSync('find app -name "*.tsx"').toString().trim().split('\n');

files.forEach(file => {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    // Pattern: {number && ...} hors de Text (peut rendre 0 comme string)
    if (trimmed.match(/\{[a-zA-Z0-9_.]+\.length\s*&&/) && !trimmed.startsWith('//')) {
      console.log(`${file}:${i+1} : ${trimmed}`);
    }
    // Pattern: {condition && 'string'} hors de Text
    if (trimmed.match(/&&\s*['`]/) && !trimmed.startsWith('//') && !trimmed.includes('style') && !trimmed.includes('className')) {
      console.log(`${file}:${i+1} [STRING]: ${trimmed}`);
    }
  });
});
