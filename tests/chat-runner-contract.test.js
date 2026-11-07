'use strict';
// This regression protects the human-facing Project runner instructions from
// reintroducing free skill dice or caller-selected beast plans.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const doc=fs.readFileSync(path.join(__dirname,'../docs/UNIFIED_CHAT_RUNNER.md'),'utf8');

assert.match(doc,/precommitted in `table\.sceneChecks\[checkId\]`/);
assert.match(doc,/existing `checkId` alone/);
assert.match(doc,/previously witnessed scene-log hash/);
assert.match(doc,/true modifier from earned skill ranks/);
assert.match(doc,/original Practice Points/);
assert.doesNotMatch(doc,/use `mode:"check"` with `attribute`, `skill`, `dc`/);

assert.match(doc,/`combat\.begin` accepts \*only\* its `beastId`/);
assert.match(doc,/engine—not the GM or player—chooses/);
assert.match(doc,/independent `attack`, `hold` or `retreat`/);
assert.match(doc,/Without a current independently sourced profile/);
assert.doesNotMatch(doc,/"enemyPlan"\s*:/);
assert.doesNotMatch(doc,/GM commits the beast's independent plan/);

const example=doc.match(/^\{"id":"example_exchange_00002".*\}$/m);
assert.ok(example,'Missing protected combat exchange example');
const request=JSON.parse(example[0]);
assert.equal(request.mode,'rule');
assert.equal(request.system,'combat');
assert.equal(request.operation,'exchange');
assert.deepEqual(request.params,{intent:'defend'});
// The quick execution guide must not reintroduce old paid quest or
// caller-authored DC shortcuts when giving the narrator example requests.
const quick=fs.readFileSync(path.join(__dirname,
 '../docs/CHAT_EXECUTION.md'),'utf8');
assert.match(quick,/previously witnessed and precommitted scene challenge/);
assert.match(quick,/source-grounded/);
assert.match(quick,/read-only observation/i);
assert.doesNotMatch(quick,/"action":"quest accept/);
assert.doesNotMatch(quick,/"dc":14/);
assert.doesNotMatch(quick,/"attribute":"wis"/);
assert.match(quick,/"action":"look"/);
assert.match(quick,/34-character plain-text panels are fallback/);
console.log('Private runner examples cannot bypass scene provenance or enemy agency');
