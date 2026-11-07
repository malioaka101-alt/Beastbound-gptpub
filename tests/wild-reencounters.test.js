'use strict';
// Source-backed local searches and independent individual returns; disposable
// fixtures only. A game save is never changed by these tests.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),Wild=require('../world/wild-lives'),
 Turn=require('../scripts/chat-turn.js');
const rule=(s,operation,params={})=>
 R.act(s,{system:'world',operation,params});
function fixture(seed){
 const s=E.newGame({name:'Remembered Beast Fixture',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 for(let n=0;n<60;n++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const id=s.encounter.beastId,b=s.beasts[id];
  if(!s.encounter.threat&&
   E.SPECIES[b.species].intelligence!=='sapient'&&
   !/terrified|panicked|fleeing|hostile/i.test(b.mood)){
   const watched=rule(s,'watchWildBeast');
   A.equal(watched.watched,true);
   if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
   s.player.attributes.wis=30;
   s.player.skills.survival.rank=5;
   return {s,id,b,watched};
  }
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 throw Error('No legitimate calm animal generated');
}
{
 const s=E.newGame({name:'Unwitnessed search',seed:816001}),
  original=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'seekKnownWildBeast',{beastId:'unknown'}),
  /genuinely watched and remembered/);
 A.throws(()=>rule(s,'seekKnownWildBeast',{beastId:'unknown',chance:1}),
  /only a previously witnessed individual beastId/);
 A.deepEqual(rule(s,'wildMemoriesStatus').knownIndividuals,[]);
 A.throws(()=>rule(s,'wildMemoriesStatus',{locate:true}),/independently determined/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
}
{
 const {s,id,b}=fixture(816002),before=E.exportGame(s),rng=s.rngState;
 const known=rule(s,'wildMemoriesStatus');
 A.equal(known.knownIndividuals.length,1);
 A.equal(known.knownIndividuals[0].beastId,id);
 A.equal(known.knownIndividuals[0].lastSeenLocation,'forest');
 A.equal(known.knownIndividuals[0].currentlyPresent,'not established');
 A.equal(JSON.stringify(known).includes('"condition"'),false);
 A.equal(JSON.stringify(known).includes('"individualGrade"'),false);
 A.equal(JSON.stringify(known).includes('"hidden"'),false);
 A.equal(JSON.stringify(known).includes('"currentLocation"'),false);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>rule(s,'seekKnownWildBeast',{beastId:id,answer:'here'}),
  /only a previously witnessed individual beastId/);
 A.equal(E.exportGame(s),before);
 // A genuine search at a different habitat cannot act as a remote locator,
 // change the animal's own independent random stream or force its consent.
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(s.world.location,'fen');
 A.equal(b.location,'forest');
 const creatureRng=b.individualLife.rngState,
  beforeTime=s.world.minutes, beforeStamina=s.player.stamina;
 const result=rule(s,'seekKnownWildBeast',{beastId:id});
 A.equal(result.searched,true);
 A.equal(result.found,false);
 A.equal(result.minutes,45);A.equal(result.staminaSpent,3);
 A.equal(s.world.minutes,beforeTime+45);
 A.equal(s.player.stamina,beforeStamina-3);
 A.equal(result.check.success,true);
 A.equal(b.individualLife.rngState,creatureRng,
  'searching elsewhere cannot control an independent animal');
 A.equal(s.encounter,null);A.equal(s.player.partnerIds.length,0);
 A.equal(b.owner,null);A.equal(b.evolutionStage,'Base');
 A.equal(rule(s,'wildMemoriesStatus').knownIndividuals[0].lastSeenLocation,'forest');
 A.equal(JSON.stringify(result).includes('"location"'),false);
 A.equal(b.individualLife.searchAttempts.length,1);
 // No blanket daily search gate. An additional honest search costs effort.
 const again=rule(s,'seekKnownWildBeast',{beastId:id});
 A.equal(again.found,false);
 A.equal(b.individualLife.rngState,creatureRng);
 A.equal(b.individualLife.searchAttempts.length,2);
 A.equal(s.player.stamina,beforeStamina-6);
}
{
 let foundSample=null,missSample=null;
 for(let seed=816100;seed<816180;seed++){
  const x=fixture(seed),{s,id,b}=x;
  const oldLifeRng=b.individualLife.rngState,old=s.world.minutes;
  const result=rule(s,'seekKnownWildBeast',{beastId:id});
  A.equal(result.searched,true);A.equal(s.world.minutes,old+45);
  A.equal(result.noAutomaticBond,true);A.equal(result.noGuaranteedReturn,true);
  A.equal(s.player.partnerIds.length,0);A.equal(b.owner,null);
  A.equal(b.evolutionStage,'Base');
  A.equal(s.table?.bondRecords?.[id],undefined);
  A.equal(b.individualLife.searchAttempts.length,1);
  if(result.found){
   foundSample=x;foundSample.result=result;
   A.equal(s.encounter.beastId,id);
   A.equal(s.encounter.observed,false);
   A.equal(s.encounter.distanceMetres>=2&&s.encounter.distanceMetres<=17,true);
   A.equal(b.away,false);
   A.equal(b.individualLife.returnEncounters.length,1);
   A.equal(b.individualLife.returnEncounters[0].originalSourceHash,
    b.individualLife.sourceHash);
   A.notEqual(b.individualLife.rngState,oldLifeRng);
   const status=rule(s,'wildMemoriesStatus');
   A.equal(status.knownIndividuals[0].lastSeenLocation,'forest');
   // Return is a real encounter, not an instant species roll or free trust.
   if(s.encounter?.threat!==true){
    const response=rule(s,'watchWildBeast');
    A.equal(response.watched,true);
    A.equal(b.individualLife.witnessed.length,2);
   }
  }else{
   missSample=x;
   A.equal(s.encounter,null);
   A.equal(s.table?.bondRecords?.[id],undefined);
  }
  if(foundSample&&missSample)break;
 }
 A.ok(foundSample,'a truly present animal can independently be re-encountered');
 A.ok(missSample,'success at tracking does not compel a re-encounter');
}
{
 // Identity and provenance are required, not simply the player's claim.
 const {s,id,b}=fixture(816003);
 const correct=b.individualLife.sourceHash;
 b.individualLife.sourceHash='f'.repeat(64);
 const corrupted=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'seekKnownWildBeast',{beastId:id}),
  /Unverified individual animal life ledger/);
 A.equal(E.exportGame(s),corrupted);A.equal(s.rngState,rng);
 b.individualLife.sourceHash=correct;
 // No caveats can turn a contract, capture or a sapient person into
 // a searching loophole. Refusal happens before time or random draws.
 b.owner='keeper';
 const owned=E.exportGame(s),r2=s.rngState;
 A.throws(()=>rule(s,'seekKnownWildBeast',{beastId:id}),
  /independently living wild individual/);
 A.equal(E.exportGame(s),owned);A.equal(s.rngState,r2);
}
{
 const {s,id}=fixture(816004);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-wild-return-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const status={id:'wild_mem_read_0001',mode:'rule',system:'world',
   operation:'wildMemoriesStatus',params:{}};
  A.equal(Turn.execute(file,status).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const wrong={id:'wild_search_fake_0001',mode:'rule',system:'world',
   operation:'seekKnownWildBeast',params:{beastId:id,found:true}};
  A.throws(()=>Turn.execute(file,wrong),/only a previously witnessed individual beastId/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const request={id:'wild_search_real_0001',mode:'rule',system:'world',
   operation:'seekKnownWildBeast',params:{beastId:id}};
  const first=Turn.execute(file,request);
  A.equal(first.applied,true);A.equal(first.output.rules.searched,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const saved=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(saved.beasts[id].individualLife.searchAttempts.length,1);
  A.equal(saved.world.minutes,s.world.minutes+45);
  A.equal(saved.player.partnerIds.length,0);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Previously witnessed wild individuals can be sought again through real local effort; identity, autonomy, remote privacy, persistence and replay safety hold');
