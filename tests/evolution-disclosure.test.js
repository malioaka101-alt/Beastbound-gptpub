'use strict';
// Unknown biological secrets must remain unknown even if a caller guesses
// the exact evolution branch key and repeatedly polls eligibility.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),P=require('../rules/progress'),
 Turn=require('../scripts/chat-turn.js');
function fixture(seed=82111){
 const s=E.newGame({name:'Sealed Evolution Observer',seed,path:'undecided'});
 s.beasts.fox={id:'fox',name:'Observed Fox',species:'fenfox',evolutionStage:'Base',sapience:1};
 P.register(s,{beastId:'fox',branchId:'secret',name:'Hidden Marsh Monarch',
  kind:'hidden',grade:3,requiredYears:0,documented:false,
  potential:5,gradeCeiling:5,
  conditions:[
   {label:'Documented catalyst',known:true,met:true},
   {label:'Secret moonwater truth',known:false,met:false}
  ]});
 return s;
}
const view=(s,operation='status',key='fox/secret')=>
 R.act(s,{system:'evolution',operation,params:{key}});
function disclose(s){
 s.table.evolutionDiscoveries={'fox/secret':{
  key:'fox/secret',beastId:'fox',species:'fenfox',evolutionStage:'Base',
  revealedToPlayer:true,worldMinute:s.world.minutes,
  source:'Previously witnessed independent field research naming the marsh evolution'
 }};
}
{
 const s=fixture(),before=E.exportGame(s),rng=s.rngState;
 const secret=view(s),unknown=view(s,'status','fox/nonexistent');
 A.deepEqual(secret,{known:false});
 A.deepEqual(secret,unknown);
 A.deepEqual(view(s,'eligibility'),unknown);
 A.equal(s.rngState,rng);A.equal(E.exportGame(s),before);
 disclose(s);
 const now=view(s);
 A.equal(now.known,true);
 A.equal(now.knownConditionsMet,true);
 A.equal(now.actualEligibility,'unconfirmed until witnessed evolution event');
 for(const key of ['ready','eligible','unknownUnmet','potential','gradeCeiling','gate']){
  A.equal(Object.hasOwn(now,key),false,'Leaked secret evolution state: '+key);
 }
 const failed=E.importGame(E.exportGame(s)),passed=E.importGame(E.exportGame(s));
 passed.table.evolution['fox/secret'].conditions[1].met=true;
 A.equal(P.status(failed.table.evolution['fox/secret']).ready,false);
 A.equal(P.status(passed.table.evolution['fox/secret']).ready,true);
 A.deepEqual(view(failed),view(passed));
 A.deepEqual(view(failed,'eligibility'),view(passed,'eligibility'));
 A.equal(JSON.stringify(view(failed)).includes('Secret moonwater'),false);
 const noSource=E.importGame(E.exportGame(s));
 noSource.table.evolutionDiscoveries['fox/secret'].revealedToPlayer=false;
 A.deepEqual(view(noSource),unknown);
 const future=E.importGame(E.exportGame(s));
 future.table.evolutionDiscoveries['fox/secret'].worldMinute+=1;
 A.deepEqual(view(future),unknown);
 const wrongForm=E.importGame(E.exportGame(s));
 wrongForm.beasts.fox.evolutionStage='Evolved';
 A.deepEqual(view(wrongForm),unknown);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-secret-branch-'));
 try{
  const file=Path.join(dir,'save.json'),s=fixture(82112);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const first=FS.readFileSync(file,'utf8');
  const q={id:'sealed_branch_status_001',mode:'rule',system:'evolution',
   operation:'status',params:{key:'fox/secret'}};
  const hidden=Turn.execute(file,q);
  A.equal(hidden.applied,false);A.deepEqual(hidden.output.rules,{known:false});
  A.equal(FS.readFileSync(file,'utf8'),first);
  disclose(s);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const saved=FS.readFileSync(file,'utf8');
  const eligible={id:'sealed_branch_eligible_001',mode:'rule',system:'evolution',
   operation:'eligibility',params:{key:'fox/secret'}};
  const result=Turn.execute(file,eligible);
  A.equal(result.applied,false);
  A.equal(result.output.rules.known,true);
  A.equal(result.output.rules.knownConditionsMet,true);
  A.equal(Object.hasOwn(result.output.rules,'eligible'),false);
  A.equal(Object.hasOwn(result.output.rules,'ready'),false);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Secret evolution readiness and branch name remain inaccessible without discovery');
