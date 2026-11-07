'use strict';
// Foundation-first integration: independent Meridian anatomy, actual time,
// private world consequences, prior-gate consistency and idempotent chat saves.
// Prepared Stage-II anatomy in these fixtures is ONLY a test precondition;
// the separate source-parity suite checks real earlier advancement rites.
const A=require('node:assert/strict'),OS=require('node:os'),
 Path=require('node:path'),FS=require('node:fs'),
 E=require('../engine.js'),R=require('../rules'),
 Contacts=require('../world/independent-contacts'),
 Turn=require('../scripts/chat-turn');
const fresh=seed=>{
 const s=E.newGame({seed,name:'Unaffiliated Meridian Test',path:'meridian'});
 R.unified.ensurePlayer(s);
 s.world.location='crossing';
 s.player.attributes.wis=20;
 s.player.skills.cultivation.rank=5;
 // The isolation fixture begins with already attained Stage-II anatomy.
 s.player.meridian.stage=2;s.player.meridian.gates=[];
 s.table.powerPhysiology={meridian:{foundationQuality:'Firm',
  primaryMapped:12,gateRecords:[],deviationHistory:[]}};
 return s;
};
const act=(s,p)=>R.act(s,{system:'meridian',operation:'gatePractice',params:p});
{
 const s=fresh(981100),before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,{metMilestone:true}),/caller-supplied/);
 A.throws(()=>act(s,{route:'independent',source:'An invented tutor'}),/Independent Gate work/);
 A.throws(()=>act(s,{route:'established',source:'A supposed guild instructor'}),/No established safe/);
 A.throws(()=>act(s,{force:'guaranteed'}),/genuine declared choice/);
 A.throws(()=>act(s,{quality:'Perfect'}),/caller-supplied/);
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,rng);
 const readBefore=E.exportGame(s);
 const offering=R.act(s,{system:'discipline',operation:'status',params:{}});
 A.equal(offering.systems.meridian.target,'Gate 1/108');
 A.equal(offering.systems.meridian.independentAvailableAtCurrentSite,true);
 A.equal(offering.systems.meridian.independentPracticeDC,13);
 A.equal(offering.systems.meridian.gatePractice.sessionMinutes.minimum,15);
 A.equal(E.exportGame(s),readBefore,'status must not advance the game');
 const money=s.player.coins,start=s.world.minutes;
 let last,opened=null,spent=0;
 for(let i=0;i<8&&!opened;i++){
  const minutes=i===0?15:180;
  last=act(s,{force:false,minutes});spent+=minutes;
  A.equal(last.minutes,minutes);
  A.equal(last.route,'independent');
  A.equal(last.tuitionTalons,0);
  A.match(last.source,/Personal meridian gate-1 practice/);
  A.equal(last.actualDC,13);
  A.equal(last.check.dc,13);
  opened=last.opened;
 }
 A.ok(opened,'a safe, capable practitioner can open the first Gate by real independent practice');
 A.equal(opened.number,1);A.equal(opened.band,'Lower');
 A.equal(s.player.meridian.gates.length,1);
 A.equal(s.table.powerPhysiology.meridian.gateRecords.length,1);
 A.equal(s.player.coins,money);
 A.ok(s.world.minutes>start);
 A.equal(s.world.minutes-start,spent);
 // World time and the same save now drive real non-player lives.
 R.world.advance(s,6);
 A.equal(Contacts.verify(s.table.realm,s.table.realm.independentContacts),true);
 A.equal(s.table.emergentConversations,undefined,
  'offscreen lives cannot write the player conversation memory');
 const saved=E.importGame(E.exportGame(s));
 A.deepEqual(saved.player.meridian.gates,s.player.meridian.gates);
 A.deepEqual(saved.table.powerPhysiology,s.table.powerPhysiology);
 A.deepEqual(saved.table.realm.independentContacts,
  s.table.realm.independentContacts);
}
{
 const s=fresh(981101);
 const m=s.table.powerPhysiology.meridian;
 s.player.meridian.stage=3;
 s.player.meridian.gates=Array.from({length:35},(_,i)=>({
  number:i+1,band:'Lower',quality:'Sound'}));
 s.table.meridianGateTraining={gate:36,progress:0,forced:false};
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,{metMilestone:true}),/caller-supplied/);
 A.throws(()=>act(s,{}),/verified sequence of prior Gate openings.*transition rite/);
 A.equal(s.rngState,rng);A.equal(E.exportGame(s),before);
 // A structural transition is not unlocked by metMilestone:true or a
 // fabricated count. These matched fixture receipts isolate the DC check.
 m.gateRecords=s.player.meridian.gates.map(g=>({...g,day:0}));
 const seen=R.act(s,{system:'discipline',operation:'status',params:{}});
 A.equal(seen.systems.meridian.target,'Gate 36/108');
 A.equal(seen.systems.meridian.independentPracticeDC,16);
 A.equal(seen.systems.meridian.gatePractice.structuralTransition,true);
 let boundary=null;
 for(let i=0;i<10&&!boundary;i++){
  const result=act(s,{});
  A.equal(result.transition,true);
  A.equal(result.actualDC,16);
  A.equal(result.check.dc,16);
  boundary=result.opened;
 }
 A.ok(boundary,'the engine must be able to earn a structural transition from actual checks');
 A.equal(boundary.number,36);
 A.equal(s.table.powerPhysiology.meridian.transitions.length,1);
 A.equal(s.table.powerPhysiology.meridian.transitions[0].gate,36);
 A.equal(s.table.powerPhysiology.meridian.transitions[0].route,'independent');
 A.equal(s.player.meridian.gates.length,36);
 A.equal(s.table.powerPhysiology.meridian.gateRecords.length,36);
 const restored=E.importGame(E.exportGame(s));
 A.deepEqual(restored.table.powerPhysiology.meridian.transitions,
  s.table.powerPhysiology.meridian.transitions);
}
{
 // One real private file-backed turn combines power work + world ticks +
 // stored social world state, but cannot re-roll when the same ID is reused.
 const s=fresh(981102);R.world.advance(s,6);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gate-integration-'));
 try{
  const save=Path.join(dir,'checkpoint.json');
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const turn={id:'self_gate_981102',mode:'rule',
   system:'meridian',operation:'gatePractice',params:{route:'independent',force:false,minutes:180}};
  const executed=Turn.execute(save,turn);
  A.equal(executed.applied,true);
  A.equal(executed.output.rules.route,'independent');
  A.equal(executed.output.rules.tuitionTalons,0);
  const first=FS.readFileSync(save,'utf8');
  A.equal(Turn.execute(save,turn).duplicate,true);
  A.equal(FS.readFileSync(save,'utf8'),first);
  const reloaded=E.importGame(first);
  A.equal(reloaded.world.minutes,s.world.minutes+180);
  A.equal(reloaded.table.realm.independentContacts.origin,Contacts.ORIGIN);
  A.equal(Contacts.verify(reloaded.table.realm,
   reloaded.table.realm.independentContacts),true);
  const forged={...turn,id:'fake_gate_981102',
   params:{route:'independent',force:false,metMilestone:true}};
  A.throws(()=>Turn.execute(save,forged),/caller-supplied/);
  A.equal(FS.readFileSync(save,'utf8'),first);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Independent Meridian Gates use shared real practice context, independently rolled structural transitions, persist with living-world ticks, and reject player-selected proofs and duplicate chat turns');
