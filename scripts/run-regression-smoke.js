'use strict';
// Fast development-only regression feedback. This NEVER replaces the
// exact-head FULL regression on ready-for-review or workflow_dispatch.
// Runs source/parity/actor contracts and last-commit changed short tests,
// validates changed JavaScript syntax, but DEFERS measured long-run worlds
// without falsely reporting those tests as passed.
const fs=require('node:fs'),Path=require('node:path'),
 CP=require('node:child_process');
const ROOT=Path.resolve(__dirname,'..'),TESTS=Path.join(ROOT,'tests');
const QUICK=[
 'source-parity.test.js',
 'source-coverage.test.js',
 'atomic-local-scene-turn.test.js',
 'gm-contextual-dc-adjudication.test.js',
 'meridian-shared-existing-advanced-ladder.test.js',
 'meridian-shared-existing-stage-four-sea.test.js',
 'meridian-shared-existing-stage-five-web.test.js',
 'meridian-shared-ladder-npc-stage-two.test.js',
 'meridian-reused-original-108-gate-npc.test.js',
 'meridian-npc-stage-four-five-isolated-source-contract.test.js',
 'meridian-npc-witnessed-night-qi-source-contract.test.js',
 'living-shared-original-clinic-physical-law.test.js',
 'living-npc-source-backed-clinic-readiness.test.js',
 'living-npc-original-body-force-combat.test.js',
 'meridian-npc-actual-sixday-serious-convalescence.test.js',
 'clinic-original-treatment-course-source.test.js',
 'independent-autonomous-offscreen-original-power.test.js'
];
// These sources were MEASURED on GitHub Actions at >10s, several >350s.
// They remain in every ready-for-review full regression and are NOT marked
// as having run by this edit-time smoke runner.
const EXPENSIVE=new Set([
 'living-world.test.js','agent-initiatives.test.js',
 'knowledge-diffusion.test.js',
 'meridian-npc-actual-unbroken-source-progression.test.js',
 'living-npc-source-born-original-soul-first-stage.test.js',
 'living-npc-original-body-through-organ-three-live.test.js',
 'living-npc-rift-anchor-two-unbroken-source-life.test.js',
 'living-npc-rift-anchor-two-long-form-assessment.test.js',
 'professional-peers-longrun.test.js','adaptive-ambitions.test.js',
 'emergent-groups.test.js','family-members-longrun.test.js',
 'government-offices.test.js','open-learning-routes.test.js',
 'group-membership-runner.test.js','beast-individuality.test.js',
 'beast-ecological-learning.test.js'
]);
function changed(){
 try{return CP.execFileSync('git',['diff','--name-only','HEAD^','HEAD'],{
   cwd:ROOT,encoding:'utf8',timeout:10000}).split(/\r?\n/).filter(Boolean);
 }catch(e){
  process.stdout.write('Last-commit diff unavailable; fixed smoke contracts still run.\n');
  return [];
 }
}
function runNode(args,label){
 const result=CP.spawnSync(process.execPath,args,{
  cwd:ROOT,stdio:'inherit',env:process.env,timeout:45000});
 if(result.error||result.status!==0)
  throw Error('FAST regression FAILED at '+label+
   ': '+(result.error?.message||'exit '+result.status));
}
function main(){
 // Cheap but REAL inventory proof: all discovered full-regression files
 // exist and receive exactly one deterministic six-shard assignment.
 runNode(['scripts/run-regression-batches.js','--shards=6','--validate'],
  'full exact-once test inventory and original source contract coverage');
 const files=changed(),
  selected=new Set(QUICK),deferred=[];
 for(const file of files){
  if(file.startsWith('tests/')&&file.endsWith('.test.js')&&
    fs.existsSync(Path.join(ROOT,file))){
   const name=Path.basename(file);
   if(EXPENSIVE.has(name)){deferred.push(name);continue;}
   selected.add(name);
  }
 }
 for(const file of files){
  if(!file.endsWith('.js')||!fs.existsSync(Path.join(ROOT,file)))continue;
  process.stdout.write('Syntax: '+file+'\n');
  runNode(['--check',file],file);
 }
 for(const name of selected){
  const path=Path.join(TESTS,name);
  if(!fs.existsSync(path))throw Error('Required fast source contract missing: '+name);
  process.stdout.write('::group::FAST tests/'+name+'\n');
  runNode([path],name);
  process.stdout.write('::endgroup::\n');
 }
 if(deferred.length)process.stdout.write('DEFERRED to required FULL regression (not executed here): '+
  deferred.join(', ')+'\n');
 process.stdout.write('FAST development smoke PASS: '+selected.size+
  ' real short source tests executed, '+files.filter(x=>x.endsWith('.js')).length+
  ' changed JS files syntax-checked as present; expensive worlds remain mandatory at ready-for-review.\n');
}
main();
