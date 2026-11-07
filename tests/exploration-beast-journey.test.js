'use strict';
// Connected ordinary exploration, actual wild and sapient lives. NO new
// mechanics: use the real engine, public rules and disposable checkpoint files.
// Never run this against Aerin, Jory or a live campaign.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),E=require('../engine.js'),
 Rules=require('../rules'),Time=require('../rules/world'),
 Turn=require('../scripts/chat-turn.js');
const fresh=seed=>E.newGame({seed,name:'Independent Wild Journey Fixture',
 background:'fieldworker',path:'undecided'});
function chosenSeed(kind){
 // Source-driven deterministic fixture discovery. A person may take
 // *several* real searches to encounter; each unsuitable animal is simply
 // left alone. Do not force the species, attitude, roll or appearance.
 const seeds=kind==='sapient'?[963202]:
  Array.from({length:150},(_,i)=>881201+i);
 for(const seed of seeds){
  const s=fresh(seed);
  if(!E.dispatch(s,'travel forest').ok)continue;
  const limit=kind==='sapient'?150:1;
  for(let n=1;n<=limit;n++){
   if(!E.dispatch(s,'explore').ok)break;
   const enc=s.encounter,b=s.beasts[enc?.beastId],
    sp=b&&E.SPECIES[b.species];
   if(b&&!enc.threat&&
      !/terrified|panicked|hostile|fleeing|agitated/i.test(b.mood)&&
      (sp.intelligence==='sapient')===(kind==='sapient'))
    return {seed,explores:n};
   if(!E.dispatch(s,'leave').ok)break;
  }
 }
 throw Error('No genuinely encountered, nonthreatening '+kind+' fixture');
}
function runJourney(kind){
 const {seed,explores}=chosenSeed(kind),dir=FS.mkdtempSync(
   Path.join(OS.tmpdir(),'bb-exploration-journey-')),
  file=Path.join(dir,'save.json');
 const read=()=>FS.readFileSync(file,'utf8'),
  load=()=>E.importGame(read());
 let count=0;
 const submit=(body)=>{
  const request={id:'explore_'+kind+'_'+String(++count).padStart(4,'0'),
   ...body,expectedHash:Turn.hash(read())};
  return {request,result:Turn.execute(file,request)};
 };
 const action=action=>submit({mode:'act',action});
 const rule=(system,operation,params={})=>submit({
  mode:'rule',system,operation,params});
 const status=()=>{
  const before=read(),rng=load().rngState;
  const result=submit({mode:'status'}).result;
  A.equal(result.ok,true);A.equal(result.applied,false);
  A.equal(read(),before);A.equal(load().rngState,rng);
  return result;
 };
 const unchanged=(f,pattern)=>{
  const before=read(),rng=load().rngState;
  A.throws(f,pattern);
  A.equal(read(),before);A.equal(load().rngState,rng);
 };
 try{
  FS.writeFileSync(file,E.exportGame(fresh(seed))+'\n');
  const starting=read();
  status();A.equal(read(),starting);
  // Only pre-existing linked habitat travel, no teleport or imposed scene.
  const travel=action('travel forest');
  A.equal(travel.result.applied,true);
  A.equal(load().world.location,'forest');
  A.equal(load().world.minutes,480+75);
  A.equal(load().player.stamina,52-4);
  unchanged(()=>rule('world','watchWildBeast'),
   /truly witnessed, present, unowned|Sapient beast persons/);
  // Reproduce every actual exploration and safe departure from the seed
  // witness. No fixture creates an encounter or rewrites a saved outcome.
  for(let n=1;n<=explores;n++){
   const encounter=action('explore');
   A.equal(encounter.result.ok,true);
   A.equal(encounter.result.applied,true);
   if(n<explores){
    const release=action('leave');
    A.equal(release.result.ok,true);
    A.equal(load().encounter,null);
   }
  }
  const first=load(),id=first.encounter?.beastId,animal=first.beasts[id],
   species=animal&&E.SPECIES[animal.species],
   record=first.log.find(x=>x.type==='encounter'&&
    x.details?.beastId===id&&
    x.details?.origin==='engine-local-wildlife-encounter');
  A.ok(record,'The creature must originate in an actual local encounter');
  A.ok(species);
  A.equal(species.intelligence==='sapient',kind==='sapient');
  A.equal(first.encounter.threat,false);
  A.equal(record.details.distanceMetres,first.encounter.distanceMetres);
  A.equal(animal.owner,null);
  A.equal(first.player.partnerIds.length,0);
  // Merely requesting friendship, a choice or knowledge is not authority.
  unchanged(()=>rule('world','watchWildBeast',
   {outcome:'automatically bonded',forced:true}),
   /independently determined/);
  if(kind==='wild'){
   const before=read(),prior=load(),mood=animal.mood;
   const readout=rule('world','wildBehaviourStatus').result;
   A.equal(readout.applied,false);
   A.equal(readout.output.rules.activeEncounter,true);
   A.equal(readout.output.rules.beastId,id);
   A.equal(read(),before);
   const watch=rule('world','watchWildBeast');
   A.equal(watch.result.applied,true);
   A.equal(watch.result.output.rules.watched,true);
   A.equal(watch.result.output.rules.noGuaranteedRelationship,true);
   A.equal(watch.result.output.rules.noExtraPlayerRoll,true);
   A.equal(watch.result.output.rules.minutes,12);
   A.equal(load().rngState,prior.rngState);
   A.equal(load().player.partnerIds.length,0);
   A.equal(load().beasts[id].owner,null);
   A.equal(load().beasts[id].relationship,'wild');
   A.equal(load().beasts[id].mood,mood);
   A.ok(['withdraw','forage','rest','reposition','survey']
    .includes(watch.result.output.rules.observedAction));
   const remembered=rule('world','wildMemoriesStatus').result;
   A.equal(remembered.applied,false);
   const memory=remembered.output.rules.knownIndividuals.find(
    x=>x.beastId===id);
   A.ok(memory);A.equal(memory.lastSeenLocation,'forest');
   A.equal(memory.currentlyPresent,'not established');
   A.ok(!JSON.stringify(remembered.output.rules).includes('currentLocation'));
   A.ok(!JSON.stringify(remembered.output.rules).includes('individualGrade'));
   if(load().encounter){
    unchanged(()=>rule('world','watchWildBeast'),
      /real interval/);
    const leave=action('leave');
    A.equal(leave.result.ok,true);
   }
   A.equal(load().encounter,null);
   // A distant, paid search is not a remote locator, a free return or bond.
   const toFen=action('travel fen');
   A.equal(toFen.result.applied,true);
   A.equal(load().world.location,'fen');
   const beforeTrack=load(),creatureRng=beforeTrack.beasts[id].individualLife.rngState;
   unchanged(()=>rule('world','seekKnownWildBeast',
     {beastId:id,found:true,location:'fen'}),
     /only a previously witnessed individual beastId/);
   const track=rule('world','seekKnownWildBeast',{beastId:id});
   A.equal(track.result.ok,true);A.equal(track.result.applied,true);
   A.equal(track.result.output.rules.searched,true);
   A.equal(track.result.output.rules.found,false);
   A.equal(track.result.output.rules.noGuaranteedReturn,true);
   A.equal(track.result.output.rules.noAutomaticBond,true);
   A.equal(track.result.output.rules.hiddenMovementNotRevealed,true);
   A.equal(track.result.output.rules.minutes,45);
   A.equal(track.result.output.rules.staminaSpent,3);
   A.equal(load().world.minutes,beforeTrack.world.minutes+45);
   A.equal(load().player.stamina,beforeTrack.player.stamina-3);
   A.equal(load().beasts[id].individualLife.rngState,creatureRng);
   A.equal(load().player.partnerIds.length,0);
   A.equal(load().beasts[id].owner,null);
   A.equal(load().encounter,null);
   const rememberedRoll=load().rngState,afterTrack=read();
   const duplicate=Turn.execute(file,watch.request);
   A.equal(duplicate.duplicate,true);
   A.equal(duplicate.recovered,true);
   A.equal(duplicate.output.rules.observedAction,
    watch.result.output.rules.observedAction);
   A.equal(read(),afterTrack);A.equal(load().rngState,rememberedRoll);
  }else{
   unchanged(()=>rule('world','watchWildBeast'),
    /Sapient beast persons require independent dialogue/);
   unchanged(()=>rule('social','meetSapientBeast',
    {forcedConsent:true,assumedLanguage:true}),
    /choose their own actions/);
   const contact=rule('social','meetSapientBeast');
   A.equal(contact.result.ok,true);A.equal(contact.result.applied,true);
   A.equal(contact.result.output.rules.encountered,true);
   A.equal(contact.result.output.rules.noContractOrOwnership,true);
   A.equal(contact.result.output.rules.noAssumedSharedLanguage,true);
   A.equal(contact.result.output.rules.noFreeSkills,true);
   A.equal(load().beasts[id].owner,null);
   A.equal(load().beasts[id].relationship,'wild');
   A.equal(load().player.partnerIds.length,0);
   A.equal(load().player.arcane.circles,0);
   const known=rule('social','sapientBeastMemoriesStatus').result;
   A.equal(known.applied,false);
   A.equal(known.output.rules.personallyWitnessedContacts.length,1);
   A.equal(known.output.rules.personallyWitnessedContacts[0].freelyEngaged,
    contact.result.output.rules.freelyEngaged);
   const publicText=JSON.stringify(known.output.rules);
   for(const field of ['privateCompetence','currentLocation',
     'ecologicalLearning','rngState','privateRanks'])
    A.ok(!publicText.includes(field));
   if(load().encounter){
    unchanged(()=>rule('social','meetSapientBeast'),
     /already responded/);
    A.equal(action('leave').result.ok,true);
   }
   A.equal(load().encounter,null);
   const rememberedRoll=load().rngState,saved=read();
   const replay=Turn.execute(file,contact.request);
   A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
   A.equal(replay.output.rules.freelyEngaged,
    contact.result.output.rules.freelyEngaged);
   A.equal(read(),saved);A.equal(load().rngState,rememberedRoll);
  }
  // Preserve witnessed facts, not a narrator-imposed emotional bond.
  const finalState=load(),min=finalState.world.minutes,
   site=finalState.world.location,originalRng=finalState.rngState;
  const scene='The encounter with an independently living '+kind+
   ' beast has ended near '+E.LOCATIONS[site].name+
   '. Only personally observed behaviour is established.';
  const checkpoint=submit({mode:'checkpoint',scene,
   summary:'A witnessed '+kind+' beast remained free. Prior rolls and observations are stored, with no unearned bond, loot, or revealed private wildlife location.'});
  A.equal(checkpoint.result.ok,true);
  A.equal(checkpoint.result.applied,true);
  const persisted=read(),loaded=E.importGame(persisted);
  A.equal(loaded.chatRuntime.scene,scene);
  A.equal(loaded.world.location,site);
  A.equal(loaded.world.minutes,min);
  A.equal(loaded.rngState,originalRng);
  A.equal(loaded.beasts[id].owner,null);
  A.equal(loaded.player.partnerIds.length,0);
  status();A.equal(read(),persisted);
  // A fresh read-only query after the checkpoint proves continuity.
  const memory=kind==='wild'?
   rule('world','wildMemoriesStatus').result.output.rules:
   rule('social','sapientBeastMemoriesStatus').result.output.rules;
  A.ok(kind==='wild'?
   memory.knownIndividuals.some(x=>x.beastId===id):
   memory.personallyWitnessedContacts.length===1);
  A.equal(read(),persisted);
  const rejected=Turn.execute(file,{id:'explore_'+kind+'_stale',
   mode:'act',action:'travel crossing',expectedHash:'older-checkpoint'});
  A.equal(rejected.applied,false);A.equal(rejected.ok,false);
  A.match(rejected.error,/Stale checkpoint/);
  A.equal(read(),persisted);A.equal(load().rngState,originalRng);
  // The same historical checkpoint can reproduce ecological off-screen
  // developments without exposing them to a magically omniscient GM HUD.
  const a=E.importGame(persisted),b=E.importGame(persisted);
  Time.advance(a,30);Time.advance(b,30);
  A.deepEqual(a.beasts[id],b.beasts[id]);
  A.equal(a.rngState,b.rngState);
  A.equal(a.beasts[id].owner,null);
  A.equal(a.player.partnerIds.length,0);
  const after=kind==='wild'?
   Rules.act(a,{system:'world',operation:'wildMemoriesStatus',params:{}}):
   Rules.act(a,{system:'social',operation:'sapientBeastMemoriesStatus',params:{}});
  A.equal(kind==='wild'?
   after.knownIndividuals.some(x=>x.beastId===id):
   after.personallyWitnessedContacts.length===1,true);
  A.ok(!JSON.stringify(after).includes('currentLocation'));
  A.equal(read(),persisted,'Offscreen simulation of a copy must not modify the checkpoint');
  return {seed,id,kind};
 }finally{
  FS.rmSync(dir,{recursive:true,force:true});
 }
}
const wild=runJourney('wild'),person=runJourney('sapient');
A.equal(wild.kind,'wild');A.equal(person.kind,'sapient');
console.log('Exploration and beast journeys passed: genuine linked travel, independent animal behaviour, respectful sapient contact, distant search, saved original outcomes, checkpoint, stale/duplicate safety and offscreen ecology');
