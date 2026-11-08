'use strict';
// Beast-Origin §24: personally observed ecology -> provisional pattern map ->
// multidimensional compatibility report. No tissue, bloodline, ability,
// animal consent or human evolution can be invented from an observation.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),Rules=require('../rules'),
 Origin=require('../rules/beast-origin-foundations'),
 Power=require('../rules/power-overview'),
 Turn=require('../scripts/chat-turn.js');
const rule=(s,operation,params={})=>Rules.act(s,{system:'origin',operation,params});
const inspect=(seed=672310)=>{
 const s=E.newGame({seed,name:'Disposable Origin Investigator',path:'origin'});
 Rules.unified.ensurePlayer(s);
 s.player.attributes.wis=30;s.player.attributes.int=30;
 for(const skill of ['beastcraft','research','medicine','arcana','cultivation'])
  s.player.skills[skill].rank=5;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 let present=null;
 for(let attempts=0;attempts<25;attempts++){
  A.equal(E.dispatch(s,'explore').ok,true);
  if(s.encounter?.threat===false){present=s.encounter.beastId;break;}
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.ok(present,'A genuinely independent safe animal must be available');
 const b=s.beasts[present],species=b.species,originalOwner=b.owner;
 A.equal(originalOwner,null);
 const originalTime=s.world.minutes;
 const observed=Rules.act(s,{system:'world',operation:'observe',params:{}});
 A.equal(observed.identified,true);
 A.equal(observed.beastId,present);
 A.equal(s.world.minutes,originalTime+5);
 A.equal(s.table.wildlifeObservationEvidence[present].identified,true);
 return {s,id:present,species};
};
const study=(s,params)=>rule(s,'mapPattern',params);
const screen=(s,params)=>rule(s,'screenCompatibility',params);
{
 const s=E.newGame({seed:672301,name:'No Beast Knowledge',path:'origin'});
 const old=E.exportGame(s),rng=s.rngState;
 A.deepEqual(rule(s,'researchStatus').research,[]);
 A.equal(rule(s,'researchStatus').originPhase,0);
 A.throws(()=>study(s,{beastId:'imaginary_fox',focus:'habitat'}),/original successful noninvasive wildlife observation/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 for(const fake of [
  {beastId:'imaginary_fox',focus:'habitat',species:'fenfox'},
  {beastId:'imaginary_fox',focus:'habitat',knownAbility:'Legendary flame'},
  {beastId:'imaginary_fox',focus:'habitat',guaranteed:true},
  {beastId:'imaginary_fox',focus:'habitat',dc:2}
 ])A.throws(()=>study(s,fake),/only actual recorded/i);
 A.equal(E.exportGame(s),old);
}
{
 const {s,id,species}=inspect(672311);
 const originBefore=structuredClone(s.player.origin);
 const animalBefore=s.beasts[id].owner;
 const before=E.exportGame(s),rng=s.rngState;
 const available=rule(s,'researchStatus');
 A.deepEqual(available.research,[]);
 A.equal(Power.read(s).origin.preliminaryResearch.originPhase,0);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 for(const p of [
  {beastId:id,focus:'habitat',claimTrait:'Glimmer Veil'},
  {beastId:id,focus:'habitat',material:'free blood'},
  {beastId:id,focus:'aquatic dragon wings'},
  {beastId:id,focus:'habitat',minutes:0},
  {beastId:id,focus:'habitat',approach:'I win'},
  {beastId:id,focus:'habitat',selectedRank:9}
 ]){A.throws(()=>study(s,p));A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);}
 let mapping=null,totalStamina=0,totalMinutes=0;
 for(let i=0;i<10&&(!mapping||!mapping.mapped);i++){
  const start=s.world.minutes,priorStamina=s.player.stamina;
  const r=study(s,{beastId:id,focus:'habitat',minutes:15,
   approach:'Compare already witnessed ecology with plausible human sensory and metabolic limitations'});
  A.equal(r.staminaSpent,1);
  A.equal(r.feeTalons,0);
  A.equal(r.animalDisturbed,false);
  A.equal(r.noBloodlineAwarded,true);
  A.equal(r.noSeeding,true);
  A.equal(r.actualTraitIdentified,false);
  A.equal(r.actualAnatomyUnmeasured,true);
  A.ok(Number.isInteger(r.check.roll));
  A.equal(r.check.dc,15);
  A.equal(s.player.stamina,priorStamina-1);
  A.equal(s.world.minutes,start+15);
  totalStamina++;totalMinutes+=15;mapping=r;
 }
 A.equal(mapping.mapped,true,'Real successful noninvasive checks produce a provisional research map');
 A.ok(mapping.candidateId.startsWith('originmap_'));
 A.equal(mapping.speciesName,E.SPECIES[species].name);
 A.equal(mapping.studiedFact,E.SPECIES[species].biome);
 A.equal(s.player.origin.phase,0);
 A.deepEqual(s.player.origin,originBefore);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.beasts[id].owner,animalBefore);
 const mapped=rule(s,'researchStatus');
 A.equal(mapped.research.length,1);
 A.equal(mapped.research[0].mapped,true);
 A.equal(mapped.research[0].seedingApproved,false);
 A.equal(mapped.research[0].traitExpressed,false);
 A.equal(Power.read(s).origin.preliminaryResearch.research[0].mapped,true);
 const frozen=E.exportGame(s),noRoll=s.rngState;
 A.throws(()=>study(s,{beastId:id,focus:'habitat'}),/already produced its original/);
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,noRoll);
 const saved=E.importGame(E.exportGame(s));
 A.equal(Origin.verifiedMap(saved,saved.table.originPatternStudies[mapping.candidateId]).confirmedTrait,false);
 // A rolling public scene journal can rotate. Mapping is independently
 // checkpointed and must retain its original witnessed source.
 saved.log=[];
 A.equal(Origin.verifiedMap(saved,saved.table.originPatternStudies[mapping.candidateId]).candidateId,mapping.candidateId);
 const fake=E.importGame(frozen);
 fake.table.originPatternStudies[mapping.candidateId].originalObservation.species='dragon';
 A.throws(()=>Origin.verifiedMap(fake,fake.table.originPatternStudies[mapping.candidateId]),/original observed source/);
 const s0=s.player.stamina,t0=s.world.minutes;
 for(const axis of Origin.AXES){
  const oldStamina=s.player.stamina,start=s.world.minutes;
  const r=screen(s,{candidateId:mapping.candidateId,axis,minutes:15,
   approach:'Assess the existing human body and energy system without importing any beast material'});
  A.equal(r.screeningOnly,true);
  A.equal(r.approvalForSeeding,false);
  A.equal(r.noIntegrationDone,true);
  A.equal(r.noNewTrait,true);
  A.equal(r.donorConsentNotEstablished,true);
  A.equal(r.staminaSpent,1);
  A.equal(r.minutes,15);
  A.equal(r.feeTalons,0);
  A.ok(Number.isInteger(r.check.roll));
  A.equal(s.player.stamina,oldStamina-1);
  A.equal(s.world.minutes,start+15);
  A.ok(['promising','caution','inconclusive'].includes(r.result));
  A.ok(Array.isArray(r.remainingAxes));
  if(axis==='energetic'){
   A.ok(r.riskFlags.some(x=>/throughput/.test(x)),
    'An unawakened energetic architecture is a caution, not a mandatory rank gate');
   A.equal(r.result,'caution');
  }
 }
 A.equal(s.player.stamina,s0-4);
 A.equal(s.world.minutes,t0+60);
 A.deepEqual(s.player.origin,originBefore);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.soul.phase,0);
 A.equal(s.player.rift.step,0);
 A.deepEqual(s.player.body.cycles,[]);
 A.equal(rule(s,'researchStatus').research[0].compatibility.length,4);
 const repeat=E.exportGame(s),repeatRng=s.rngState;
 A.throws(()=>screen(s,{candidateId:mapping.candidateId,axis:'physical',dc:1}),/only actual recorded/i);
 A.throws(()=>screen(s,{candidateId:mapping.candidateId,axis:'physical',donorConsent:true}),/only actual recorded/i);
 A.throws(()=>screen(s,{candidateId:'originmap_000000000000000000',axis:'physical'}),/provisional beast-pattern map/);
 A.equal(E.exportGame(s),repeat);A.equal(s.rngState,repeatRng);
}
{
 // No imaginary consent: a genuinely observed animal must remain an
 // independently acting individual. A failed original observation cannot
 // be repurposed as a purported species pattern source.
 const {s,id}=inspect(672320);
 s.table.wildlifeObservationEvidence[id].identified=false;
 const original=E.exportGame(s),rng=s.rngState;
 A.throws(()=>study(s,{beastId:id,focus:'habitat',minutes:15}),/original successful/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
}
{
 // Severe failure is meaningful epistemically without pretending that an
 // ordinary notebook study performs a dangerous beast-organ transplant.
 let seen=false;
 for(let seed=698101;seed<698190&&!seen;seed++){
  const {s,id}=inspect(seed);
  s.player.attributes.wis=10;
  s.player.skills.beastcraft.rank=0;s.player.skills.research.rank=0;
  s.rngState=(Math.imul(seed,2654435761)>>>0)||1;
  const r=study(s,{beastId:id,focus:'diet',minutes:15});
  if(r.check.degree==='severe failure'){
   seen=true;A.equal(r.mapped,false);
   A.equal(s.player.origin.phase,0);
   A.equal(s.player.origin.stableTraits.length,0);
   A.equal(s.beasts[id].owner,null);
  }
 }
 A.equal(seen,true,'Real original research checks can be seriously mistaken without free implants');
}
{
 const {s,id}=inspect(672330),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-origin-mapping-'));
 try{
  const save=Path.join(dir,'disposable.json');
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const req={id:'origin_mapping_672330',mode:'rule',system:'origin',operation:'mapPattern',
   params:{beastId:id,focus:'habitat',minutes:15}};
  const first=Turn.execute(save,req);
  A.equal(first.ok,true);A.equal(first.applied,true);
  A.ok(Number.isInteger(first.output.rules.check.roll));
  const after=FS.readFileSync(save,'utf8');
  const second=Turn.execute(save,req);
  A.equal(second.duplicate,true);A.equal(second.applied,false);
  A.equal(FS.readFileSync(save,'utf8'),after);
  A.equal(E.importGame(after).world.minutes,s.world.minutes+15);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Beast-Origin: actual witnessed ecological data, earned provisional mapping and separate safety screens, no invented traits, organ harvesting, forced bonds or automatic evolution; private replay protected');
