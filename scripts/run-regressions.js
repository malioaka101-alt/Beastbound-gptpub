'use strict';
// Run the identical ordered Node test inventory used by GitHub Actions.
// This is a local fallback when GitHub cannot schedule a runner, not a pass marker.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/engine-tests.yml'), 'utf8');
const block = workflow.match(/^\s*tests=\(\s*\n([\s\S]*?)^\s*\)\s*$/m);
if (!block) throw Error('Could not locate the authoritative GitHub Actions regression inventory');
const tests = block[1].split(/\r?\n/).map(line => line.trim()).filter(Boolean);
if (!tests.length || tests.some(file => !/^tests\/[a-z0-9-]+\.test\.js$/.test(file)) ||
    new Set(tests).size !== tests.length) {
  throw Error('Regression inventory is empty, duplicated or contains an unsafe test path');
}
for (const file of tests) {
  if (!fs.statSync(path.join(root, file), {throwIfNoEntry:false})?.isFile()) {
    throw Error('Missing required test file: ' + file);
  }
}
console.log(`Running all ${tests.length} tests from .github/workflows/engine-tests.yml`);
for (const [index, file] of tests.entries()) {
  console.log(`\n[${index + 1}/${tests.length}] ${file}`);
  const result = spawnSync(process.execPath, [file], {cwd:root, stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error(`Regression failed at ${file}; full gate NOT passed.`);
    process.exit(result.status || 1);
  }
}
console.log(`\nFull regression gate passed: ${tests.length}/${tests.length} Node tests.`);
