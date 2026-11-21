'use strict';
// ISOLATED PHYSICAL-COMBAT PROJECTION CONTRACT ONLY. These player/NPC stage
// proofs are injected into a VM; they DO NOT prove Stage I–IX was earned in
// production. Production synchronize() calls original private source replay
// and REFUSES fabricated rank/actor inputs before changing Combat anatomy.
const A=require('node:assert/strict'),FS=require('node:fs'),
 Path=require('node:path'),VM=require('node:vm'),Crypto=require('node:crypto'),
 B=require('../rules/build'),G=require('../rules/meridian-shared-original-gates');
const original=FS.readFileSync(
 Path.resolve(__dirname,'../rules/meridian-npc-physical.js'),'utf8'),
 fake={stage:1,get originalMeridianStageEarned(){return this.stage;},
  originalStageThreeIndividualGates:null,
  originalStageFiveWebRoutes:null},
 moduleStub={exports:{}},ownerProof={valid:true};
VM.runInNewContext(original,{module:moduleStub,structuredClone,require:id=>
 id==='node:crypto'?Crypto:
 id==='./build'?B:
 id==='./meridian-shared-original-gates'?G:
 id==='./disciplines'?{npcMeridianPrivateStatus:()=>{
  if(!ownerProof.valid)
   throw Error('Original individual Meridian stage source failed full owner replay');
  return fake;
 }}:
 id==='./independent-original-discipline-preparation'?{verify:()=>true}:
 (()=>{throw Error('Unexpected original physical law dependency '+id)})()});
const Phys=moduleStub.exports;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const p={id:'person_1',actorId:'emergent:person_1',
 mechanicalFoundation:{seal:'f'.repeat(64),
 baselineAttributes:{str:12,dex:12,con:16,wis:18,int:12,cha:12}},
 meridianTraining:{earnedStage:1,sessions:[{
  source:{earnedStageAfter:1,outcome:'breakthrough'},
  seal:'a'.repeat(64)}]}};
const x=k=>Math.floor((p.mechanicalFoundation.baselineAttributes[k]-10)/2),
 base=B.humanStats({vigor:x('con'),agility:x('dex'),
 wits:x('wis'),will:x('wis'),might:x('str')},{
  skills:{Melee:0},size:'Medium'});
const human={npcOrigin:{actorId:p.actorId,
 foundationSeal:p.mechanicalFoundation.seal,
 seal:'b'.repeat(64),originalUnarmouredHumanBaseline:true},
 toughness:base.toughness,boxes:[...base.boxes],
 maxStamina:base.stamina+2,stamina:base.stamina+1,
 wpr:0,wounds:[1,0,0],status:'ok'};
const s={table:{combatants:{npc_person_1:human}}};
const before=structuredClone(human);
const stage1=Phys.synchronize(s,p);
A.equal(stage1.applied,false,'Earned Stage I original +2 already applied by original rite');
A.equal(human.stamina,before.stamina,'No passive rest or extra ability');
p.originalMeridianLadder={originalStageTwoSourceHash:'c'.repeat(64)};
fake.stage=2;
const stage2=Phys.synchronize(s,p);
A.equal(stage2.applied,true);
A.equal(human.maxStamina,base.stamina+3);
A.equal(human.stamina,before.stamina+1);
A.deepEqual(human.wounds,[1,0,0]);
const gateData=Array.from({length:108},(_,i)=>{
 const spec=G.gateSpec(i+1);
 return {number:i+1,band:spec.band,quality:'Sound',
  sourceHash:String(i+1).padStart(64,'0')};
});
p.originalMeridianGates={gates:gateData};
fake.stage=3;fake.originalStageThreeIndividualGates=gateData.slice(0,36);
const stage3=Phys.synchronize(s,p);
A.equal(stage3.applied,true);
A.equal(human.maxStamina,base.stamina+5);
A.equal(human.toughness,base.toughness+1);
A.deepEqual(human.wounds,[1,0,0]);
p.originalMeridianSea={attempts:[{seal:'d'.repeat(64)}]};
p.originalMeridianWeb={originalStageFiveSourceHash:'e'.repeat(64)};
fake.stage=5;fake.originalStageThreeIndividualGates=gateData;
fake.originalStageFiveWebRoutes=[{segments:[{kind:'extraordinary',number:1}]}];
const stage5=Phys.synchronize(s,p);
A.equal(stage5.applied,true);
A.equal(human.toughness,base.toughness+3);
A.equal(human.boxes[1],base.boxes[1]+1);
A.equal(human.wpr,1);
A.deepEqual(human.wounds,[1,0,0]);
p.originalMeridianAdvanced={achieved:{7:{originalSourceHash:'7'.repeat(64)}}};
fake.stage=7;
const stage7=Phys.synchronize(s,p);
A.equal(stage7.applied,true);
A.equal(human.boxes[2],base.boxes[2]+1);
// Isolated source-only Body Cycle confirmation: another original power
// already granted its own +2; Meridian may not erase or double count it.
p.originalFirstPowerMilestones={body:{kind:'body-muscle-tendon-cycle-one',
 maxStaminaBefore:human.maxStamina,maxStaminaAfter:human.maxStamina+2}};
human.maxStamina+=2;human.stamina+=2;
const coexist=Phys.synchronize(s,p);
A.equal(coexist.applied,false);
A.equal(human.maxStamina,base.stamina+
 B.meridianProfile(7,{meridians:12,gatesS:108,
  seaRings:1,extraordinary:1,webComplete:true,intentDepth:1}).
 bonuses.stamina+2,'Original Body and Meridian physiological effects coexist');
A.deepEqual(human.wounds,[1,0,0]);
const forged=structuredClone(human);
forged.originalMeridianPhysical.bonuses.stamina=999;
A.throws(()=>Phys.synchronize({table:{combatants:{npc_person_1:forged}}},p),
 /bonus record was altered/);
const corrupted=structuredClone(human);
corrupted.maxStamina=999;
A.throws(()=>Phys.synchronize({table:{combatants:{npc_person_1:corrupted}}},p),
 /ancestry differs/);
const falseActor=structuredClone(p);falseActor.actorId='emergent:person_8';
A.throws(()=>Phys.synchronize(s,falseActor),/witnessed human Combat body/);
ownerProof.valid=false;
A.throws(()=>Phys.sourceProfile(s,p),
 /stage source failed full owner replay/,
 'A fabricated advanced-stage status cannot grant Combat bonuses without its actual chronological owner');
ownerProof.valid=true;
console.log('Isolated shared original NPC Combat parity PASS: physically earned Stage I, II, gate 36, V and VII stamina/toughness/wound boxes/wpr; no free recovery or technique, forged body/seal rejected; earlier stages are synthetic VM-only');
