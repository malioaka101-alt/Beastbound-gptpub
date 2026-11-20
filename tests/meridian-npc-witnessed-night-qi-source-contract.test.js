'use strict';
// Isolated SOURCE CONTRACT, not a simulated witnessed campaign night or
// synthetic rank grant. The original eight-hour independently accepted
// shelter + Combat receipts are separately tested by the living-world tests.
// This contract proves the shared ORIGINAL player +10 Qi rule is replayed,
// bounded, stage-local and cannot be invented by a re-sealed claim.
const A=require('node:assert/strict'),FS=require('node:fs'),
 VM=require('node:vm'),Path=require('node:path'),
 Crypto=require('node:crypto');
const HASH=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const mod={exports:{}},src=FS.readFileSync(Path.resolve(__dirname,
 '../world/independent-meridian-night-qi.js'),'utf8');
const sources={
 './independent-original-power-days':{verifyNights:(_,p)=>p.originalNightsVerified===true},
 './independent-meridian-sea':{verify:()=>true},
 './independent-meridian-web':{verify:()=>true},
 './independent-meridian-advanced':{verify:()=>true}
};
VM.runInNewContext(src,{module:mod,structuredClone,console,
 require:id=>id==='node:crypto'?Crypto:
  Object.hasOwn(sources,id)?sources[id]:
   (()=>{throw Error('Unexpected original Meridian rest source '+id)})()});
const Night=mod.exports;
A.equal(Night.RECOVER,10,'Use existing real player eight-hour night Qi recovery');
const p={id:'person_1',actorId:'emergent:person_1',
 originHash:'a'.repeat(64),originalNightsVerified:true,
 originalMeridianSea:{stage:4,energy:{maxQi:90,currentQi:13,
  flow:10,recovery:17,originalCapacityOwner:'rules/build.js:meridianProfile'}}};
const s={world:{minutes:5*1440},table:{combatants:{
 'npc_person_1':{npcOrigin:{seal:'e'.repeat(64)}}}}};
const originalEnergy=structuredClone(p.originalMeridianSea.energy);
const shelter={actorId:p.actorId,completedDay:4,endMinute:4*1440,
 noAdditionalPlayerTimeOrFreePower:true};
const firstNight={source:shelter,seal:HASH(shelter)};
p.originalOffscreenCombatNights=[firstNight];
A.equal(Night.afterNight(s,{...p,originalMeridianSea:undefined},firstNight),null,
 'A person with no evidenced relevant Qi reservoir receives no arbitrary power');
A.throws(()=>Night.afterNight(s,p,{source:shelter,seal:'forged'}),
 /verified personal completed night/);
const recovered=Night.afterNight(s,p,firstNight);
A.equal(recovered.restoredQi,10);
A.equal(p.originalMeridianSea.energy.currentQi,23);
A.equal(p.originalMeridianSea.energy.maxQi,90);
A.equal(p.originalMeridianSea.rests.length,1);
const before=Night.replayUntil(s,p,p.originalMeridianSea.rests,0,
 firstNight.source.endMinute,originalEnergy,0);
A.equal(before.index,0);
A.equal(before.energy.currentQi,13,
 'A future rest may not pay for an earlier cultivation session');
const replay=Night.replayUntil(s,p,p.originalMeridianSea.rests,0,
 Number.POSITIVE_INFINITY,originalEnergy,0);
A.equal(replay.index,1);
A.equal(replay.energy.currentQi,23);
A.throws(()=>Night.afterNight(s,p,firstNight),
 /Duplicate or unreconciled/);
const clone=structuredClone(p.originalMeridianSea.rests);
clone[0].source.restoredQi=60;clone[0].seal=HASH(clone[0].source);
A.equal(Night.replayUntil(s,p,clone,0,Infinity,originalEnergy,0),null,
 'Re-sealed counterfeit increased Qi is rejected by original math');
clone[0].source.restoredQi=10;
clone[0].source.originalNightSeal='x'.repeat(64);
clone[0].seal=HASH(clone[0].source);
A.equal(Night.replayUntil(s,p,clone,0,Infinity,originalEnergy,0),null,
 'An invented personal night cannot be used as energy recovery');
const consumed={...originalEnergy,currentQi:87};
const secondSource={...shelter,completedDay:5,endMinute:5*1440};
const second={source:secondSource,seal:HASH(secondSource)};
p.originalOffscreenCombatNights.push(second);
const capped=Night.replayUntil(s,p,[{source:{
 origin:Night.ORIGIN,actorId:p.actorId,individualOriginHash:p.originHash,
 originalCombatEntrySeal:'e'.repeat(64),originalNightSeal:second.seal,
 completedDay:5,completedMinute:5*1440,restoredQi:3,
 energyBefore:consumed,energyAfter:{...consumed,currentQi:90},
 originalRecoveryOwner:'rules/unified.js:sleep',
 noSecondWorldTickOrUnlearnedPower:true},seal:null}],0,
 Infinity,consumed,0);
A.equal(capped,null,'Even a valid-looking receipt requires a real matching seal');
const sealed={origin:Night.ORIGIN,actorId:p.actorId,
 individualOriginHash:p.originHash,originalCombatEntrySeal:'e'.repeat(64),
 originalNightSeal:second.seal,completedDay:5,
 completedMinute:5*1440,restoredQi:3,
 energyBefore:consumed,energyAfter:{...consumed,currentQi:90},
 originalRecoveryOwner:'rules/unified.js:sleep',
 noSecondWorldTickOrUnlearnedPower:true};
const ok=Night.replayUntil(s,p,[{source:sealed,seal:HASH(sealed)}],
 0,Infinity,consumed,0);
A.equal(ok.energy.currentQi,90,
 'Genuine personally evidenced recovery is capped at the actual maximum');
console.log('Isolated original Meridian night Qi source PASS: original +10 only after actual original sleep receipt, no world tick, exact before/after replay, cap, idempotence, anti-forgery; this fixture does NOT prove full Stage I-IX NPC advancement');
