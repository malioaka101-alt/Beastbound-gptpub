'use strict';
// Full first-stage rite -> actual field action tests; disposable saves only.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),U=require('../rules/unified'),
 Sens=require('../rules/first-stage-senses'),Turn=require('../scripts/chat-turn.js');
const rule=(s,system,operation,params={})=>R.act(s,{system,operation,params});
const fresh=seed=>E.newGame({seed,name:'Earned Independent Field Senses',path:'undecided'});
function train(s,system){
 const map={soul:{attr:'wis',skill:'cultivation',methods:['self-awareness','resonance']},
  rift:{attr:'int',skill:'arcana',methods:['boundaries','orientation']}};
 const cfg=map[system];
 s.player.attributes[cfg.attr]=30;s.player.skills[cfg.skill].rank=5;
 let attempts=0;
 while(true){
  const progress=rule(s,'discipline','status').systems[system];
  if(progress.progress>=progress.required)break;
  A.ok(++attempts<140,'The actual training milestone must be reachable');
  const p=rule(s,'discipline','practice',{
   system,method:cfg.methods[attempts%2],route:'independent'});
  A.equal(p.route,'independent');A.equal(p.feeTalons,0);
  A.equal(p.timeDays,6);
 }
 const result=rule(s,'discipline','breakthrough',{system,route:'independent'});
 A.equal(result.check.success,true,'A complete actual high-skill rite should be mechanically successful');
 A.equal(result.outcome,'breakthrough');
 A.equal(s.table.disciplineTraining[system].history.length,1);
 return result;
}
{
 const s=fresh(801001),before=E.exportGame(s),rng=s.rngState;
 for(const [system,operation]of [
  ['soul','perceive'],['rift','sense']]){
  A.throws(()=>rule(s,system,operation,{}),
   /actually earn the first .* discipline breakthrough/);
 }
 A.throws(()=>rule(s,'soul','perceptionStatus',{forcePresence:true}),
  /accept no chosen/);
 A.throws(()=>rule(s,'rift','senseStatus',{secret:'vault'}),
  /accept no chosen/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=fresh(801002);
 train(s,'soul');
 A.equal(s.player.soul.phase,1);
 A.ok(s.player.soul.reserve>=2);
 A.equal(rule(s,'soul','perceptionStatus').earned,true);
 const initial=s.player.soul.reserve,start=s.world.minutes;
 const own=rule(s,'soul','perceive');
 A.equal(own.performed,true);A.equal(own.success,true);
 A.equal(own.ownSoulAwareness,true);
 A.equal(own.nearbyLifeSign,false);
 A.equal(own.noNamesRead,true);A.equal(own.noAutomaticPartnership,true);
 A.equal(s.world.minutes,start+Sens.SOUL_MINUTES);
 A.equal(s.player.soul.reserve,initial-Sens.SOUL_COST);
 A.equal(s.table?.perceptionPractice?.soulAttempts?.length,1);
 A.equal(s.player.soul.phase,1);
 const frozen=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'soul','perceive',{beastId:'legendary_serpent',dc:2}),
  /accept no chosen/);
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,rng);
 // A real complete night's rest may restore a limited earned Soul reserve.
 const slept=rule(s,'health','sleep',{hours:8});
 A.equal(slept.sleptHours,8);
 A.equal(s.player.soul.reserve,Math.min(s.player.soul.maxReserve,
  initial-Sens.SOUL_COST+3));
}
{
 const s=fresh(801003);
 train(s,'soul');
 A.equal(E.dispatch(s,'travel fen').ok,true);
 let witnessed=false;
 for(let i=0;i<25;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  if(s.encounter?.threat!==true&&s.encounter.distanceMetres<=10){witnessed=true;break;}
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.equal(witnessed,true,'a truly nonthreatening independently generated animal can be found');
 const beastId=s.encounter.beastId,originalBeast=s.beasts[beastId];
 A.equal(originalBeast.owner,null);
 A.ok(s.encounter.distanceMetres>=1&&s.encounter.distanceMetres<=10);
 const oldTime=s.world.minutes,oldLog=s.log.length;
 const sense=rule(s,'soul','perceive');
 A.equal(sense.success,true);
 A.equal(sense.nearbyLifeSign,true);
 A.equal(sense.check.dc,14);
 A.equal(s.world.minutes,oldTime+6);
 A.equal(originalBeast.owner,null);
 A.equal(s.encounter.beastId,beastId);
 A.equal(s.table?.bondRecords?.[beastId],undefined);
 A.equal(Sens.focusBonus(s,beastId),1);
 const firstEvidence=s.table.perceptionPractice.soulFocus[beastId];
 A.equal(firstEvidence.beastId,beastId);
 A.equal(firstEvidence.used,false);
 const obs=rule(s,'world','observe');
 A.equal(obs.observed,true);
 A.equal(obs.verifiedSoulFocusBonus,1);
 A.equal(obs.check.modifier,Math.floor((s.player.attributes.wis-10)/2)+
  s.player.skills.beastcraft.rank*2+1);
 A.equal(s.table.wildlifeObservationEvidence[beastId].verifiedSoulFocusBonus,1);
 A.equal(firstEvidence.used,true);
 A.equal(Sens.focusBonus(s,beastId),0);
 A.equal(s.encounter.beastId,beastId);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.player.arcane.circles,0);
 A.ok(s.log.length>=oldLog); // real roll and field observation added
 // A fake field focus never grants a second species identification.
 A.throws(()=>rule(s,'world','observe'),/already been inspected|already examined/);
 const copy=E.importGame(E.exportGame(s));
 A.equal(copy.table.perceptionPractice.soulFocus[beastId].used,true);
}
{
 // Cryptographically inconsistent source claims must not affect wildlife skill checks.
 const s=fresh(801004);train(s,'soul');
 A.equal(E.dispatch(s,'travel fen').ok,true);
 for(let i=0;i<20;i++){
  E.dispatch(s,'explore');if(!s.encounter.threat&&s.encounter.distanceMetres<=10)break;
  E.dispatch(s,'leave');
 }
 A.equal(s.encounter.threat,false);
 rule(s,'soul','perceive');
 const id=s.encounter.beastId,focus=s.table.perceptionPractice.soulFocus[id];
 A.ok(focus);
 const backup=focus.witnessHash;
 focus.witnessHash='f'.repeat(64);
 A.equal(Sens.focusBonus(s,id),0);
 focus.witnessHash=backup;
 const snap=E.exportGame(s);
 A.equal(Sens.focusBonus(s,id),1);
 A.equal(E.exportGame(s),snap);
}
{
 const s=fresh(801005);
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel ruins').ok,true);
 A.equal(s.world.location,'ruins');
 train(s,'rift');
 A.equal(s.player.rift.step,1);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'rift','sense',{forceSafe:true,portal:'open'}),
  /accept no chosen/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const status=rule(s,'rift','senseStatus');
 A.equal(status.earned,true);
 const stamina=s.player.stamina,time=s.world.minutes,
   w=s.table.realm,hidden=JSON.stringify(w.mythic);
 const outcome=rule(s,'rift','sense');
 A.equal(outcome.performed,true);A.equal(outcome.success,true);
 A.equal(outcome.noVaultEntry,true);
 A.equal(outcome.noTeleportation,true);
 A.equal(outcome.noHiddenRouteRevealed,true);
 A.equal(s.world.minutes,time+Sens.RIFT_MINUTES);
 A.equal(s.player.stamina,stamina-Sens.RIFT_STAMINA);
 A.equal(JSON.stringify(w.mythic),hidden);
 A.equal(s.player.rift.step,1);
 const observations=rule(s,'rift','senseStatus').knownReadings;
 A.equal(observations.length,1);
 A.equal(observations[0].observation,outcome.publicObservation);
 A.equal(s.table.perceptionPractice.riftAttempts[0].success,true);
 const view=E.exportGame(s);
 A.deepEqual(rule(s,'rift','senseStatus').knownReadings,observations);
 A.equal(E.exportGame(s),view);
 // An unrelated locale is not an exterior Riftglass boundary.
 A.equal(E.dispatch(s,'travel fen').ok,true);
 const leave=E.exportGame(s),roll=s.rngState;
 A.throws(()=>rule(s,'rift','sense'),/No established immediately measurable Riftglass exterior/);
 A.equal(E.exportGame(s),leave);A.equal(s.rngState,roll);
}
{
 // Private file-backed turn execution is one-roll and replay-safe.
 const s=fresh(801006);train(s,'soul');
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-earned-senses-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const read={id:'sense_status_read_0001',mode:'rule',system:'soul',
   operation:'perceptionStatus',params:{}};
  A.equal(Turn.execute(file,read).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const req={id:'soul_field_live_0001',mode:'rule',system:'soul',
   operation:'perceive',params:{}};
  const result=Turn.execute(file,req);
  A.equal(result.applied,true);
  A.equal(result.output.rules.performed,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const saved=FS.readFileSync(file,'utf8'),
   loaded=E.importGame(saved);
  A.equal(loaded.player.soul.reserve,s.player.soul.reserve-2);
  A.equal(loaded.world.minutes,s.world.minutes+6);
  A.equal(loaded.table.perceptionPractice.soulAttempts.length,1);
  A.throws(()=>Turn.execute(file,{...req,id:'soul_field_fake_0002',
   params:{answer:'another hidden character'}}),/accept no chosen/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

// Phase I also senses a *recently witnessed in-person* living speaker,
// without reading a mind, identifying an anonymous soul or summoning an
// unseen NPC. A locally known name is not itself physical proximity.
{
 const s=fresh(801007);train(s,'soul');
 const visitor=rule(s,'npc','converse',{npcId:'elira'});
 A.equal(visitor.met,true);
 const start=s.world.minutes,available=s.player.soul.reserve,
  original=E.exportGame(s),rng=s.rngState;
 A.equal(rule(s,'soul','perceptionStatus').earned,true);
 A.throws(()=>rule(s,'soul','perceive',{personId:'elira',identifySoul:true}),
  /accept no chosen/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 const sense=rule(s,'soul','perceive');
 A.equal(sense.success,true);
 A.equal(sense.recentConversantSignature,true);
 A.equal(sense.nearbyLifeSign,true);
 A.equal(sense.check.dc,14);
 A.equal(sense.noNamesRead,true);A.equal(sense.noBeastMindRead,true);
 A.equal(sense.noUnseenCreaturesInvented,true);
 A.equal(s.world.minutes,start+6);
 A.equal(s.player.soul.reserve,available-2);
 A.equal(s.table.perceptionPractice.soulAttempts.at(-1).nearbyPersonWitnessHash,
  s.table.npcConversations.records[0].eventHash);
 A.equal(s.player.partnerIds.length,0);
 const frozen=E.exportGame(s);
 A.deepEqual(rule(s,'soul','perceptionStatus').earned,true);
 A.equal(E.exportGame(s),frozen);
}
{
 // A newly asked real question is still a genuinely close conversation;
 // an unknown *answer* cannot falsely erase observed physical proximity
 // nor reveal a person's soul identity, memories or intent.
 const s=fresh(801012);train(s,'soul');
 const talk=rule(s,'npc','converse',{npcId:'elira',
  question:'What private secret was sealed in the council archive?'});
 A.equal(talk.answerKind,'unverified');
 A.equal(talk.spoken,null);
 const record=s.table.npcConversations.records.at(-1);
 A.equal(record.origin,'witnessed-npc-source-grounded-question');
 const outcome=rule(s,'soul','perceive');
 A.equal(outcome.recentConversantSignature,true);
 A.equal(outcome.nearbyLifeSign,true);
 A.equal(outcome.noNamesRead,true);
 A.equal(outcome.noBeastMindRead,true);
 A.equal(s.table.perceptionPractice.soulAttempts.at(-1).nearbyPersonWitnessHash,
  record.eventHash);
}
{
 const s=fresh(801008);train(s,'soul');
 rule(s,'npc','converse',{npcId:'elira'});
 const original=s.world.minutes;
 E.advance(s,11);W.finalizeTime(s,original);
 const result=rule(s,'soul','perceive');
 A.equal(result.recentConversantSignature,false,
  'A conversation is not permanent evidence of 10-metre physical proximity');
 A.equal(result.nearbyLifeSign,false);
 A.equal(result.noNamesRead,true);
 const after=E.exportGame(s),rng=s.rngState;
 A.equal(rule(s,'soul','perceptionStatus').earned,true);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,rng);
}
{
 const s=fresh(801009);train(s,'soul');
 rule(s,'npc','converse',{npcId:'elira'});
 const record=s.table.npcConversations.records[0];
 const authentic=record.eventHash;
 record.eventHash='f'.repeat(64);
 const result=rule(s,'soul','perceive');
 A.equal(result.recentConversantSignature,false);
 A.equal(result.nearbyLifeSign,false);
 record.eventHash=authentic;
 A.equal(s.player.soul.phase,1);
}
{
 // An independently generated person is only sensed after their original
 // actual local work-shift meeting; a remote profile cannot grant a signal.
 const Realm=require('../world/simulation'),
  People=require('../world/emergent-people');
 const s=fresh(801010);train(s,'soul');
 const world=Realm.ensure(s);
 W.advance(s,240);
 const day=Math.floor(s.world.minutes/1440);
 const choices=Object.values(world.emergentPeople?.people||{}).filter(p=>
  p.status==='active'&&p.shift&&
  People.presence(world,p.actorId,p.shift.location,day));
 A.ok(choices.length>0,'The world independently schedules at least one local civilian');
 const p=choices[0],target=p.shift.location;
 if(s.world.location!==target){
  const queue=[[s.world.location]],seen=new Set([s.world.location]);let route=null;
  while(queue.length){
   const path=queue.shift(),at=path.at(-1);
   if(at===target){route=path;break;}
   for(const exit of E.LOCATIONS[at].exits){
    if(!seen.has(exit)){seen.add(exit);queue.push(path.concat(exit));}
   }
  }
  A.ok(route);
  for(const exit of route.slice(1))
   A.equal(E.dispatch(s,'travel '+exit).ok,true);
 }
 const meeting=rule(s,'social','speakLocalPerson',{
  npcId:p.actorId,question:'What everyday work are you carrying out here?'});
 A.equal(meeting.met,true);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'soul','perceive',{readIdentity:p.actorId}),/accept no chosen/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const found=rule(s,'soul','perceive');
 A.equal(found.success,true);
 A.equal(found.recentConversantSignature,true);
 A.equal(found.nearbyLifeSign,true);
 A.equal(found.noNamesRead,true);
 A.equal(found.noAutomaticPartnership,true);
 A.equal(s.table.perceptionPractice.soulAttempts.at(-1).nearbyPersonWitnessHash,
  s.table.emergentConversations.records.at(-1).eventHash);
 const archived=E.importGame(E.exportGame(s));
 A.equal(archived.table.perceptionPractice.soulAttempts.at(-1).nearbyPersonWitnessHash,
  s.table.emergentConversations.records.at(-1).eventHash);
}
{
 // Real text turns perform one check and persist once; no new action token
 // can manufacture a previously encountered friend or target identity.
 const s=fresh(801011);train(s,'soul');
 rule(s,'npc','converse',{npcId:'elira'});
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-soul-human-presence-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const req={id:'soul_genuine_conversant_0001',mode:'act',
   action:'sense nearby life'};
  const first=Turn.execute(file,req);
  A.equal(first.applied,true);
  A.equal(first.output.soul.recentConversantSignature,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const after=FS.readFileSync(file,'utf8'),loaded=E.importGame(after);
  A.notEqual(after,before);
  A.equal(loaded.world.minutes,s.world.minutes+6);
  A.equal(loaded.player.soul.reserve,s.player.soul.reserve-2);
  A.equal(loaded.table.perceptionPractice.soulAttempts.length,
   (s.table.perceptionPractice?.soulAttempts?.length||0)+1);
  A.throws(()=>Turn.execute(file,{id:'soul_forged_conversant_0001',
   mode:'rule',system:'soul',operation:'perceive',params:{
    personId:'unseen_legendary_person',forcedSuccess:true}}),
   /accept no chosen/);
  A.equal(FS.readFileSync(file,'utf8'),after);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

console.log('Earned Soul and Rift first-stage senses spend real time/resources, aid honest wildlife evidence once, and respect sealed world facts and replay safety');
