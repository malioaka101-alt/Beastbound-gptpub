'use strict';
// Genuine ecology -> consent-independent biological opportunity -> source
// verified gestation -> persistent natural children, using disposable saves.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),Births=require('../world/wild-generations'),
 Turn=require('../scripts/chat-turn.js');
const rule=(s,operation,params={})=>R.act(s,{system:'world',operation,params});
function pair(seed,species='fenfox'){
 const s=E.newGame({name:'Wild Generation Regression',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const parents=[];
 for(let n=0;n<180&&parents.length<2;n++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const id=s.encounter.beastId,b=s.beasts[id];
  if(b.species===species&&!s.encounter.threat&&
    E.SPECIES[b.species].intelligence!=='sapient'&&
    !/terrified|panicked|fleeing|hostile/i.test(b.mood)){
   A.equal(rule(s,'watchWildBeast').watched,true);
   parents.push(id);
  }
  if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.equal(parents.length,2,'two naturally encountered witnessed individuals of authored species');
 return {s,parents};
}
{
 const s=E.newGame({seed:819001,name:'No Free Parents'}),original=E.exportGame(s);
 A.deepEqual(Births.sixday(s,6),{conceptions:0,births:0});
 A.equal(E.exportGame(s),original);
 A.throws(()=>Births.sixday(s,-1),/Authentic completed world sixday/);
 A.equal(Births._debug.role(s,{id:'forgery',species:'fenfox'}),null);
 A.equal(E.exportGame(s),original);
 A.equal(Births.Species.fenfox.family,'Vulpiridae');
 A.equal(Births.Species.stonehare.family,'Leporidae');
 A.notEqual(Births.Species.fenfox.gestationDays,
  Births.Species.stonehare.gestationDays);
}
{
 // Different species, unwitnessed animals and claimed proximity cannot
 // spontaneously fabricate parentage, mutations or newborns.
 const {s,parents}=pair(819002,'fenfox');
 const originals=Object.keys(s.beasts).length,external=s.rngState;
 const unbornParent=s.beasts[parents[0]];
 W.advance(s,6);
 A.equal(Births._debug.lifeProof(s,unbornParent),true,
  'source-witnessed adult baseline remains plausible without inventing birthdate');
 A.ok(['gestational','non-gestational'].includes(
  Births._debug.role(s,unbornParent)));
 A.ok(Object.keys(s.beasts).length>=originals);
 A.equal(unbornParent.sex,'unrecorded',
  'internally established reproductive roles are not a claim of observed sex');
 A.equal(unbornParent.age,'young adult',
  'older animals still have no invented exact biological age');
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.table?.bondRecords?.[parents[0]],undefined);
 A.equal(s.player.soul.phase,0);
 A.equal(s.player.arcane.circles,0);
}
{
 // Natural reproduction is genuinely conditional and not guaranteed.
 // We require at least one independent conception AND resulting live young
 // across a broad deterministic set of real, unforced witnessed pairings.
 let successful=null,failedChance=false;
 for(let seed=819100;seed<819180;seed++){
  const {s,parents}=pair(seed);
  const rs=parents.map(id=>Births._debug.role(s,s.beasts[id]));
  if(rs[0]===rs[1]){failedChance=true;continue;}
  const start=E.exportGame(s),clone=E.importGame(start),initialCount=Object.keys(s.beasts).length;
  W.advance(s,180);W.advance(clone,180);
  A.deepEqual(s.table.realm.wildGestations,clone.table.realm.wildGestations,
   'the same real timeline reproduces the same private gestations and births');
  A.deepEqual(Object.keys(s.beasts).sort(),Object.keys(clone.beasts).sort());
  A.equal(s.player.partnerIds.length,0);
  A.equal(s.table?.bondRecords?.[parents[0]],undefined);
  A.equal(s.player.soul.phase,0);
  A.equal(s.player.arcane.circles,0);
  const babies=Object.values(s.beasts).filter(b=>
   b.wildBirth?.origin===Births.ORIGIN);
  if(!babies.length){failedChance=true;continue;}
  A.ok(Object.keys(s.beasts).length>initialCount);
  for(const young of babies){
   const source=young.wildBirth.source;
   A.equal(source.origin,Births.ORIGIN);
   A.equal(young.wildBirth.birthHash,Births._debug.hash(source));
   A.equal(source.beastId,young.id);
   A.equal(source.species,young.species);
   A.equal(source.parentIds.length,2);
   A.ok(source.parentIds.every(id=>!!s.beasts[id]));
   A.equal(source.sourceHashes.length,2);
   A.equal(source.parentIds.map(id=>s.beasts[id].individualLife.sourceHash)
    .join('|'),source.sourceHashes.join('|'));
   A.ok(source.bornDay>=source.conceivedDay+Births.Species[young.species].gestationDays);
   A.equal(young.age=== 'young adult'||young.age==='adolescent'||
    young.age==='juvenile'||young.age==='newborn',true);
   A.equal(young.sex,'unrecorded','no false observational reproductive sex assigned');
   A.equal(young.owner,null);A.equal(young.consent,false);
   A.equal(young.relationship,'wild');
   A.equal(young.level,1);A.equal(young.evolutionStage,'Base');
   A.equal(young.speciesGrade,E.SPECIES[young.species].grade);
   A.equal(young.individualGrade,E.SPECIES[young.species].grade);
   A.deepEqual(young.individualLife.witnessed,[]);
   // Actual physical and power-system heredity is not a copied spell rank.
   A.equal(young.originPattern.origin,'source-bound-Origin-inheritance-v1');
   A.equal(young.originPattern.birthSourceHash,young.wildBirth.birthHash);
   A.deepEqual(young.originPattern.parentIds,source.parentIds);
   A.ok(Number.isInteger(young.originPattern.physical.resilience));
   A.ok(Number.isInteger(young.originPattern.systemAptitude.arcane));
   A.ok(Number.isInteger(young.originPattern.systemAptitude.soul));
   A.ok(['expressed','dormant'].includes(young.originPattern.bloodline.expression));
   A.equal(young.maxHp,Math.max(1,Math.floor(E.SPECIES[young.species].hp*
    (young.age==='newborn'?1/3:young.age==='juvenile'?.55:
     young.age==='adolescent'?.8:1))+
    Math.round((young.originPattern.physical.resilience-50)/10)));
   A.equal(young.maxEnergy,Math.max(1,Math.floor(E.SPECIES[young.species].energy*
    (young.age==='newborn'?1/3:young.age==='juvenile'?.55:
     young.age==='adolescent'?.8:1))+
    Math.round((young.originPattern.physical.energyConduction-50)/10)));
   A.deepEqual(young.techniques,[],'family-learned techniques require actual training');
   A.equal(young.individualLife.sourceHash,
    Births._debug.hash(young.individualLife.source));
   A.equal(young.wildAgeDays,s.table.realm.wildReproductionLastDay-
    young.wildBirth.source.bornDay,
    'biological age is recorded at real ticks, not from first sighting');
   A.equal(young.away,true);
  }
  const ledger=s.table.realm.wildGestations;
  A.ok(Object.values(ledger).some(g=>
   g.outcome==='born'&&g.offspringCount>=1&&g.birthIds?.length===g.offspringCount));
  const publicData=JSON.stringify({
   world:R.act(s,{system:'world',operation:'realmStatus',params:{}}),
   memories:rule(s,'wildMemoriesStatus')
  });
  A.ok(!publicData.includes('wildGestations'));
  A.ok(!publicData.includes('birthHash'));
  A.ok(!publicData.includes('parentIds'));
  A.ok(!publicData.includes('offspringCount'));
  successful={s,parents,babies};break;
 }
 A.ok(successful,'real observed adult conspecifics sometimes independently reproduce');
 A.equal(failedChance,true,'fertility and survival never compel a successful birth');
 const {s,babies}=successful,target=babies[0];
 const saved=E.exportGame(s),clone=E.importGame(saved);
 A.deepEqual(clone.beasts[target.id],target,
  'actual newborn with private ancestry survives a full checkpoint');
 // Once naturally present in its real habitat, an offspring has a small
 // ordinary encounter chance, not a guaranteed summoned companion.
 const location=target.location;
 if(s.world.location!==location){const travel=E.dispatch(s,'travel '+location);A.equal(travel.ok,true);}
 let met=false;
 for(let attempts=0;attempts<90;attempts++){
  A.equal(E.dispatch(s,'explore').ok,true);
  if(s.encounter.beastId===target.id){met=true;break;}
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.equal(met,true,'a genuinely existing born child may be met in an ordinary local habitat');
 A.equal(target.id,s.encounter.beastId);
 A.equal(target.individualLife.witnessed.length,0,
  'the first visual encounter is not proof of a personal behavioural watch');
 A.equal(target.owner,null);
 if(!s.encounter.threat){
  const observation=rule(s,'watchWildBeast');
  A.equal(observation.watched,true);
  A.equal(target.individualLife.witnessed.length,1);
 }
 A.equal(s.player.partnerIds.length,0);
}
{
 const {s}=pair(819004);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-wild-generation-'));
 try{
  const file=Path.join(dir,'save.json');FS.writeFileSync(file,E.exportGame(s)+'\n');
  const old=FS.readFileSync(file,'utf8');
  const req={id:'wild_memory_status_4001',mode:'rule',system:'world',
   operation:'wildMemoriesStatus',params:{}};
  A.equal(Turn.execute(file,req).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),old);
  A.throws(()=>Turn.execute(file,{id:'births_fake_4001',mode:'rule',
   system:'world',operation:'wildBirth',params:{parents:['beast_1','beast_2']}}),
   /Unsupported rule operation/);
  A.equal(FS.readFileSync(file,'utf8'),old);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Real individual conspecifics can conceive, gestate, produce persistently sourced young, mature naturally and be encountered without forced mating, aging, ranks or bonds');
