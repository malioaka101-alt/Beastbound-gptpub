'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
function realObservedFox(){
 // Search disposable independent engine seeds, never hand-create a species,
 // rewrite an encounter, choose an observation roll, or patch a campaign.
 for(let seed=51001;seed<51201;seed++){
  const s=E.newGame({name:'Independent First Contact',seed});
  A.equal(E.dispatch(s,'travel fen').ok,true);
  A.equal(E.dispatch(s,'explore').ok,true);
  const id=s.encounter?.beastId,b=s.beasts[id];
  if(b?.species!=='fenfox'||s.encounter.threat===true)continue;
  const original=s.log.find(e=>e.type==='encounter'&&e.details?.beastId===id);
  A.ok(original,'Real explore event must retain actual individual identity');
  A.equal(original.details.species,'fenfox');
  const observed=R.act(s,{system:'world',operation:'observe',params:{}});
  if(observed.identified)return {s,id};
 }
 throw Error('No eligible naturally generated and identified fenfox seed found');
}
{
 const s=E.newGame({name:'No Fictitious Contact',seed:51998});
 const raw=E.exportGame(s),rng=s.rngState;
 A.throws(()=>R.act(s,{system:'bond',operation:'encounterRegister',
  params:{beastId:'fake_beast'}}),/actually encountered local unevolved/);
 A.throws(()=>R.act(s,{system:'bond',operation:'encounterRegister',
  params:{beastId:'fake_beast',sapience:5,trust:100}}),/accepts only an existing beastId/);
 A.equal(E.exportGame(s),raw);A.equal(s.rngState,rng);
}
{
 const {s,id}=realObservedFox(),prior=s.rngState;
 const before=E.exportGame(s);
 // The actual animal's cognitive type is bounded provisionally; no claim of
 // Grade, partnership, trust or consent is made by the identification roll.
 const first=R.act(s,{system:'bond',operation:'encounterRegister',params:{beastId:id}});
 A.equal(first.recorded,true);
 A.equal(first.provisionalSapience,1);
 A.equal(first.trustAwarded,0);
 A.equal(first.contractCreated,false);
 A.equal(s.beasts[id].sapience,1);
 A.equal(s.beasts[id].sapienceAssessment.provisional,true);
 A.equal(s.rngState,prior);
 const bond=R.bonds.fromSave(s,id);
 A.equal(bond.trust,0);A.equal(bond.willingness,0);
 A.equal(bond.contract,null);
 A.equal(s.player.partnerIds.includes(id),false);
 A.throws(()=>R.act(s,{system:'bond',operation:'encounterRegister',
  params:{beastId:id}}),/already has a recorded relationship/);
 A.notEqual(E.exportGame(s),before);
 const record=E.exportGame(s),rng=s.rngState;
 A.throws(()=>R.act(s,{system:'bond',operation:'encounterRegister',
  params:{beastId:id,grade:9}}),/accepts only an existing beastId/);
 A.equal(E.exportGame(s),record);A.equal(s.rngState,rng);
}
{
 const {s,id}=realObservedFox();
 // A fabricated roll hash is not independently witnessed evidence.
 s.table.wildlifeObservationEvidence[id].rollEventHash='forged';
 const prior=E.exportGame(s),rng=s.rngState;
 A.throws(()=>R.act(s,{system:'bond',operation:'encounterRegister',
  params:{beastId:id}}),/original species observation die/);
 A.equal(E.exportGame(s),prior);A.equal(s.rngState,rng);
}
{
 const {s,id}=realObservedFox(),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-first-contact-'));
 try{
  const file=Path.join(dir,'save.json');FS.writeFileSync(file,E.exportGame(s)+'\n');
  const saved=FS.readFileSync(file,'utf8'),old=E.importGame(saved);
  const forge={id:'contact_fake_00001',mode:'rule',system:'bond',
   operation:'encounterRegister',params:{beastId:id,source:'I saw a friendly dragon'}};
  A.throws(()=>Turn.execute(file,forge),/accepts only an existing beastId/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  const req={id:'contact_real_00001',mode:'rule',system:'bond',
   operation:'encounterRegister',params:{beastId:id}};
  const registration=Turn.execute(file,req);
  A.equal(registration.applied,true);
  A.equal(registration.output.rules.trustAwarded,0);
  A.equal(Turn.execute(file,req).duplicate,true);
  const now=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(now.player.partnerIds.length,old.player.partnerIds.length);
  A.equal(now.table.bondRecords[id].trust,0);
  const start=now.world.minutes;
  const approach={id:'contact_gentle_00001',mode:'act',action:'approach slowly'};
  const response=Turn.execute(file,approach);
  A.equal(response.applied,true);
  A.equal(response.output.bond.approach,'gentle');
  A.equal(response.output.bond.elapsedMinutes,15);
  A.equal(Turn.execute(file,approach).duplicate,true);
  const after=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(after.world.minutes,start+15);
  A.equal(after.player.partnerIds.length,old.player.partnerIds.length);
  A.equal(after.table.bondRecords[id].trust,0);
  if(response.output.bond.accepted){
   const evidenceId=response.output.bond.evidenceId;
   A.equal(after.table.bondEvidence[evidenceId].kind,'event');
   A.equal(after.table.bondEvidence[evidenceId].used,undefined);
  }else A.equal(response.output.bond.evidenceId,null);
  const post=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'contact_reroll_00001',
   mode:'act',action:'approach'}),/already attempted/);
  A.equal(FS.readFileSync(file,'utf8'),post);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Real local fenfox observation can establish neutral first contact and one voluntary natural approach');
