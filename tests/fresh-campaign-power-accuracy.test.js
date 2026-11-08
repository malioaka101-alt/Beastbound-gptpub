'use strict';
// Disposable fresh-game foundation audit. No active campaign is created or
// overwritten, and these readouts cannot grant skills, powers or evolution.
const A=require('node:assert/strict');
const E=require('../engine');
const New=require('../scripts/new-campaign');
const Power=require('../rules/power-overview');
const Panels=require('../panels');
const Disc=require('../rules/disciplines');
const Realm=require('../world/simulation');

let meridian=null,arcane=null,partner=null;
for(let seed=1;seed<=120;seed++){
 const {state:s}=New.create({seed,slug:'fresh_foundation_test'});
 const source=E.exportGame(s),rng=s.rngState;
 const v=Power.read(s),character=Panels.full(s,'character'),
  detail=Panels.full(s,'power'),hud=Panels.hudData(s);
 if(s.player.path==='meridian'&&!meridian)meridian=s;
 if(s.player.path==='arcane'&&!arcane)arcane=s;
 if(s.player.path==='partner'&&!partner)partner=s;
 A.equal(v.meridian.stage,0);
 A.match(v.meridian.stageName,/Stage I not yet attained/);
 A.equal(v.meridian.gatesOpened,0);
 A.equal(v.meridian.training.progress,0);
 A.equal(v.arcane.circles,0);
 A.equal(v.arcane.manaCoreEstablished,false);
 A.equal(v.soul.phase,0);
 A.equal(v.body.completedCycles,0);
 A.equal(v.rift.step,0);
 A.equal(v.humanEvolution.stage,0);
 A.equal(v.humanEvolution.stageName,'Baseline Human');
 A.equal(hud.date.known,true);
 A.equal(hud.date.absolute,Realm.calendar(s).absoluteDate);
 A.equal(v.meridian.cultivationSkillRank,s.player.skills.cultivation.rank);
 A.equal(v.arcane.arcanaSkillRank,s.player.skills.arcana.rank);
 A.ok(s.player.mana>0&&s.player.qi>0,
  'Starting resource reserves are not power unlocks');
 A.ok(character.includes('POWER STAGES'));
 A.ok(character.includes('HUMAN EVOLUTION'));
 A.ok(character.includes('PARTNERSHIP'));
 A.ok(character.includes('Rank '));
 A.ok(detail.includes('MERIDIAN')&&detail.includes('ARCANE'));
 for(const panel of [character,detail]){
  for(const line of panel.split('\n'))
   A.equal(Array.from(line).length,34,'Fallback must fit a phone');
  A.ok(!panel.includes('latent'),'Secret potential must stay private');
 }
 // No read-only power/character screen may spend RNG, advance time or write.
 A.equal(E.exportGame(s),source);
 A.equal(s.rngState,rng);
 if(s.player.meridian.foundation>0){
  A.equal(v.meridian.startingPreparatoryFoundation,
   s.player.meridian.foundation);
  A.equal(v.meridian.legacyPreparatoryFoundation,undefined);
  A.match(v.meridian.warning,/not verified current training-track progress/);
  A.ok(detail.includes('Foundation '+v.meridian.startingPreparatoryFoundation));
 }
 // Sync belongs to actual saved partners and is never a human power stage.
 for(const id of s.player.partnerIds||[]){
  const b=s.beasts[id];
  A.ok(b);
  A.ok(character.includes('sync stage '+b.syncStage));
  A.notEqual(b.level,v.meridian.stage);
 }
}
A.ok(meridian&&arcane&&partner,'Fresh seeds should exercise distinct focuses');
A.equal(Power.read(meridian).meridian.startingPreparatoryFoundation,20);
A.equal(Power.read(arcane).arcane.coreIgnited,false);
A.ok(arcane.player.arcane.insight>0,
 'Starting Arcane insight is preparatory; the Core is still unconstructed');
A.equal(partner.player.partnerIds.length,1);
A.equal(Power.read(partner).humanEvolution.stage,0);

// Contrast a deliberately old-style, unversioned fixture with new creation.
// This preserves the older warning without mislabelling a fresh character.
const legacy=E.newGame({seed:853017,name:'Old Format Fixture',
 path:'meridian',background:'fieldworker'});
const older=Power.read(legacy);
A.equal(older.meridian.legacyPreparatoryFoundation,20);
A.equal(older.meridian.startingPreparatoryFoundation,undefined);

// A new character may undertake a real short independent practice session,
// but no first-stage unlock, learned spell or evolution is inferred from it.
// This is an engine-owned roll on a disposable state, never a real campaign.
const s=E.importGame(E.exportGame(meridian)),before=s.world.minutes,
 stamina=s.player.stamina,coins=s.player.coins;
const attempt=Disc.practice(s,{system:'meridian',method:'breath',
 route:'independent',minutes:15});
A.equal(attempt.system,'meridian');
A.equal(attempt.elapsedMinutes,15);
A.equal(attempt.feeTalons,0);
A.ok(Number.isInteger(attempt.check.roll));
A.equal(s.world.minutes,before+15);
A.ok(s.player.stamina<=stamina-1);
A.equal(s.player.coins,coins);
A.equal(Power.read(s).meridian.stage,0,
 'Earned preparation is not a successful Stage I breakthrough');
A.equal(Power.read(s).meridian.training.progress,attempt.progress);

console.log('Fresh foundation power audit passed: 120 new starts, correct separate stages and ranks, no implied power from Qi/Mana or preparation, sealed potentials, panels and one genuine short practice');
