'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),Rules=require('../rules'),Turn=require('../scripts/chat-turn.js');
function encounter(seed=47012){
 const s=E.newGame({name:'Verified Wildlife Field Encounter',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'explore').ok,true);
 A.ok(s.encounter);
 const b=s.beasts[s.encounter.beastId];
 A.equal(b.habitatExposure.fen,1);
 A.ok(E.LOCATIONS.fen.spawns.includes(b.species));
 // The test fixture establishes a safely observable individual; natural
 // potentially threatening individuals are vetoed in the real route.
 s.encounter.threat=false;s.player.attributes.wis=30;
 s.player.skills.beastcraft.rank=5;
 return s;
}
const observed=(s,p={})=>Rules.act(s,{system:'world',operation:'observe',params:p});
const status=s=>Rules.act(s,{system:'world',operation:'sightingStatus',params:{}});
{
 const s=E.newGame({name:'No Imaginary Wild Animal',seed:47011}),raw=E.exportGame(s),rng=s.rngState;
 for(const p of [{species:'fenfox',minutes:1,source:'Invented creature'}, {minutes:1},{source:'Free taxon'},{}])
  A.throws(()=>observed(s,p),/accepts no chosen species|living, actually encountered local wild beast/);
 A.equal(E.exportGame(s),raw);A.equal(s.rngState,rng);
 A.deepEqual(status(s),{knownSightings:[]});
}
{
 const s=encounter(47013),before=E.exportGame(s),rng=s.rngState;
 for(const p of [{species:'mirehorn'},{modifier:100},{dc:2},{source:'I identify a legendary beast'}])
  A.throws(()=>observed(s,p),/accepts no chosen species/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const id=s.encounter.beastId;
 s.encounter.threat=true;
 A.throws(()=>observed(s),/directly threatening animal/);
 s.encounter.threat=false;
 s.beasts[id].habitatExposure.fen=0;
 A.throws(()=>observed(s),/living, actually encountered local wild beast/);
 s.beasts[id].habitatExposure.fen=1;
 s.beasts[id].away=true;
 A.throws(()=>observed(s),/living, actually encountered local wild beast/);
 s.beasts[id].away=false;
 const old=E.exportGame(s),minute=s.world.minutes,skill=s.player.skills.beastcraft.rank;
 const result=observed(s);
 A.equal(result.observed,true);A.equal(result.identified,true);
 A.equal(result.beastId,id);A.equal(result.species,s.beasts[id].species);
 A.equal(result.name,E.SPECIES[s.beasts[id].species].name);
 A.equal(result.elapsedMinutes,5);A.equal(s.world.minutes,minute+5);
 A.equal(s.encounter.observed,true);A.equal(s.sightings.length,1);
 A.equal(s.sightings[0].beastId,id);A.equal(s.player.skills.beastcraft.rank,skill);
 A.equal(s.table.wildlifeObservationEvidence[id].identified,true);
 A.equal(s.table.wildlifeObservationEvidence[id].source.includes('Engine-witnessed'),true);
 A.equal(s.table.wildlifeObservationEvidence[id].rollEventHash.length,64);
 A.ok(s.log[s.table.wildlifeObservationEvidence[id].rollEventIndex].type==='roll');
 A.deepEqual(status(s).knownSightings.map(x=>x.beastId),[id]);
 A.equal(result.unmeasuredTraitsRemainHidden,true);
 const after=E.exportGame(s),rolled=s.rngState;
 A.throws(()=>observed(s),/already been inspected/);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,rolled);
 A.notEqual(old,after);
}
{
 const s=encounter(47014);
 const id=s.encounter.beastId;
 s.player.attributes.wis=1;s.player.skills.beastcraft.rank=0;
 // This disposable low-RNG test exercises a real failed check, including
 // the original natural-1 penalty, without selecting a campaign outcome.
 s.rngState=1;
 const originalSpecies=s.beasts[id].species;
 const result=observed(s);
 A.equal(result.identified,false);
 A.equal(result.species,undefined);
 A.equal(result.name,undefined);
 A.equal(s.sightings.length,0);
 A.equal(s.table.wildlifeObservationEvidence[id].identified,false);
 A.equal(status(s).knownSightings.length,0);
 A.equal(s.beasts[id].species,originalSpecies);
 A.throws(()=>observed(s),/already been inspected/);
}
{
 const s=encounter(47016),id=s.encounter.beastId;
 s.beasts[id].sapience=3;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>observed(s),/Sapient individuals/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 delete s.beasts[id].sapience;
 // An old unsourced prototype entry must not become a confirmed census
 // observation simply because a later real individual was seen.
 s.sightings.push({beastId:'imaginary_1',species:'fenfox',location:'fen',day:1});
 s.quests.local_census={status:'active',metric:'sightings',target:3,progress:0};
 A.deepEqual(status(s),{knownSightings:[]});
 const result=observed(s);
 A.equal(result.identified,true);
 A.equal(s.sightings.length,2);
 A.equal(status(s).knownSightings.length,1);
 A.equal(s.quests.local_census.progress,1);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-wildlife-observation-'));
 try{
  const file=Path.join(dir,'save.json'),s=encounter(47015);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const forged={id:'imaginary_species_00001',mode:'rule',system:'world',
   operation:'observe',params:{species:'dreamreed',minutes:1,source:'Caller says dragon'}};
  A.throws(()=>Turn.execute(file,forged),/accepts no chosen species/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  // Natural-language field inspection is now the SAME guarded operation.
  const request={id:'actual_wildlife_watch_0001',mode:'act',action:'observe'};
  const done=Turn.execute(file,request);
  A.equal(done.applied,true);A.equal(done.output.wildlife.identified,true);
  A.equal(done.output.wildlife.unmeasuredTraitsRemainHidden,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const data=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(data.sightings.length,1);
  A.equal(data.encounter.observed,true);
  const saved=FS.readFileSync(file,'utf8');
  const knowledge=Turn.execute(file,{id:'actual_wildlife_known_0001',
   mode:'rule',system:'world',operation:'sightingStatus',params:{}});
  A.equal(knowledge.applied,false);
  A.equal(knowledge.output.rules.knownSightings.length,1);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  A.throws(()=>Turn.execute(file,{...request,id:'watch_reroll_0001'}),
   /already been inspected/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{force:true,recursive:true});}
}
console.log('Verified present-beast observation never invents taxon identities or rerolls');
