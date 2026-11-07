'use strict';
// Only genuinely encountered sapient beast persons can acquire this life.
// Tests use throwaway worlds, not any active campaign save.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Time=require('../rules/world'),People=require('../world/sapient-beast-persons'),
 Practice=require('../world/earned-individual-practice'),
 Turn=require('../scripts/chat-turn.js');
const fresh=seed=>E.newGame({name:'Sapient Personhood Fixture',seed,path:'undecided'});
const social=(s,op,p={})=>R.act(s,{system:'social',operation:op,params:p});
function meet(seed,site='forest'){
 const s=fresh(seed);
 A.equal(E.dispatch(s,'travel '+site).ok,true);
 for(let n=0;n<150;n++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],sp=E.SPECIES[b.species];
  if(sp.intelligence==='sapient'&&!s.encounter.threat&&
   !/hostile|agitated|panicked|terrified|fleeing/i.test(b.mood))
   return {s,b};
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 throw Error('No original engine encounter with a nonhostile sapient beast');
}
{
 const s=fresh(963201),before=E.exportGame(s),rng=s.rngState;
 A.deepEqual(social(s,'sapientBeastMemoriesStatus').personallyWitnessedContacts,[]);
 A.throws(()=>social(s,'meetSapientBeast'),
  /genuinely present sapient person/);
 for(const p of [{beastId:'phantom'},{forceConsent:true},{technique:'Gifted Spell'},
  {outcome:'guaranteed friendly'}])
  A.throws(()=>social(s,'meetSapientBeast',p),
   /choose their own actions/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 Time.advance(s,200);
 A.equal(Object.values(s.beasts).some(x=>x.sapientLife),false,
  'calendar time alone may not spawn biographies or grant beast careers');
}
{
 const {s,b}=meet(963202),id=b.id,
  originalRank=b.level,grade=b.individualGrade,
  techniques=JSON.stringify(b.techniques),playerGrade=s.player.skills.beastcraft.rank;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>R.act(s,{system:'world',operation:'watchWildBeast',params:{}}),
  /Sapient beast persons require independent dialogue/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const outcome=social(s,'meetSapientBeast');
 A.equal(outcome.encountered,true);
 A.equal(outcome.noContractOrOwnership,true);
 A.equal(outcome.noAssumedSharedLanguage,true);
 A.equal('privateAptitude' in outcome,false);
 A.equal('privateRanks' in outcome,false);
 A.equal(People.verify(b),true);
 const life=b.sapientLife;
 A.equal(life.source.origin,People.ORIGIN);
 A.equal(life.source.beastId,id);
 A.equal(life.sourceHash,People._debug.hash(life.source));
 A.equal(life.practice.origin,Practice.ORIGIN);
 A.equal(life.noInferredSociety,true);
 A.equal(life.noImposedProfession,true);
 A.equal(life.practice.attempts,0,'polite contact does not grant career experience');
 A.equal(b.owner,null);A.equal(b.relationship,'wild');
 A.equal(b.level,originalRank);
 A.equal(b.individualGrade,grade);
 A.equal(JSON.stringify(b.techniques),techniques);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.player.skills.beastcraft.rank,playerGrade);
 A.equal(s.table?.bondRecords?.[id],undefined);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.soul.phase,0);
 const remembered=social(s,'sapientBeastMemoriesStatus');
 A.equal(remembered.personallyWitnessedContacts.length,1);
 A.equal(remembered.personallyWitnessedContacts[0].species,E.SPECIES[b.species].name);
 A.equal(JSON.stringify(remembered).includes('aptitude'),false);
 A.equal(JSON.stringify(remembered).includes('privateCompetence'),false);
 A.equal(JSON.stringify(remembered).includes('currentLocation'),false);
 A.equal(JSON.stringify(remembered).includes('ecologicalLearning'),false);
 const frozen=E.exportGame(s),seenRng=s.rngState;
 A.deepEqual(social(s,'sapientBeastMemoriesStatus'),remembered);
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,seenRng);
 A.throws(()=>social(s,'sapientBeastMemoriesStatus',{privateRanks:true}),
  /choose their own actions/);
 A.equal(E.exportGame(s),frozen);
 if(s.encounter){
  A.throws(()=>social(s,'meetSapientBeast'),/already responded/);
  A.equal(E.exportGame(s),frozen);
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 const saved=E.exportGame(s),parallel=E.importGame(saved);
 Time.advance(s,180);Time.advance(parallel,180);
 A.deepEqual(s.beasts[id],parallel.beasts[id]);
 A.equal(s.rngState,parallel.rngState);
 A.equal(People.verify(b),true);
 A.equal(Practice.verify(life.practice,'sapient:'+id,
  life.sourceHash,People._debug.aptitude(b)),true);
 A.equal(life.practice.receipts.length<=24,true);
 A.ok(life.practice.attempts>0,
  'a free-willed individual sometimes undertakes real work while offscreen');
 A.ok(life.practice.receipts.every(x=>x.source.origin===Practice.ORIGIN));
 A.ok(life.practice.receipts.every(x=>['field-judgement','resource-care'].includes(x.source.domain)));
 A.ok(life.practice.receipts.every(x=>x.source.success===undefined));
 A.equal(b.level,originalRank);A.equal(b.individualGrade,grade);
 A.equal(JSON.stringify(b.techniques),techniques);
 A.equal(b.owner,null);A.equal(b.relationship,'wild');
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.table?.bondRecords?.[id],undefined);
 A.equal(s.player.skills.beastcraft.rank,playerGrade);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.soul.phase,0);
 A.deepEqual(social(s,'sapientBeastMemoriesStatus'),remembered);
 const untampered=structuredClone(life.practice);
 life.practice.points['field-judgement']=9999;
 A.equal(People.verify(b),false,
  'private earned competence cannot be silently assigned by save data');
 life.practice=untampered;
 A.equal(People.verify(b),true);
}
{
 // The independent participant is genuinely able to decline an approach;
 // the player cannot reroll consent or claim mutual understanding.
 let allowed=false,declined=false;
 for(let seed=963220;seed<963240;seed++){
  const {s,b}=meet(seed);
  const result=social(s,'meetSapientBeast');
  allowed||=result.freelyEngaged;declined||=!result.freelyEngaged;
  A.equal(result.noFreeSkills,true);
  A.equal(b.sapientLife.practice.attempts,0);
  if(!result.freelyEngaged){
   A.equal(s.encounter,null);
   A.equal(b.away,true);
  }
  if(allowed&&declined)break;
 }
 A.equal(allowed,true);
 A.equal(declined,true);
}
{
 // Later partnership or personhood developments must preserve REAL
 // individual work and memories while stopping independent-wild routines.
 const {s,b}=meet(963251);
 social(s,'meetSapientBeast');
 if(s.encounter)E.dispatch(s,'leave');
 Time.advance(s,35);
 const before=structuredClone(b.sapientLife);
 const clone=E.importGame(E.exportGame(s)).beasts[b.id];
 clone.owner='another-person';clone.relationship='partner';
 A.equal(People.verify(clone),true);
 const state=JSON.stringify(clone.sapientLife);
 const world=E.importGame(E.exportGame(s));
 const owned=world.beasts[b.id];
 owned.owner='another-person';owned.relationship='partner';
 Time.advance(world,30);
 A.equal(JSON.stringify(owned.sapientLife),state);
 A.ok(before.practice.attempts>=0);
}
{
 // Private chat-turn action is idempotent; read-only memories never write.
 const {s,b}=meet(963261),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-persons-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const read={id:'sapient_private_memories_001',mode:'rule',
   system:'social',operation:'sapientBeastMemoriesStatus',params:{}};
  A.equal(Turn.execute(file,read).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const conversation={id:'actual_sapient_choice_001',mode:'rule',
   system:'social',operation:'meetSapientBeast',params:{}};
  const first=Turn.execute(file,conversation);
  A.equal(first.applied,true);
  A.equal(first.output.rules.encountered,true);
  A.equal(Turn.execute(file,conversation).duplicate,true);
  const saved=FS.readFileSync(file,'utf8');
  const reloaded=E.importGame(saved);
  A.equal(People.verify(reloaded.beasts[b.id]),true);
  const memories=Turn.execute(file,{...read,id:'sapient_private_memories_002'});
  A.equal(memories.applied,false);
  A.equal(memories.output.rules.personallyWitnessedContacts.length,1);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  A.throws(()=>Turn.execute(file,{
   ...conversation,id:'forged_sapient_003',
   params:{chooseConsent:true,rank:5}
  }),/choose their own actions/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Genuine encountered sapient beast persons freely respond, maintain their own private earned work and culture boundaries, never unlock ranks by time or player assertion, and replay safely');
