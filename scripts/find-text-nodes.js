const fs = require('fs');

const files = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/explore.tsx',
  'app/meditation/[id].tsx',
  'app/(tabs)/profile.tsx',
  'app/sleep-tracker.tsx',
  'app/progress.tsx',
  'app/(tabs)/journal.tsx',
];

files.forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    // Look for lines that are plain text inside JSX (not in Text tags)
    // Pattern: whitespace + french/english text + no JSX/JS syntax
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (
        trimmed.length > 2 &&
        /^[A-Za-zÀ-ÿ]/.test(trimmed) &&
        !/[=<>{}()\[\]"'`]/.test(trimmed) &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('import') &&
        !trimmed.startsWith('const') &&
        !trimmed.startsWith('let') &&
        !trimmed.startsWith('var') &&
        !trimmed.startsWith('return') &&
        !trimmed.startsWith('export') &&
        !trimmed.startsWith('type') &&
        !trimmed.startsWith('interface') &&
        !trimmed.startsWith('function') &&
        !trimmed.startsWith('async') &&
        !trimmed.startsWith('await') &&
        !trimmed.startsWith('horizontal') &&
        !trimmed.startsWith('vertical') &&
        !trimmed.startsWith('showsHorizontal') &&
        !trimmed.startsWith('showsVertical') &&
        !trimmed.startsWith('scrollEventThrottle') &&
        !trimmed.startsWith('keyboardShouldPersist') &&
        !trimmed.startsWith('contentContainer') &&
        !trimmed.startsWith('nestedScrollEnabled') &&
        !trimmed.startsWith('pagingEnabled') &&
        !trimmed.startsWith('bounces') &&
        !trimmed.startsWith('decelerationRate') &&
        !trimmed.startsWith('snapTo') &&
        !trimmed.startsWith('removeClipped')
      ) {
        console.log(`${f}:${i+1}: "${trimmed}"`);
      }
    });
  } catch (e) {
    console.log(`Error reading ${f}: ${e.message}`);
  }
});
