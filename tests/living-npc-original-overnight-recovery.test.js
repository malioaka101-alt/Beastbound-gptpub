'use strict';
// A genuinely witnessed, independently accepted real 8h night applies the
// original Combat wound-and-Stamina recovery. No separate health or sleep
// simulation, free recovery, power stage, or historical backfill.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Atlas=require('../world/atlas'),
 Combat=require('../rules/combat'),Unified=require('../rules/unified'),
 World=require('../rules/world');
const sleep=(s,p,witness)=>Rules.act(s,{system:'health',
 operation:'witnessedNpcNightSleep',params:{actorId:p.actorId,witness}});
function rngNext(n){let x=n>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x91e10da5;}
function fixture(accept,seed){
 const s=E.newGame({seed,name:'Disposable source witnessed human night'}),
  w=Realm.ensure(s),list=People.ensure(w),
  reg=Atlas.regions.find(r=>{
   const site=People.siteFor(r.id);
   return !!site&&E.LOCATIONS[site]?.biome==='settlement';
  });
 A.ok(reg,'Original world must have a supported inhabited settlement');
 const eco=w.ecosystems[reg.id],host=w.countries[reg.polity];
 eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
 host.prosperity=75;host.stability=78;
 const d=People.sourceDemand(w,reg);
 A.ok(d);
 let p=null;
 for(let i=0;i<90;i++){
  const c=People._debug.make(w,list,0,d),
   chance=Math.min(94,
    ({curious:71,steady:82,independent:68,reserved:77})[c.personality]+
    (c.fatigue>=50?9:0));
  if(c.mechanicalFoundation.baselineAttributes.con>=7&&
   (1+Math.floor(rngNext(c.rngState)/4294967296*100)<=chance)===accept){
   p=c;break;
  }
 }
 A.ok(p,'An authentic willing or refusing adult must be sourced');
 p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);
 s.chatRuntime||={};
 const sourceWitness=p.name+
  ' is an uninjured, unarmed, unarmoured adult here at '+
  s.world.location+', physically witnessed in this scene.';
 s.chatRuntime.scene='Independent adult currently present: '+sourceWitness;
 const linked=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
  params:{npcId:p.actorId,witness:sourceWitness}});
 A.equal(linked.created,true);
 const c=Combat.get(s,linked.id);
 Combat.harm(s,c,2);
 A.equal(c.wounds[0],1,'An original actual combat injury must exist');
 A.equal(c.status,'ok');
 const before=s.world.minutes;
 E.advance(s,16*60+30-before);
 World.finalizeTime(s,before);
 const witness=p.name+' is witnessed going to a safe room for sleep '+
  'in the inhabited settlement, preparing for eight continuous hours.';
 s.chatRuntime.scene='Safe lodging and the individual are personally witnessed: '+witness;
 return {s,w,p,c,witness};
}
for(const accept of [true,false]){
 const {s,p,c,witness}=fixture(accept,accept?941011:941037),
  before=E.exportGame(s),oldNpcRng=p.rngState,
  playerRng=s.rngState,playerStamina=s.player.stamina,
  beforeMinute=s.world.minutes,oldWounds=[...c.wounds],
  oldStamina=c.stamina;
 A.equal(Unified.verifyNpcNightHistory(s,p.actorId),true);
 for(const wrong of [
  {actorId:p.actorId,witness,accepted:true},
  {actorId:p.actorId,witness,healing:50},
  {actorId:p.actorId,witness,stage:9}
 ]){
  A.throws(()=>Rules.act(s,{system:'health',
   operation:'witnessedNpcNightSleep',params:wrong}),
   /witnessed sleeping opportunity/);
  A.equal(E.exportGame(s),before);
 }
 const action=sleep(s,p,witness);
 A.equal(action.freelyAccepted,accept);
 A.equal(action.completedOriginalNight,accept);
 A.equal(action.noNewHealthOrPowerSystem,true);
 A.equal(action.elapsedMinutes,accept?480:5);
 A.equal(s.world.minutes,beforeMinute+(accept?480:5));
 A.equal(p.rngState,rngNext(oldNpcRng),
  'One original personal choice RNG draw, never a player roll');
 // Actual midnight world ticks can consume the existing world RNG.
 // Compare an identical original time advance, not an impossible frozen world.
 const calendarControl=E.importGame(before);
 E.advance(calendarControl,accept?480:5);
 World.finalizeTime(calendarControl,beforeMinute);
 A.equal(s.rngState,calendarControl.rngState,
  'NPC sleep must not add any extra player/world dice beyond real elapsed time');
 A.equal(s.player.stamina,playerStamina);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.deepEqual(p.knownTechniques,[]);
 A.deepEqual(p.practicedDisciplines,[]);
 A.equal(Unified.verifyNpcNightHistory(s,p.actorId),true);
 const receipt=p.originalOvernightRestDecisions.at(-1);
 A.equal(receipt.source.accepted,accept);
 A.equal(receipt.source.originalCombatEntrySeal,c.npcOrigin.seal);
 A.equal(People.verifyOriginalNightChoice(receipt.source),true);
 if(accept){
  A.equal(c.stamina,c.maxStamina,'Original completed-night stamina restores to true maximum');
  A.equal(c.wounds[0],0,'Exactly one original Light wound is healed');
  A.equal(c.wounds[1],oldWounds[1]);
  A.equal(c.wounds[2],oldWounds[2]);
  A.equal(receipt.result.staminaBefore,oldStamina);
  A.equal(receipt.result.staminaAfter,c.maxStamina);
  A.equal(receipt.result.endedMinute,beforeMinute+480);
 }else{
  A.equal(c.stamina,oldStamina);
  A.deepEqual(c.wounds,oldWounds,'Refusal creates no phantom healing');
  const fixed=E.exportGame(s),rng=p.rngState;
  A.throws(()=>sleep(s,p,witness),
   /same person already answered|witnessed evening start/);
  A.equal(E.exportGame(s),fixed);
  A.equal(p.rngState,rng);
 }
 const saved=E.exportGame(s),replay=E.importGame(saved);
 const rp=Realm.peek(replay).emergentPeople.people[p.id];
 A.equal(Unified.verifyNpcNightHistory(replay,p.actorId),true);
 A.deepEqual(rp.originalOvernightRestDecisions,p.originalOvernightRestDecisions);
 A.deepEqual(Combat.get(replay,'npc_'+p.id),c);
 A.equal(E.exportGame(s),saved,'Source verification is pure');
 const tampered=E.importGame(saved),tp=Realm.peek(tampered).emergentPeople.people[p.id];
 const invalidChoice=tp.originalOvernightRestDecisions[0].source;
 invalidChoice.roll=invalidChoice.roll===1?2:1;
 A.equal(Unified.verifyNpcNightHistory(tampered,p.actorId),false,
  'A forged personal rest decision cannot become healed Stamina');
}
{
 const {s,p,witness,c}=fixture(true,941057);
 const saved=E.exportGame(s),rng=p.rngState;
 s.chatRuntime.scene='The person has left; there is no room or sleep witnessed here.';
 const changed=E.exportGame(s);
 A.throws(()=>sleep(s,p,witness),/original scene needs a true safe room/);
 A.equal(E.exportGame(s),changed);
 A.equal(p.rngState,rng);
 A.notEqual(saved,changed);
 Combat.harm(s,c,7);
 A.throws(()=>sleep(s,p,witness),/legal original wound condition/);
}
{
 const s=E.newGame({seed:941071,name:'Original player sleep remains identical'});
 Unified.ensurePlayer(s);
 const c=Combat.get(s,'player');
 c.wounds=[1,1,0];c.stamina=Math.max(1,c.stamina-2);
 s.player.stamina=c.stamina;
 const start=s.world.minutes;
 const outcome=Unified.sleep(s,{hours:8});
 A.equal(s.world.minutes,start+480,'One original night only, no second advancement');
 A.deepEqual(c.wounds,[0,1,0],'Light heals one, Serious never heals on a night');
 A.equal(c.stamina,c.maxStamina);
 A.equal(s.player.stamina,c.maxStamina);
 A.equal(outcome.sleptHours,8);
}
console.log('Living NPC original overnight recovery: actual independent choice, real 8h settlement time, original Combat stamina/light-wound rules, refused rest, no player changes, pure replay and forged-rest refusal PASS');
