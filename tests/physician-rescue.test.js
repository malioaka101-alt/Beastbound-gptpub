'use strict';
// Disposable rescue fixtures only; no real campaign encounter or save altered.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),H=require('../rules/unified'),
 Combat=require('../rules/combat'),Agency=require('../rules/combat-agency'),
 Turn=require('../scripts/chat-turn.js');
const action=(s,name,p={})=>R.act(s,{system:'health',operation:name,params:p});
function collapsed(seed,style='cautious',site='academy'){
 const s=E.newGame({seed,name:'External Physician Response Fixture',path:'undecided'});
 if(site==='academy')A.equal(E.dispatch(s,'travel academy').ok,true);
 const loc=s.world.location;
 // A separate fixture creates a fully assessed, real private-combat profile,
 // not a new live encounter or a story-derived claim.
 s.beasts.fox={id:'fox',name:'Independently Assessed Nonlethal Fox',
  species:'fenfox',evolutionStage:'Base',sapience:1,location:loc,hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,
  source:'Pre-verified individual animal anatomical and threat assessment for the rescue fixture',
  behavior:{style,nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:19,
   source:'Previously witnessed independently cautious nonlethal assault and disengagement behaviour'},
  stats:{toughness:7,defense:12,stamina:8,vigor:1,will:1,offM:0,durM:0,
   sapience:1,attack:30,damage:60,boxes:[3,2,1]}
 };
 R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
 const c=Combat.get(s,'player');c.wounds=[...c.boxes];c.stamina=0;
 H.sync(s,{source:'wounds'});
 return s;
}
function defeated(style='cautious',site='academy'){
 for(let seed=92101;seed<92401;seed++){
  const s=collapsed(seed,style,site);
  if(Agency.choose(s).plan!=='attack')continue;
  const response=R.act(s,{system:'combat',operation:'exchange',
   params:{intent:'defend',playerBrace:false}});
  if(response.player.status==='knocked_out'){
   A.equal(response.ended,true);A.equal(response.rescueRequired,true);
   return s;
  }
 }
 throw Error('Deterministic independent attacking fixture with nonlethal defeat not found');
}
{
 const s=defeated(),c=s.table.combatants.player,incident=s.table.combatDefeats[0],
  rng=s.rngState,snapshot=E.exportGame(s);
 A.equal(s.battle,null);A.equal(c.status,'knocked_out');
 A.equal(incident.opponentStyle,'cautious');
 A.equal(incident.dangerCleared,true);
 A.equal(typeof incident.eventHash,'string');
 A.equal(incident.eventHash.length,64);
 A.equal(incident.location,'academy');
 const view=action(s,'rescueStatus');
 A.equal(view.eligible,true);A.equal(view.localPhysician,'Dr Vael');
 A.equal(E.exportGame(s),snapshot);
 A.equal(s.rngState,rng);
 for(const p of [{rescuer:'omniscient hero'}, {healedCritical:99}, {cost:0,minutes:0}]){
  A.throws(()=>action(s,'physicianRescue',p),/no selected rescuer/);
  A.equal(E.exportGame(s),snapshot);
 }
 const started=s.world.minutes,wounds=[...c.wounds],legacy=s.player.health;
 const result=action(s,'physicianRescue');
 A.equal(result.stabilized,true);
 A.equal(result.externalRescuer,'Dr Vael');
 A.equal(result.finalStatus,'incapacitated');
 A.equal(result.criticalCareStillRequired,true);
 A.equal(result.woundsHealed,0);
 A.equal(result.noSelfRescue,true);A.equal(result.noNewDie,true);
 A.equal(result.transported,false);
 A.equal(s.world.minutes,started+270);
 A.equal(s.rngState,rng);
 A.equal(s.player.health,legacy);
 A.deepEqual(c.wounds,wounds);
 A.equal(c.status,'incapacitated');
 A.equal(c.firstAided,true);
 A.ok(c.conditions.includes('under_clinical_observation'));
 A.equal(s.table.physicianRescue.receipts.length,1);
 A.equal(s.table.combatDefeats[0].rescued,true);
 A.equal(action(s,'rescueStatus').eligible,false);
 const after=E.exportGame(s);
 A.throws(()=>action(s,'physicianRescue'),/actually knocked-out/);
 A.equal(E.exportGame(s),after);
}
{
 const s=defeated('predatory'),original=E.exportGame(s),rng=s.rngState;
 A.equal(s.table.combatDefeats[0].dangerCleared,false);
 A.equal(action(s,'rescueStatus').eligible,false);
 A.throws(()=>action(s,'physicianRescue'),/genuinely departed opponent/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
}
{
 const s=defeated('cautious','crossing'),old=E.exportGame(s);
 A.throws(()=>action(s,'physicianRescue'),/physician is not at the site/);
 A.equal(E.exportGame(s),old);
}
{
 const s=defeated(),incident=s.table.combatDefeats[0];
 incident.dangerCleared=false;
 const changed=E.exportGame(s);
 A.throws(()=>action(s,'physicianRescue'),/genuinely departed opponent/);
 A.equal(E.exportGame(s),changed);
 incident.dangerCleared=true;
 incident.eventHash='faked_hash';
 const forged=E.exportGame(s);
 A.throws(()=>action(s,'physicianRescue'),/event hash must agree/);
 A.equal(E.exportGame(s),forged);
}
{
 const s=defeated(),incident=s.table.combatDefeats[0];
 s.world.minutes=18*60;
 const previous=E.exportGame(s);
 A.throws(()=>action(s,'physicianRescue'),/response window/);
 A.equal(E.exportGame(s),previous);
 // A fresh rescue may not be invoked 90 minutes after the actual collapse.
 s.world.minutes=incident.worldMinute+90;
 const late=E.exportGame(s);
 A.throws(()=>action(s,'physicianRescue'),/fresh independently witnessed/);
 A.equal(E.exportGame(s),late);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-physician-rescue-'));
 try{
  const file=Path.join(dir,'save.json'),s=defeated();
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'rescue_forged_0001',mode:'rule',
   system:'health',operation:'physicianRescue',
   params:{doctor:'some magical healer'}}),/no selected rescuer/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  for(const req of [
   {id:'unconscious_gear_00001',mode:'rule',system:'gear',operation:'purchase',params:{}},
   {id:'unconscious_walk_0001',mode:'act',action:'travel crossing'}
  ]){
   A.throws(()=>Turn.execute(file,req),/no conscious movement/);
   A.equal(FS.readFileSync(file,'utf8'),before);
  }
  const view=Turn.execute(file,{id:'rescue_status_0001',mode:'rule',
   system:'health',operation:'rescueStatus',params:{}});
  A.equal(view.applied,false);
  A.equal(view.output.rules.eligible,true);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const rescue={id:'rescue_real_00001',mode:'rule',
   system:'health',operation:'physicianRescue',params:{}};
  const out=Turn.execute(file,rescue);
  A.equal(out.applied,true);
  A.equal(out.output.rules.woundsHealed,0);
  A.equal(Turn.execute(file,rescue).duplicate,true);
  const saved=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(saved.table.combatants.player.status,'incapacitated');
  A.equal(saved.table.physicianRescue.receipts.length,1);
  const bytes=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...rescue,id:'rescue_repeat_0001'}),
   /actually knocked-out/);
  A.equal(FS.readFileSync(file,'utf8'),bytes);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Source-witnessed independent physician response requires real post-defeat danger clearance and preserves Critical injuries');
