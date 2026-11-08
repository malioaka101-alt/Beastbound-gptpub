'use strict';
const A=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const E=require('../engine'),Rules=require('../rules'),H=Rules.unified,Combat=Rules.combat,Turn=require('../scripts/chat-turn'),Panels=require('../panels');
const Scene=require('./scene-witness-fixture');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bb-unify-')),file=path.join(dir,'synthetic.json');
const load=()=>E.importGame(fs.readFileSync(file,'utf8'));
const write=s=>fs.writeFileSync(file,E.exportGame(s)+'\n');
let assertions=0;const eq=(a,b,msg)=>{A.deepEqual(a,b,msg);assertions++;};
try{
 const original=E.newGame({seed:811173,name:'Wound Model Fixture',background:'fieldworker',path:'meridian'});
 const originalText=E.exportGame(original);
 write(original);
 const look=Turn.execute(file,{id:'unify_status_001',mode:'rule',system:'health',operation:'status'});
 eq(look.applied,false);eq(look.output.rules.model,'legacy-hp');
 let r=Turn.execute(file,{id:'unify_migrate_001',mode:'rule',system:'health',operation:'ensurePlayer'});
 eq(r.applied,true);eq(load().table.healthModel,'wounds-v1');
 eq(load().player.health,64);eq(load().table.combatants.player.stamina,52);
 const checkpoint=fs.readFileSync(file,'utf8');
 eq(Turn.execute(file,{id:'unify_migrate_001',mode:'rule',system:'health',operation:'ensurePlayer'}).duplicate,true);
 eq(fs.readFileSync(file,'utf8'),checkpoint);
 A.throws(()=>Turn.execute(file,{id:'unify_oldcombat_001',mode:'act',action:'fight'}),/retired/);assertions++;
 eq(fs.readFileSync(file,'utf8'),checkpoint);
 const scene=load();
 Scene.record(scene,'unify_reeds_0001',{attribute:'wis',skill:'survival',dc:13,
  minutes:15,label:'Examine reeds'});
 write(scene);
 const gain=Turn.execute(file,{id:'unify_fieldcheck_001',mode:'check',checkId:'unify_reeds_0001'});
 eq(gain.applied,true);eq(gain.output.check.modifier,5); // Wis +1, Survival Rank 2 (+4).
 eq(load().player.health,64);eq(load().player.stamina,load().table.combatants.player.stamina);
 // A real wound never changes the historical HP number; panels show wound boxes instead.
 let s=load();Combat.harm(s,s.table.combatants.player,2);H.sync(s);H.validate(s);write(s);
 eq(load().table.combatants.player.wounds[0],1);eq(load().player.health,64);
 const h=Panels.core(load());A.ok(h.includes('Wounds L ■□□ S □□ C □'));assertions++;
 A.ok(h.split('\n').every(x=>Array.from(x).length===34));assertions++;
 const healed=Turn.execute(file,{id:'unify_balm_001',mode:'act',action:'heal'});
 eq(healed.applied,true);eq(healed.output.health.wounds,[0,0,0]);eq(load().player.inventory.healing_balm,undefined);
 eq(load().player.health,64);
 // A sleep interval restores exertion but doesn't magically erase serious injuries.
 s=load();Combat.harm(s,s.table.combatants.player,3);H.sync(s);write(s);
 const rest=Turn.execute(file,{id:'unify_sleep_001',mode:'act',action:'rest'});
 eq(rest.applied,true);eq(rest.output.health.sleptHours,8);eq(load().table.combatants.player.wounds[1],1);
 eq(load().player.health,64);eq(load().player.stamina,load().table.combatants.player.stamina);
 // Stale hash and duplicate requests cannot apply the action twice.
 const copy=fs.readFileSync(file,'utf8');eq(Turn.execute(file,{id:'unify_sleep_001',mode:'act',action:'rest'}).duplicate,true);eq(fs.readFileSync(file,'utf8'),copy);
 const wrong=Turn.execute(file,{id:'unify_bad_hash_001',mode:'act',action:'rest',expectedHash:'not-a-valid-hash'});
 eq(wrong.applied,false);eq(fs.readFileSync(file,'utf8'),copy);
 // An already injured legacy save must not silently assign a wound severity.
 const injured=E.newGame({name:'Legacy Injury',seed:1001});injured.player.health=50;
 A.throws(()=>H.ensurePlayer(injured),/adjudicated migration/);assertions++;
 eq(injured.table.combatants.player,undefined);
 const convert=H.migrateLegacy(injured,{wounds:[1,0,0],reason:'Previous saved scene explicitly recorded a Light wound to the shoulder'});
 eq(convert.migrated,true);eq(injured.player.health,50);H.validate(injured);
 // No invented beast combat stats: require provenance and actual observed combat profile.
 const pending=E.newGame({seed:291,name:'Ranger'});
 pending.beasts.fen_sample={id:'fen_sample',name:'Territorial fen grazer',sapience:1,
  species:'mirehorn',evolutionStage:'Base',hp:52,maxHp:52};
 pending.encounter={beastId:'fen_sample',observed:true,approaches:1,threat:true};
 A.throws(()=>Rules.act(pending,{system:'combat',operation:'begin',params:{beastId:'fen_sample'}}),/source-recorded individual beast combat profile/);assertions++;
 eq(pending.battle,null);
 pending.beasts.fen_sample.combatAssessment={beastId:'fen_sample',species:'mirehorn',
  evolutionStage:'Base',sapience:1,worldMinute:pending.world.minutes,
  source:'Independently observed and established fen grazer anatomical combat examination',
  behavior:{style:'territorial',nonlethal:false,canCommunicate:false,withdrawalDC:15,
   parleyDC:19,source:'Observed territorial defense and retreat behavior in the fen marshes'},
  stats:{toughness:9,defense:12,stamina:10,vigor:2,will:1,
   sapience:1,attack:4,damage:5,offM:0,durM:0,boxes:[4,2,1]}};
 const begin=Rules.act(pending,{system:'combat',operation:'begin',params:{beastId:'fen_sample'}});
 eq(begin.started,true);eq(pending.battle.mode,'wounds-v1');eq(pending.table.combatants.player.stamina,pending.player.stamina);
 // The beast decides independently before either combat die, not because
 // the player supplies a favorable opponent action in a chat request.
 A.throws(()=>Rules.act(pending,{system:'combat',operation:'exchange',params:{intent:'defend',enemyPlan:'hold'}}),/Enemy plan|enemy plans/);assertions++;
 const startTime=pending.world.minutes;
 const ex=Rules.act(pending,{system:'combat',operation:'exchange',params:{intent:'defend',playerBrace:false}});
 A.ok(['attack','hold','retreat'].includes(ex.enemyPlan));assertions++;
 eq(ex.ownResult.defending,true);eq(pending.world.minutes,startTime+1);
 eq(pending.player.health,pending.table.legacyHealth.current);eq(pending.player.stamina,pending.table.combatants.player.stamina);
 H.validate(pending);
 // Opponents can retreat according to their independently authored style.
 // A request cannot tell a creature to flee after seeing an unfavourable die.
 if(pending.battle){
  A.throws(()=>Rules.act(pending,{system:'combat',operation:'exchange',
   params:{intent:'defend',enemyPlan:'retreat'}}),/Enemy plan|enemy plans/);assertions++;
 }
 // The source uses PP cost thresholds, max rank five, not ten XP levels.
 const normal=E.newGame({seed:14});const sk=normal.player.skills.survival;sk.rank=3;sk.xp=99;
 E.check(normal,{attribute:'wis',skill:'survival',dc:15,description:'One practice field check'});
 A.ok(sk.rank<=3,'rank 4 cannot bypass a Mastery Trial');assertions++;
 // Fractional scales must be accounted for without rounding away Talons.
 const cost=H.spend(normal,{scales:25,reason:'Quarter-Talon sample fee'});eq(cost.balanceScales,8475);eq(normal.player.coins,84.75);
 // World agendas progress without making the character the centre of events.
 const world=E.newGame({name:'Ledger Test',seed:10003});
 const agenda=Rules.agendas;
 agenda.register(world,{id:'ferry_repair',owner:'South Marsh ferrymen',goal:'Repair the damaged ferry landing',origin:'Documented repairs from a guild notice',segments:4,cadence:'sixday',publiclyKnown:true});
 agenda.register(world,{id:'sealed_court',owner:'A distant magistrate',goal:'Negotiate a private treaty',origin:'Precommitted unrelated political background',segments:4,cadence:'sixday',publiclyKnown:false});
 const advance=Rules.world.advance(world,12); // Offline simulation reference, not a free playable time skip.
 eq(advance.publicAgendas[0].progress,2);eq(world.table.agendas.sealed_court.progress,2);
 A.ok(!JSON.stringify(advance).includes('magistrate'));assertions++;
 A.ok(!JSON.stringify(Rules.agendas.publicStatus(world)).includes('magistrate'));assertions++;
 A.ok(!world.log.some(e=>e.text.includes('private treaty')));assertions++;
 const hears=Rules.act(world,{system:'world',operation:'agendaReveal',params:{id:'sealed_court',channel:'letter',source:'Stamped message from the named magistrate'}});
 eq(hears.known,true);
 eq(Rules.agendas.publicStatus(world).length,2);
 // Wildland sleep without previously recorded campsite evidence must fail.
 const out=E.newGame({name:'Camper',seed:2004});out.world.location='fen';
 A.throws(()=>H.sleep(out,{hours:8}),/source-recorded shelter ID/);assertions++;
 A.throws(()=>H.sleep(out,{hours:8,shelterVerified:true,
   shelterSource:'I claim this is a safe campsite'}),/saved world fact/);assertions++;
 out.table||={};out.table.sleepShelters={dry_bank_01:{
  id:'dry_bank_01',name:'Surveyors dry bank campsite',location:'fen',
  worldMinute:out.world.minutes,validUntilMinute:out.world.minutes+1440,
  knownToPlayer:true,safe:true,
  source:'Named marsh surveyors inspected and approved a dry wind-protected bank shelter'
 }};
 const sheltered=H.sleep(out,{hours:8,shelterId:'dry_bank_01'});
 eq(sheltered.sleptHours,8);
 // Wound combatant observations must not disclose exact hidden Stamina or boxes.
 const publicCreature=Combat.observedCombatant(pending.table.combatants['beast:fen_sample']);
 A.ok(!Object.hasOwn(publicCreature,'wounds')&&!Object.hasOwn(publicCreature,'stamina'));assertions++;
 // Every time-consuming checked scene must advance a pre-established off-screen agenda
 // exactly once at each sixday boundary; short scenes must not manufacture a tick.
 const route=path.join(dir,'route.json');
 const traveller=E.newGame({seed:21222,name:'World Tick Checker'});
 Rules.agendas.register(traveller,{id:'ferry_clock',owner:'Whisperfen boatwrights',goal:'Repair the public ferry rope rig',origin:'Stamped boatwright guild work order',segments:6,cadence:'sixday',publiclyKnown:true});
 fs.writeFileSync(route,E.exportGame(traveller)+'\n');
 for(let i=0;i<6;i++){
  const location=E.importGame(fs.readFileSync(route,'utf8'));
  Scene.record(location,'route_scene_000'+i,{attribute:'wis',skill:'survival',
   dc:11,minutes:1440,label:'Monitor survey route'});
  fs.writeFileSync(route,E.exportGame(location)+'\n');
  const req={id:'route_000'+i,mode:'check',checkId:'route_scene_000'+i};
  const outcome=Turn.execute(route,req);eq(outcome.applied,true);
 }
 const tFinal=E.importGame(fs.readFileSync(route,'utf8'));
 eq(tFinal.table.agendas.ferry_clock.progress,1);
 eq(tFinal.table.calendar.sixdays.length,1);
 eq(Turn.execute(route,{id:'route_0005',mode:'check',checkId:'route_scene_0005'}).duplicate,true);
 eq(E.importGame(fs.readFileSync(route,'utf8')).table.agendas.ferry_clock.progress,1);
 // A previously used ID stays protected even after more than 150 checkpoints.
 const bulk=path.join(dir,'bulk.json');fs.writeFileSync(bulk,E.exportGame(E.newGame({seed:8000,name:'Id Ledger'}))+'\n');
 for(let i=0;i<155;i++){
   const req={id:'ledger_'+String(i).padStart(4,'0'),mode:'checkpoint',scene:'Chronicle beat '+i};
   const completed=Turn.execute(bulk,req);eq(completed.applied,true);
 }
 eq(Turn.execute(bulk,{id:'ledger_0000',mode:'checkpoint',scene:'Chronicle beat 0'}).duplicate,true);
 const spoof=Turn.execute(bulk,{id:'ledger_0000',mode:'checkpoint',scene:'Change the past'});
 eq(spoof.applied,false);A.match(spoof.error,/different request/);assertions++;
 eq(E.exportGame(original),originalText); // Never changed the original disposable fixture.
 console.log(`Unified text-RPG tests passed (${assertions} deterministic assertions)`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}