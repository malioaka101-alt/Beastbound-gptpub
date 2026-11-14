'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),Turn=require('../scripts/chat-turn'),
 Rules=require('../rules'),Continuity=require('../scripts/scene-continuity');
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-scene-continuity-'));
const file=Path.join(tmp,'save.json');
const read=()=>FS.readFileSync(file,'utf8');
const state=()=>E.importGame(read());
const location={kind:'place',id:'crossing'};
const key='crossing_bridge_proverb';
function note(action,statement,witness,priorSeal){
 return {id:key,action,subject:location,category:'local oral history',
  statement,witness,visibility:'player-known',
  ...(priorSeal?{priorSeal}:{})};
}
try{
 const s=E.newGame({name:'Narrative Integrity Test',seed:170221});
 FS.writeFileSync(file,E.exportGame(s)+'\n');
 const original=state(),startRng=original.rngState,startMinute=original.world.minutes;
 const scene='At the crossing, a traveller recites the bridge proverb quietly.';
 const witness='a traveller recites the bridge proverb quietly';
 const request={id:'scene_memory_first_170221',mode:'checkpoint',scene,
  summary:'The traveller gave the bridge proverb but asked nothing in return.',
  continuity:[note('record','The player heard a local saying about the bridge.',witness)]};
 A.throws(()=>Continuity.preflight({...request,continuity:[
  {...request.continuity[0],outcome:'Magic power gained for free'}]}),
  /Narrative fact needs stable ID|Narrative continuity/);
 // Invalid unsourced witnesses must never enter the save.
 A.throws(()=>Continuity.preflight({...request,continuity:[
  {...request.continuity[0],witness:'A statement not heard or witnessed anywhere'}]}),
  /Narrative fact needs stable ID/);
 const one=Turn.execute(file,request);
 A.equal(one.ok,true);A.equal(one.applied,true);
 A.equal(one.output.continuity.recorded,1);
 A.equal(one.output.continuity.storyOnly,true);
 A.equal(one.output.continuity.noMechanicalAgreementOrAbilityGranted,true);
 A.equal(state().world.minutes,startMinute);
 A.equal(state().rngState,startRng);
 const oldHead=one.output.continuity.entries[0].head;
 A.equal(oldHead.length,64);
 A.equal(Turn.execute(file,request).duplicate,true);
 A.equal(state().chatRuntime.continuity.facts[key].history.length,1);
 const readOnly={id:'scene_memory_lookup_170221',mode:'rule',system:'world',
  operation:'sceneContinuityStatus',params:{id:key}};
 const beforeLook=read(),found=Turn.execute(file,readOnly);
 A.equal(found.applied,false);
 A.equal(read(),beforeLook);
 A.equal(found.output.rules.facts[0].statement,request.continuity[0].statement);
 A.equal(found.output.rules.facts[0].subject.id,'crossing');
 A.equal(found.output.rules.storyOnly,true);
 const revised='The bridge proverb has a longer, newly attested second line.';
 const reviseWitness='the proverb has an older second line';
 const change={id:'scene_memory_revised_170221',mode:'checkpoint',
  scene:'An archivist explains that the proverb has an older second line.',
  continuity:[note('revise',revised,reviseWitness,oldHead)]};
 const two=Turn.execute(file,change);
 A.equal(two.applied,true);
 const second=two.output.continuity.entries[0].head;
 A.notEqual(second,oldHead);
 const current=state().chatRuntime.continuity.facts[key];
 A.equal(current.history.length,2);
 A.equal(current.history[0].source.statement,request.continuity[0].statement);
 A.equal(current.history[1].source.statement,revised);
 A.equal(current.head,second);
 // Same source and time cannot be silently replaced without the last seal.
 const saved=read();
 A.throws(()=>Turn.execute(file,{...change,id:'scene_memory_wrong_seal_170221'}),
  /exact active identity/);
 A.equal(read(),saved);
 const retire={id:'scene_memory_retire_170221',mode:'checkpoint',
  scene:'The archivist discovers the older account was a mistaken transcription.',
  continuity:[note('retire','The previous proverb account is now retired as a mistaken transcription.',
   'the older account was a mistaken transcription',second)]};
 const three=Turn.execute(file,retire);
 A.equal(three.applied,true);
 const now=state();
 A.equal(now.chatRuntime.continuity.facts[key].status,'retired');
 A.equal(now.chatRuntime.continuity.facts[key].history.length,3);
 A.equal(Continuity.verify(now.chatRuntime.continuity),true);
 // Player-known history survives the ordinary rolling scene journal.
 for(let i=0;i<35;i++){
  const r=Turn.execute(file,{id:'ordinary_scene_followup_'+String(i).padStart(3,'0'),
   mode:'checkpoint',scene:'Ordinary scene '+i+' passes without new verified lore.',
   summary:'Distinct witnessed ordinary scene '+i+' passed without invented power or consent.'});
  A.equal(r.applied,true);
 }
 const grown=state();
 A.equal(grown.chatRuntime.journal.length,30);
 A.equal(grown.chatRuntime.continuity.facts[key].history.length,3);
 A.equal(grown.chatRuntime.continuity.facts[key].status,'retired');
 const afterStatus=Turn.execute(file,{...readOnly,id:'scene_memory_lookup_later_170221'});
 A.equal(afterStatus.output.rules.facts[0].history.length,3);
 A.equal(afterStatus.output.rules.facts[0].status,'retired');
 // GM-only facts survive alongside player-known ones but are never returned
 // by player-facing inspection, even when the caller supplies their ID.
 const privateFact={id:'unpublished_story_context',action:'record',
  subject:{kind:'world',id:'world'},category:'private GM note',
  statement:'An unannounced archival interpretation remains uncertain.',
  witness:'The GM has an unpublished interpretation',visibility:'gm-only'};
 const privateReq={id:'scene_memory_private_170221',mode:'checkpoint',
  summary:'The scene ended without an announcement.',
  scene:'The scene ends before the public announcement.',
  gmWitness:'The GM has an unpublished interpretation that has not been shared.',
  continuity:[privateFact]};
 const privateResult=Turn.execute(file,privateReq);
 A.equal(privateResult.applied,true);
 A.equal(privateResult.output.continuity.entries[0].private,true);
 A.equal(privateResult.output.continuity.entries[0].id,undefined);
 A.ok(!state().chatRuntime.journal.some(x=>x.text.includes(privateFact.witness)),
  'GM-only witness must never be copied to player-facing journal');
 const privacy=Turn.execute(file,{id:'scene_memory_private_read_170221',mode:'rule',
  system:'world',operation:'sceneContinuityStatus',
  params:{id:privateFact.id}});
 A.deepEqual(privacy.output.rules.facts,[]);
 const invalidPrivate=read();
 A.throws(()=>Turn.execute(file,{...privateReq,id:'private_missing_witness_170221',
  gmWitness:undefined}),/Narrative fact needs stable ID/);
 A.equal(read(),invalidPrivate);
 // An unregistered narrative subject is expressly NOT a real actor.
 const unregistered={id:'named_person_not_registered',action:'record',
  subject:{kind:'narrative',id:'travelling_teacher_note'},
  category:'character colour',
  statement:'The described traveller keeps a distinctive green scarf.',
  witness:'a traveller wearing a distinctive green scarf',visibility:'player-known'};
 A.equal(Turn.execute(file,{id:'scene_memory_narrative_170221',mode:'checkpoint',
  scene:'The party notices a traveller wearing a distinctive green scarf.',
  continuity:[unregistered]}).applied,true);
 A.equal(state().table?.realm?.emergentPeople?.people?.travelling_teacher_note,undefined);
 // A genuinely existing person identity may be the anchor, but arbitrary
 // nonexistent people or beasts may not be manufactured by writing a note.
 const bad=read();
 A.throws(()=>Turn.execute(file,{id:'scene_memory_fake_actor_170221',
  mode:'checkpoint',scene:'An imaginary beast is mentioned at the crossing.',
  continuity:[{id:'nonexistent_beast_note',action:'record',
   subject:{kind:'beast',id:'beast_999991'},category:'description',
   statement:'A physically present impossible beast was claimed.',
   witness:'An imaginary beast is mentioned',visibility:'player-known'}]}),
 /cannot register an unverified/);
 A.equal(read(),bad);
 const tampered=state();
 tampered.chatRuntime.continuity.facts[key].history[0].source.statement='A retroactive invented past';
 A.throws(()=>Continuity.verify(tampered.chatRuntime.continuity),
  /rewritten or detached/);
 A.equal(state().world.minutes,startMinute);
 A.equal(state().rngState,startRng);
 console.log('Narrative continuity: witnessed source, stable subjects, append-only revisions, privacy, 35-scene retention, no dice/time/actor fabrication, original saved replay');
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
