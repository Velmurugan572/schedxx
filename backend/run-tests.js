import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

const cwd = process.cwd();
const result = spawnSync('C:/Program Files/nodejs/node.exe', [path.join(cwd, 'node_modules/jest/bin/jest.js'), '--runInBand', '--detectOpenHandles', '--verbose'], {
  cwd,
  encoding: 'utf8',
  env: { ...process.env, FORCE_COLOR: '0' }
});

writeFileSync(path.join(cwd, 'jest-result.txt'), `${result.stdout}\n---STDERR---\n${result.stderr}`);
writeFileSync(path.join(cwd, 'jest-exit.txt'), String(result.status ?? 'null'));
console.log(JSON.stringify({ status: result.status, stdoutLength: result.stdout.length, stderrLength: result.stderr.length }));
