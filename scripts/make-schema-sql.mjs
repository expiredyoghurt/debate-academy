import { SCHEMA } from '../src/schema.js';
import { writeFileSync } from 'node:fs';
writeFileSync(new URL('../schema.sql', import.meta.url), SCHEMA.map((s) => s.trim() + ';').join('\n\n') + '\n');
console.log('schema.sql written (' + SCHEMA.length + ' statements)');
