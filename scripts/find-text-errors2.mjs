import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function findFiles(dir) {
  const files = [];
  readdirSync(dir).forEach(f => {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) {
      files.push(...findFiles(full));
    } else if (f.endsWith('.tsx')) {
      files.push(full);
    }
  });
  return files;
}

const files = findFiles('app');
files.forEach(file => {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    // Pattern: {number.length && ...} hors de Text (peut rendre 0 comme string)
    if (trimmed.match(/^\{[a-zA-Z0-9_.]+\.length\s*&&/) && trimmed.indexOf('//') !== 0) {
      console.log(`${file}:${i+1} : ${trimmed.substring(0, 80)}`);
    }
    // Pattern: {condition && 'string'} hors de Text
    if (trimmed.match(/&&\s*['`]/) && trimmed.indexOf('//') !== 0 && trimmed.indexOf('style') === -1 && trimmed.indexOf('className') === -1) {
      console.log(`${file}:${i+1} [STRING]: ${trimmed.substring(0, 80)}`);
    }
  });
});
