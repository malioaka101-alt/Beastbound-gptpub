'use strict';
// Real multi-turn ordinary-life acceptance journeys using existing mechanics.
// This is a TEST, not a new NPC, relationship, dialogue or social system.
// Every file is disposable; no live campaign or GitHub request is touched.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),W=require('../rules/world'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Turn=require('../scripts/chat-turn.js');
const proposal='Help preserve the local walking routes and nearby habitat while each of us remains free to stop working';
const question='What work concerns you in this region?';
const cultureQuestion='What customs and traditions are known around your home?';
const fresh=seed=>E.newGame({seed,name:'Independent Ordinary-Life Journey',background:'fieldworker'});
function predicts(p,w){
 const sample={rngState:p.rngState};
 const first=People._debug.draw(sample);
 const second=People._debug.draw(sample);
 const strained=p.fatigue>66||w.countries[p.polity].stability<27;
 const talks=first<(strained?.38:.74);
 const chance=p.personality==='independent'?.51:
  p.personality==='reserved'?.58:.74;
 return {talks,accepts:p.fatigue<=75&&second<chance};
}
function distance(from,to){
 const pending=[[from]],seen=new Set([from]);
 while(pending.length){
  const path=pending.shift(),node=path.at(-1);
  if(node===to)return path;
  for(const next of E.LOCATIONS[node].exits)
   if(!seen.has(next)){seen.add(next);pending.push([...path,next]);}
 }
 return null;
}
function fixture(shouldAccept){
 for(let seed=927110;seed<927125;seed++){
  const s=fresh(seed),w=Realm.ensure(s);
  W.advance(s,240);
  const day=Math.floor(s.world.minutes/1440);
  for(const p of Object.values(w.emergentPeople.people)){
   const path=p.shift?.location&&distance(s.world.location,p.shift.location);
   if(!path||path.length>4||p.status!=='active'||p.fatigue>75||
      !People.presence(w,p.actorId,p.shift.location,day))continue;
   const guess=predicts(p,w);
   if(guess.talks&&guess.accepts===shouldAccept)
    return {s,actorId:p.actorId,personId:p.id,path,seed};
  }
 }
 throw Error('No source-authentic independently '+(shouldAccept?'willing':'declining')+' fixture');
}
function journey(shouldAccept){
 const initial=fixture(shouldAccept);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-lived-npc-journey-'));
 const file=Path.join(dir,'save.json'),read=()=>FS.readFileSync(file,'utf8'),
  state=()=>E.importGame(read()),actorId=initial.actorId;
 const save=()=>FS.writeFileSync(file,E.exportGame(initial.s)+'\n');
 let seq=0;
 function turn(body){
  const request={id:'npc_journey_'+(shouldAccept?'yes':'no')+'_'+
   String(++seq).padStart(4,'0'),...body,expectedHash:Turn.hash(read())};
  return {request,result:Turn.execute(file,request)};
 }
 function social(operation,params={}){
  return turn({mode:'rule',system:'social',operation,params});
 }
 function memory(){
  const before=read(),rng=state().rngState;
  const r=social('personContext',{npcId:actorId}).result;
  A.equal(r.ok,true);A.equal(r.applied,false);
  A.equal(read(),before);A.equal(state().rngState,rng);
  A.ok(!JSON.stringify(r.output.rules).includes('rngState'));
  A.ok(!JSON.stringify(r.output.rules).includes('birthSource'));
  A.ok(!JSON.stringify(r.output.rules).includes('personality'));
  A.ok(!JSON.stringify(r.output.rules).includes('funds'));
  return r.output.rules;
 }
 try{
  save();
  const baseline=read(),initialRng=state().rngState;
  A.equal(turn({mode:'status'}).result.applied,false);
  A.equal(read(),baseline);
  A.equal(state().rngState,initialRng);
  for(const next of initial.path.slice(1)){
   const travel=turn({mode:'act',action:'travel '+next}).result;
   A.equal(travel.ok,true);A.equal(travel.applied,true);
  }
  A.equal(state().world.location,initial.path.at(-1));
  const encounter=memory();
  A.equal(encounter.known,true);
  A.equal(encounter.presentHere,true);
  A.equal(encounter.conversations.length,0);
  // Without the actual independent person, an invented acceptance cannot
  // be entered as a result by the player or the GM.
  const preTalk=read(),preTalkRng=state().rngState;
  A.throws(()=>social('speakLocalPerson',{
   npcId:actorId,question,answer:'I will work for free',agreed:true
  }),/real local person and a player-authored question/);
  A.equal(read(),preTalk);A.equal(state().rngState,preTalkRng);
  const first=social('speakLocalPerson',{npcId:actorId,question});
  A.equal(first.result.applied,true);
  A.equal(first.result.output.rules.spoke,true);
  A.equal(first.result.output.rules.answerKind,'individual-work');
  A.equal(first.result.output.rules.noContract,true);
  const home=social('speakLocalPerson',{npcId:actorId,question:cultureQuestion});
  A.equal(home.result.applied,true);
  A.equal(home.result.output.rules.answerKind,'home-culture');
  A.ok(home.result.output.rules.heard.includes('not a rule for how every person'));
  const repeatedBefore=read(),repeatedRng=state().rngState;
  const repeat=social('speakLocalPerson',{npcId:actorId,question});
  A.equal(repeat.result.applied,false);
  A.equal(repeat.result.output.rules.alreadyAsked,true);
  A.equal(read(),repeatedBefore);
  A.equal(state().rngState,repeatedRng);
  const dialogue=memory();
  A.equal(dialogue.conversations.length,2);
  A.equal(dialogue.conversations[0].heard,first.result.output.rules.heard);
  A.equal(dialogue.conversations[1].heard,home.result.output.rules.heard);
  A.equal(dialogue.workOffers.length,0);
  // The proposal is a genuine independently decided opportunity, not a
  // narrative declaration of consent, wages or friendship.
  const beforeChoice=read(),choiceRng=state().rngState,
   coins=state().player.coins;
  A.throws(()=>social('proposeLocalWork',{
   npcId:actorId,purpose:proposal,accepted:true,pay:500
  }),/not a chosen response or wage/);
  A.equal(read(),beforeChoice);
  const offer=social('proposeLocalWork',{npcId:actorId,purpose:proposal});
  A.equal(offer.result.applied,true);
  A.equal(offer.result.output.rules.offered,true);
  A.equal(offer.result.output.rules.accepted,shouldAccept);
  A.equal(offer.result.output.rules.noWagesAgreed,true);
  A.equal(state().player.coins,coins);
  A.equal(state().rngState,choiceRng);
  const offerId=offer.result.output.rules.offerId;
  const offerMemory=memory();
  A.equal(offerMemory.workOffers.length,1);
  A.equal(offerMemory.workOffers[0].accepted,shouldAccept);
  const unchanged=read(),npcRng=state().table.realm.emergentPeople.people[initial.personId].rngState;
  A.throws(()=>social('proposeLocalWork',{npcId:actorId,purpose:proposal}),
    /accepted unfinished|same unchanged proposal/);
  A.equal(read(),unchanged);
  A.equal(state().table.realm.emergentPeople.people[initial.personId].rngState,npcRng);
  if(shouldAccept){
   const staminaBefore=state().player.stamina;
   const worked=social('assistLocalPersonWork',{npcId:actorId,offerId});
   A.equal(worked.result.applied,true);
   A.equal(worked.result.output.rules.agreed,true);
   A.equal(worked.result.output.rules.agreementHonoured,true);
   A.equal(worked.result.output.rules.minutes,40);
   A.equal(state().player.stamina,staminaBefore-4);
   A.equal(state().player.coins,coins);
   A.ok(worked.result.output.rules.check.roll>=1);
   A.ok(worked.result.output.rules.check.roll<=20);
   A.equal(state().table.localWorkProposals.records[offerId].state,'completed');
   const afterWork=read(),afterRng=state().rngState;
   const duplicate=Turn.execute(file,worked.request);
   A.equal(duplicate.duplicate,true);A.equal(duplicate.recovered,true);
   A.equal(duplicate.output.rules.check.roll,worked.result.output.rules.check.roll);
   A.equal(read(),afterWork);A.equal(state().rngState,afterRng);
  }else{
   // Someone who declined cannot be converted into an accepted worker by
   // naming the rejected offer as if consent had been obtained.
   const before=read(),rng=state().rngState;
   A.throws(()=>social('assistLocalPersonWork',{npcId:actorId,offerId}),
    /still-accepted/);
   A.equal(read(),before);A.equal(state().rngState,rng);
   A.equal(memory().workOffers[0].state,'declined');
  }
  // Record the actual outcome as a checkpoint, then *reload from disk*.
  const known=memory();
  const finalState=shouldAccept?'completed':'declined';
  A.equal(known.workOffers[0].state,finalState);
  A.equal(known.assistedWork.length,shouldAccept?1:0);
  const scene='At '+E.LOCATIONS[state().world.location].name+
   ', after a real conversation and a '+finalState+' voluntary work proposal.';
  const checkpoint=turn({mode:'checkpoint',scene,
   summary:'The recorded proposal '+offerId+' was '+finalState+
    '; no wages, friendship or future consent were inferred.'});
  A.equal(checkpoint.result.applied,true);
  const saved=read(),checkpointRng=state().rngState,
   revision=state().chatRuntime.revision;
  const resumed=E.importGame(saved);
  A.equal(resumed.chatRuntime.scene,scene);
  A.equal(resumed.chatRuntime.revision,revision);
  A.equal(resumed.table.localWorkProposals.records[offerId].state,finalState);
  A.equal(resumed.rngState,checkpointRng);
  A.equal(turn({mode:'status'}).result.applied,false);
  A.equal(read(),saved);
  const reloaded=memory();
  A.equal(reloaded.conversations.length,2);
  A.equal(reloaded.workOffers[0].state,finalState);
  A.equal(reloaded.assistedWork.length,shouldAccept?1:0);
  A.equal(read(),saved);
  const stale=Turn.execute(file,{id:'npc_stale_'+(shouldAccept?'yes':'no'),
   mode:'rule',system:'social',operation:'assistLocalPersonWork',
   params:{npcId:actorId,offerId},expectedHash:'stale-previous-scene'});
  A.equal(stale.ok,false);A.equal(stale.applied,false);
  A.match(stale.error,/Stale checkpoint/);
  A.equal(read(),saved);A.equal(state().rngState,checkpointRng);
  A.equal(state().player.coins,coins);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
 return {seed:initial.seed,accepted:shouldAccept};
}
const agreed=journey(true),declined=journey(false);
A.equal(agreed.accepted,true);A.equal(declined.accepted,false);
console.log('Ordinary-life journeys passed: culturally situated conversation, voluntary cooperation and refusal, original work roll, witnessed memory, checkpoint, duplicate and stale protection on disposable saves');
