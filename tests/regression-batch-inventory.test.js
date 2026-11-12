'use strict';
// Every *.test.js file, including this audit itself, must be picked up
// automatically and counted once across the same deterministic CI batches.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const runner=path.join(root,'scripts/run-regression-batches.js');
const actual=fs.readdirSync(__dirname).filter(x=>x.endsWith('.test.js')).length;
const args=['--shards=3','--validate'];
const valid=cp.spawnSync(process.execPath,[runner,...args],{
 cwd:root,encoding:'utf8'});
assert.equal(valid.status,0,valid.stderr);
assert.match(valid.stdout,new RegExp('Verified test inventory: '+actual+' total independent test files across 3 batches'));
const totals=[...valid.stdout.matchAll(/Batch [123]\/3: (\d+) tests/g)]
 .map(x=>Number(x[1]));
assert.equal(totals.length,3);
assert.equal(totals.reduce((a,b)=>a+b,0),actual,
 'all discovered tests, including newly created ones, must be accounted for');
assert.ok(Math.max(...totals)-Math.min(...totals)<=1,
 'batched tests cannot silently leave all new tests on one worker');
for(const invalid of [
 ['--shards=0','--validate'],
 ['--shards=3','--shard=3'],
 ['--shards=3','--shard=-1'],
 ['--shards=3'],
 ['--shards=3','--shard=not-a-number']]){
 const failed=cp.spawnSync(process.execPath,[runner,...invalid],{
  cwd:root,encoding:'utf8'});
 assert.notEqual(failed.status,0,
  'Invalid batch request must fail closed instead of reporting partial coverage');
}
console.log('Regression batch inventory covers all '+actual+
 ' present test files exactly once, evenly distributed, and rejects invalid/incomplete shards PASS');
