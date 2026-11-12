'use strict';
// Beastbound: deterministic complete regression inventory for parallel CI.
// Every tests/*.test.js file is run exactly once across all shards. The
// readiness check can re-run selected cross-system tests after every shard.
// This script does not change saves, requests, results, or any campaign.
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const assert=require('node:assert/strict');

const root=path.resolve(__dirname,'..');
const dir=path.join(root,'tests');
const priority=[
 'group-purpose-sustained-independent-departure.test.js',
 'group-purpose-independent-member-responses.test.js',
 'group-evolving-declared-purpose.test.js',
 'group-member-persistent-dissent-agency.test.js',
 'group-original-coordinator-setback-reconsideration.test.js',
 'group-original-treasury-custody.test.js',
 'diplomacy-genuine-bilateral-exploratory-contact.test.js',
 'diplomacy-original-bilateral-office-context.test.js',
 'original-diplomatic-courier-public-provenance.test.js',
 'trade-original-interstate-corridor-history.test.js'
];
function integer(arg,flag){
 const raw=arg.split('=')[1],n=Number(raw);
 if(!Number.isInteger(n)||String(n)!==raw)
  throw Error(flag+' must be an explicit integer');
 return n;
}
function parse(argv){
 const options={shards:null,shard:null,validate:false};
 for(const arg of argv){
  if(arg==='--validate')options.validate=true;
  else if(arg.startsWith('--shards='))options.shards=integer(arg,'--shards');
  else if(arg.startsWith('--shard='))options.shard=integer(arg,'--shard');
  else throw Error('Unknown regression argument '+arg);
 }
 if(options.shards===null||options.shards<1||options.shards>12||
  options.shard!==null&&(options.shard<0||options.shard>=options.shards)||
  !options.validate&&options.shard===null)
  throw Error('Use --shards=N --shard=zero-based-index, or --shards=N --validate');
 return options;
}
function inventory(){
 const all=fs.readdirSync(dir,{withFileTypes:true})
  .filter(x=>x.isFile()&&x.name.endsWith('.test.js'))
  .map(x=>x.name).sort();
 if(!all.length)throw Error('Missing regression test inventory');
 const missing=priority.filter(x=>!all.includes(x));
 if(missing.length)throw Error('Focused original integration tests missing: '+missing.join(', '));
 assert.equal(new Set(all).size,all.length,'Ambiguous test inventory');
 const p=new Set(priority);
 return [...priority,...all.filter(x=>!p.has(x))];
}
function plan(tests,shards){
 const batches=Array.from({length:shards},()=>[]);
 tests.forEach((name,i)=>batches[i%shards].push(name));
 const joined=batches.flat();
 assert.equal(joined.length,tests.length,'Incomplete regression coverage');
 assert.equal(new Set(joined).size,tests.length,'Duplicate regression assignments');
 assert.deepEqual([...joined].sort(),[...tests].sort(),
  'Shard assignment must cover every test exactly once');
 if(batches.some(x=>!x.length))
  throw Error('An empty batch is not a meaningful regression runner');
 return batches;
}
function main(){
 const opts=parse(process.argv.slice(2)),tests=inventory(),
  batches=plan(tests,opts.shards);
 process.stdout.write('Verified test inventory: '+tests.length+
  ' total independent test files across '+opts.shards+' batches.\n');
 batches.forEach((files,i)=>process.stdout.write(
  'Batch '+(i+1)+'/'+batches.length+': '+files.length+' tests'+
  (opts.shard===i?' [selected]':'')+'\n'));
 if(opts.validate)return;
 const files=batches[opts.shard];
 for(let i=0;i<files.length;i++){
  const file=path.join(dir,files[i]);
  const label='tests/'+files[i];
  process.stdout.write('::group::'+label+' ['+(i+1)+'/'+files.length+']\n');
  // Inherit real node execution, exit status and output. Never ignore an
  // assertion failure or invent a pass for a test that did not run.
  const status=cp.spawnSync(process.execPath,[file],{
   cwd:root,stdio:'inherit',env:process.env});
  process.stdout.write('::endgroup::\n');
  if(status.error)throw status.error;
  if(status.status!==0){
   process.stderr.write('Regression batch '+(opts.shard+1)+
    ' FAILED at '+label+' (exit '+status.status+
    ', signal '+status.signal+').\n');
   process.exitCode=status.status||1;
   return;
  }
 }
 process.stdout.write('Batch '+(opts.shard+1)+' PASS: all '+
  files.length+' of its tests executed; full integration needs all batches and gate.\n');
}
main();
