import app from './src/app.js';
import { writeFileSync } from 'fs';
import path from 'path';

const outPath = path.resolve('module6-verification.txt');
writeFileSync(outPath, 'APP_OK');
console.log('APP_OK');
