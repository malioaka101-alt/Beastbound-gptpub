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
 'guardian-allowance-followthrough.test.js',
 'atomic-local-scene-turn.test.js',
 'gm-contextual-dc-adjudication.test.js',
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
// Previously the final gate re-executed these already-tested contracts.
// Require their presence instead; full batches still EXECUTE every test once.
const requiredCrossSystem=[
 'economy-existing-owned-material-assets.test.js',
 'economy-real-physical-production-source.test.js',
 'field-crafting.test.js','rank-depth-prototypes.test.js',
 'voluntary-person-material-handoffs.test.js',
 'live-provisioner-trade.test.js',
 'economy-original-scarcity-market-quotations.test.js',
 'economy-voluntary-original-merchant-worker-terms.test.js',
 'economy-original-wholesale-transport-disruptions.test.js',
 'economy-independent-regional-market-demand.test.js',
 'economy-independent-funded-real-local-purchase.test.js',
 'economy-independent-person-owned-material-sales.test.js',
 'civic-original-records-remedy.test.js',
 'civic-local-rights-and-sapient-standing.test.js',
 'civic-independent-local-law-enactment.test.js',
 'economy-original-paid-demand-price-pressure.test.js',
 'living-career-real-merchant-payments.test.js',
 'trade-original-interstate-corridor-history.test.js',
 'source-parity.test.js','source-coverage.test.js'
];
// Actual prior Actions wall-clock costs (seconds), rounded up as mere
// scheduling hints. Every test always executes; NO result is cached/faked.
const measuredSeconds=Object.freeze({
 'living-world.test.js':472,
 'agent-initiatives.test.js':364,
 'knowledge-diffusion.test.js':352,
 'meridian-npc-actual-unbroken-source-progression.test.js':112,
 'professional-peers-longrun.test.js':63,
 'emergent-groups.test.js':58,
 'family-members-longrun.test.js':56,
 'adaptive-ambitions.test.js':42,
 'government-offices.test.js':32,
 'open-learning-routes.test.js':26,
 'group-membership-runner.test.js':20,
 'beast-individuality.test.js':14,
 'emergent-careers.test.js':10,
 'beast-ecological-learning.test.js':9,
 'generated-family-kinship.test.js':3,
 'earned-senses.test.js':5,
 'ordinary-life-npc-journey.test.js':5,
 'emergent-people.test.js':5,
 'fantasy-canon.test.js':4
});
const estimatedCost=name=>measuredSeconds[name]||2;

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
 const missing=[...new Set([...priority,...requiredCrossSystem])].filter(x=>!all.includes(x));
 if(missing.length)throw Error('Focused original integration tests missing: '+missing.join(', '));
 assert.equal(new Set(all).size,all.length,'Ambiguous test inventory');
 const p=new Set(priority);
 return [...priority,...all.filter(x=>!p.has(x))];
}
function plan(tests,shards){
 const batches=Array.from({length:shards},()=>[]),
  loads=Array.from({length:shards},()=>0);
 // Deterministic longest-first allocation balances WALL TIME, not file count.
 const ranked=tests.map(name=>({name,seconds:estimatedCost(name)}))
  .sort((a,b)=>b.seconds-a.seconds||a.name.localeCompare(b.name));
 for(const item of ranked){
  let i=0;
  for(let n=1;n<shards;n++)
   if(loads[n]<loads[i]||
     loads[n]===loads[i]&&batches[n].length<batches[i].length)i=n;
  batches[i].push(item.name);loads[i]+=item.seconds;
 }
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
  (opts.shard===i?' [selected]':'')+
  '; estimated historic runtime '+files.reduce((n,x)=>n+estimatedCost(x),0)+'s\n'));
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
