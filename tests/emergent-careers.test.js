'use strict';
// Independent career growth is caused by real work quality and aptitude,
// never elapsed months/years. All games here are disposable fixtures.
const A=require('node:assert/strict'),FS=require('node:fs'),
 Path=require('node:path'),OS=require('node:os'),
 E=require('../engine.js'),R=require('../rules'),
 Time=require('../rules/world'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),
 Career=require('../world/person-careers'),
 Turn=require('../scripts/chat-turn');
const fresh=seed=>E.newGame({seed,name:'Independent Career Work Test',path:'undecided'});
const social=(s,op,p={})=>R.act(s,{system:'social',operation:op,params:p});
const fixture=(seed=927101)=>{
 const s=fresh(seed),w=Realm.ensure(s);
 Time.advance(s,240);
 const people=Object.values(w.emergentPeople.people);
 A.ok(people.length>6);
 A.ok(people.every(p=>People.verify(w,p)));
 const workable=people.filter(p=>p.status==='active'&&p.fatigue<=75&&
  p.shift&&People.presence(w,p.actorId,p.shift.location,
   Math.floor(s.world.minutes/1440)));
 A.ok(workable.length,'genuine local workers must be independently present');
 return {s,w,people,workable};
};
function reach(s,site){
 if(s.world.location===site)return;
 const todo=[[s.world.location]],visited=new Set([s.world.location]);
 let path=null;
 while(todo.length){
  const x=todo.shift(),v=x.at(-1);
  if(v===site){path=x;break;}
  for(const dest of E.LOCATIONS[v].exits||[]){
   if(!visited.has(dest)){visited.add(dest);todo.push(x.concat(dest));}
  }
 }
 A.ok(path,'must reach work site through real connected travel');
 for(const dest of path.slice(1))A.equal(E.dispatch(s,'travel '+dest).ok,true);
}
{
 const {s,w,people}=fixture(), before=E.exportGame(s),rng=s.rngState;
 A.ok(people.some(p=>p.career.workCount>0),
  'genuine jobs can produce career evidence during independent world life');
 A.equal(Career._debug.initial(people[0]).workCount,0,
  'a newly emerging person begins with zero earned career work, regardless of their original profession');
 A.equal(Career._debug.initial(people[0]).competenceRank,0,
  'a job title itself is not a rank, even when the simulated person is generated later');
 for(const p of people){
  const c=p.career;
  A.ok(Career.verify(p));
  A.equal(c.origin,Career.ORIGIN);
  A.equal(c.source.personOriginHash,p.originHash);
  A.equal(c.aptitude,Career._debug.innate(p));
  A.equal(c.recognizedLicence,null);
  A.deepEqual(c.supernaturalSystemRanks,{});
  A.deepEqual(c.knownTechniques,[]);
  A.deepEqual(p.practicedDisciplines,[]);
  A.equal(p.family,null);A.equal(p.ancestry,null);
  A.equal(p.inheritance,null);
  A.equal(c.competenceRank,c.promotions.length);
  A.equal(c.workCount>=c.successes,true);
  A.equal(c.workReceipts.every(x=>x.sourceHash===Career._debug.hash(x.source)),true);
 }
 A.deepEqual(social(s,'witnessedPersonWorkStatus').personallyWitnessedWork,[]);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng,
  'read-only witness status must not roll personal or player dice');
 const unseen=people.find(p=>p.shift&&p.shift.location!==s.world.location);
 if(unseen){
  A.throws(()=>social(s,'observeLocalPersonWork',
   {npcId:unseen.actorId}),/actually present|locally present/);
  A.equal(E.exportGame(s),before,
   'a remote person must not be summoned by naming their role or ID');
 }
}
{
 const {s,w,people}=fixture(927102);
 const original=E.exportGame(s),copy=E.importGame(original);
 Time.advance(s,90);Time.advance(copy,90);
 A.deepEqual(s.table.realm.emergentPeople,copy.table.realm.emergentPeople,
  'autonomous professional decisions must replay exactly after saved checkpoint');
 A.equal(s.rngState,copy.rngState);
 A.equal(s.player.skills.crafting.rank,0);
 const participants=Object.values(s.table.realm.emergentPeople.people)
  .filter(p=>p.career?.workCount>1);
 A.ok(participants.length>0);
 for(const p of participants){
  A.ok(p.career.workReceipts.length>=1);
  A.ok(p.career.workReceipts.every(x=>x.source.context==='independent-duty'));
  A.ok(p.career.workReceipts.every(x=>x.source.day>=p.birthSource.day));
 }
}
{
 const {s,w,workable}=fixture(927103);
 const person=workable[0];
 reach(s,person.shift.location);
 const initial=social(s,'witnessedPersonWorkStatus').personallyWitnessedWork;
 A.deepEqual(initial,[]);
 A.throws(()=>social(s,'observeLocalPersonWork',
  {npcId:person.actorId,success:true,mastery:5}),/cannot choose rank/);
 A.equal(social(s,'witnessedPersonWorkStatus').personallyWitnessedWork.length,0);
 const playerRng=s.rngState,position=s.world.location,started=s.world.minutes;
 const observed=social(s,'observeLocalPersonWork',{npcId:person.actorId});
 A.equal(observed.witnessed,true);
 A.equal(observed.npcId,person.actorId);
 A.equal(observed.doesNotRevealPrivateRank,true);
 A.equal(observed.noFreeTeaching,true);
 A.equal(s.world.location,position);
 A.equal(s.world.minutes,started+observed.minutes);
 A.equal(s.rngState,playerRng,'witnessed work uses the worker personal RNG only');
 A.equal('privateCompetenceRank' in observed,false);
 A.equal('aptitude' in observed,false);
 A.equal('skillPoints' in observed,false);
 A.equal('supernaturalSystemRanks' in observed,false);
 A.equal(observed.observed.noInferredFormalRank,true);
 A.ok(Career.verify(person));
 const historic=social(s,'witnessedPersonWorkStatus').personallyWitnessedWork;
 A.equal(historic.length,1);A.equal(historic[0].npcId,person.actorId);
 A.equal(historic[0].site,position);
 A.deepEqual(historic[0].observed,observed.observed);
 const frozen=E.exportGame(s),now=s.rngState;
 A.deepEqual(social(s,'witnessedPersonWorkStatus'),social(s,'witnessedPersonWorkStatus'));
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,now);
 A.throws(()=>social(s,'witnessedPersonWorkStatus',{revealHiddenRank:true}),
  /read-only/);
 A.equal(E.exportGame(s),frozen);
 const reloaded=E.importGame(frozen);
 A.deepEqual(social(reloaded,'witnessedPersonWorkStatus'),
  social(s,'witnessedPersonWorkStatus'));
}
{
 const {s,w,people}=fixture(927104),active=people.find(p=>
  p.status==='active'&&p.fatigue<70);
 A.ok(active);
 const native=s.rngState;
 const original=E.exportGame(s),copy=E.importGame(original);
 let matched,identical=false;
 for(let i=0;i<12;i++){
  const p=s.table.realm.emergentPeople.people[active.id],
   clone=copy.table.realm.emergentPeople.people[active.id];
  const a=Career.work(s.table.realm,p,Math.floor(s.world.minutes/1440),
   'independent-duty');
  const b=Career.work(copy.table.realm,clone,Math.floor(copy.world.minutes/1440),
   'independent-duty');
  A.deepEqual(a,b);
  A.deepEqual(p.career,clone.career);
  A.equal(p.career.workCount>=1,true);
  A.equal(p.career.recognizedLicence,null);
  A.equal(p.career.knownTechniques.length,0);
  A.ok(Career.verify(p));
  matched=a;
  if(a.success)identical=true;
 }
 A.ok(matched);
 A.equal(s.rngState,native,'independent careers cannot consume the player RNG');
 A.equal(identical,true,'there are genuinely successful work opportunities');
 A.equal(s.table.realm.emergentPeople.people[active.id].career.aptitude,
  copy.table.realm.emergentPeople.people[active.id].career.aptitude);
 const ref=s.table.realm.emergentPeople.people[active.id];
 const prior=ref.career.competenceRank,old=ref.career.skillPoints;
 // A purely idle world date change cannot directly manufacture skill.
 s.world.minutes+=1440*400;
 A.equal(ref.career.competenceRank,prior);
 A.equal(ref.career.skillPoints,old);
 // Tampering with an independent worker's rank or ancestry creates no
 // player-facing legitimate accreditation.
 ref.career.competenceRank=5;
 A.equal(Career.verify(ref),false);
}
{
 const {s,workable}=fixture(927105),p=workable[0];
 reach(s,p.shift.location);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-career-witness-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const base=FS.readFileSync(file,'utf8');
  const read={id:'civilian_work_memory_0001',mode:'rule',
   system:'social',operation:'witnessedPersonWorkStatus',params:{}};
  A.equal(Turn.execute(file,read).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),base);
  const observe={id:'independent_person_work_0001',mode:'rule',
   system:'social',operation:'observeLocalPersonWork',
   params:{npcId:p.actorId}};
  const outcome=Turn.execute(file,observe);
  A.equal(outcome.applied,true);
  A.equal(outcome.output.rules.witnessed,true);
  A.equal(Turn.execute(file,observe).duplicate,true);
  const loaded=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(loaded.table.personWorkWitnesses.records.length,1);
  A.equal(loaded.world.minutes,s.world.minutes+outcome.output.rules.minutes);
  A.equal(Career.verify(loaded.table.realm.emergentPeople.people[p.id]),true);
  const frozen=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...observe,id:'forged_profession_0001',
   params:{npcId:p.actorId,rank:5,spell:'World Circuit'}}),
   /cannot choose rank/);
  A.equal(FS.readFileSync(file,'utf8'),frozen);
  const memory=Turn.execute(file,{...read,id:'work_memory_0002'});
  A.equal(memory.applied,false);
  A.equal(memory.output.rules.personallyWitnessedWork.length,1);
  A.equal(FS.readFileSync(file,'utf8'),frozen);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

// A genuine local person's acceptance belongs to their own RNG; both refusal
// and cooperation are source-bound, not a player-selected NPC roll or wage.
function willAcceptAssistance(p){
 const clone={rngState:p.rngState},chance=People._debug.draw(clone);
 const max=p.personality==='independent'?.51:
   p.personality==='reserved'?.58:.74;
 return p.fatigue<=75&&chance<max;
}
{
 const s=fresh(927109),before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>social(s,'assistLocalPersonWork',{
  npcId:'emergent:person_9999'}),/active, individually present/);
 A.throws(()=>social(s,'assistLocalPersonWork',{
  npcId:'emergent:person_9999',pay:10000,success:true}),/never consent, pay, skill, DC or outcome/);
 A.deepEqual(social(s,'assistedWorkStatus').personallyAssistedWork,[]);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const {s,w,workable}=fixture(927110);
 const p=workable.find(willAcceptAssistance);
 A.ok(p,'a real individual voluntarily accepts practical help');
 reach(s,p.shift.location);
 const start=s.world.minutes,sta=s.player.stamina,coins=s.player.coins,
  individualRng=p.rngState,playerRng=s.rngState,
  originalWork=p.career.workCount,early=E.exportGame(s);
 A.throws(()=>social(s,'assistLocalPersonWork',{
  npcId:p.actorId,skill:'crafting',wage:120,agree:true}),/never consent, pay, skill, DC or outcome/);
 A.equal(E.exportGame(s),early);
 const result=social(s,'assistLocalPersonWork',{npcId:p.actorId});
 A.equal(result.asked,true);A.equal(result.agreed,true);
 A.equal(result.minutes,40);
 A.ok(['survival','diplomacy','crafting'].includes(result.skill));
 A.ok(result.check.roll>=1&&result.check.roll<=20);
 A.equal(result.assistanceBonus,
  result.check.success?
    (['strong','exceptional'].includes(result.check.degree)?2:1):0);
 A.equal(s.world.minutes,start+40);A.equal(s.player.stamina,sta-4);
 A.equal(s.player.coins,coins,'No money is invented without a binding employment agreement');
 A.notEqual(s.rngState,playerRng,'Only a genuine earned player skill check consumes player RNG');
 A.notEqual(p.rngState,individualRng,'Independent person continues their own career');
 A.equal(p.career.workCount,originalWork+1);
 A.equal(p.career.workReceipts.at(-1).source.context,'locally-assisted-duty');
 A.equal(p.career.workReceipts.at(-1).source.assistance.support,result.assistanceBonus);
 A.equal(p.career.workReceipts.at(-1).sourceHash,
  Career._debug.hash(p.career.workReceipts.at(-1).source));
 A.equal(Career.verify(p),true);
 A.ok(result.practice.ppAwarded>=1);
 A.equal(result.practice.practiceSkill,result.skill);
 A.equal(result.observed.noInferredFormalRank,true);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.table.localWorkAssistance.records.length,1);
 A.equal(s.table.localWorkAssistance.records[0].independentWorkHash,
  p.career.workReceipts.at(-1).sourceHash);
 const status=social(s,'assistedWorkStatus');
 A.equal(status.personallyAssistedWork.length,1);
 A.equal(status.personallyAssistedWork[0].npcId,p.actorId);
 A.ok(!JSON.stringify(status.personallyAssistedWork).includes('aptitude'));
 A.ok(!JSON.stringify(status.personallyAssistedWork).includes('competenceRank'));
 const frozen=E.exportGame(s),afterRng=s.rngState;
 A.throws(()=>social(s,'assistLocalPersonWork',{npcId:p.actorId}),/same task and shift/);
 A.throws(()=>social(s,'assistedWorkStatus',{privateRank:true}),/read-only/);
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,afterRng);
 A.deepEqual(social(E.importGame(frozen),'assistedWorkStatus'),status);
}
{
 const {s,w,workable}=fixture(927111);
 const p=workable.find(x=>!willAcceptAssistance(x));
 A.ok(p,'a real worker can independently refuse unwanted help');
 reach(s,p.shift.location);
 const beforeRng=s.rngState,sta=s.player.stamina,coins=s.player.coins,
  careerCount=p.career.workCount,start=s.world.minutes;
 const out=social(s,'assistLocalPersonWork',{npcId:p.actorId});
 A.equal(out.asked,true);A.equal(out.agreed,false);
 A.equal(out.minutes,5);A.equal(out.check,null);
 A.equal(out.practice,null);
 A.equal(s.world.minutes,start+5);
 A.equal(s.player.stamina,sta);
 A.equal(s.player.coins,coins);
 A.equal(s.rngState,beforeRng,'Declined assistance cannot consume the player RNG');
 A.equal(p.career.workCount,careerCount);
 A.equal(social(s,'assistedWorkStatus').personallyAssistedWork[0].agreed,false);
 A.throws(()=>social(s,'assistLocalPersonWork',{npcId:p.actorId}),/same task and shift/);
}
{
 const {s,workable}=fixture(927112);
 const p=workable.find(willAcceptAssistance);
 A.ok(p);
 reach(s,p.shift.location);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-civilian-cooperation-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const bad={id:'civilian_work_forged_001',mode:'rule',system:'social',
   operation:'assistLocalPersonWork',params:{npcId:p.actorId,bonus:99}};
  A.throws(()=>Turn.execute(file,bad),/never consent, pay, skill, DC or outcome/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const request={id:'civilian_work_earned_001',mode:'act',
   action:'help '+p.name+' with work'};
  const r=Turn.execute(file,request);
  A.equal(r.applied,true);
  A.equal(r.output.work.agreed,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const saved=FS.readFileSync(file,'utf8'),next=E.importGame(saved);
  A.equal(next.world.minutes,s.world.minutes+40);
  A.equal(next.table.localWorkAssistance.records.length,1);
  A.ok(Career.verify(next.table.realm.emergentPeople.people[p.id]));
  const read={id:'civilian_work_record_001',mode:'rule',system:'social',
   operation:'assistedWorkStatus',params:{}};
  const view=Turn.execute(file,read);
  A.equal(view.applied,false);
  A.equal(view.output.rules.personallyAssistedWork.length,1);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{force:true,recursive:true});}
}


// Source-witnessed work offers are deliberately independent of ordinary
// help: one witnessed invitation, a free personal decision, a real actual
// shift and an optional later work exchange. No choice of wages or consent.
{
 const {s,workable}=fixture(927110),p=workable.find(willAcceptAssistance);
 A.ok(p);reach(s,p.shift.location);
 const initial=E.exportGame(s),coins=s.player.coins,rng=s.rngState;
 const proposal='Help maintain local supplies and carry out practical environmental work together';
 A.throws(()=>social(s,'proposeLocalWork',{
  npcId:p.actorId,purpose:proposal,offeredWage:500,accept:true}),/not a chosen response or wage/);
 A.equal(E.exportGame(s),initial);
 const offer=social(s,'proposeLocalWork',{npcId:p.actorId,purpose:proposal});
 A.equal(offer.offered,true);A.equal(offer.accepted,true);
 A.equal(offer.minutes,8);A.equal(s.player.coins,coins);
 A.equal(s.rngState,rng,'NPC decisions cannot consume the player RNG');
 A.equal(offer.state,'accepted');
 const status=social(s,'localWorkOffersStatus');
 A.equal(status.knownWorkOffers.length,1);
 A.equal(status.knownWorkOffers[0].offerId,offer.offerId);
 A.equal(status.knownWorkOffers[0].state,'accepted');
 A.ok(!JSON.stringify(status.knownWorkOffers).includes('competenceRank'));
 A.ok(!JSON.stringify(status.knownWorkOffers).includes('aptitude'));
 const frozen=E.exportGame(s),rng2=s.rngState;
 A.throws(()=>social(s,'proposeLocalWork',{npcId:p.actorId,purpose:proposal}),
  /accepted unfinished|already considered/);
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,rng2);
 const start=s.world.minutes,stamina=s.player.stamina;
 const work=social(s,'assistLocalPersonWork',
  {npcId:p.actorId,offerId:offer.offerId});
 A.equal(work.asked,true);A.equal(work.agreed,true);
 A.equal(work.offerId,offer.offerId);
 A.equal(work.agreementHonoured,true);
 A.equal(s.world.minutes,start+40);
 A.equal(s.player.stamina,stamina-4);
 A.equal(s.player.coins,coins);
 const record=s.table.localWorkProposals.records[offer.offerId];
 A.equal(record.state,'completed');
 A.equal(record.workReceiptHash,p.career.workReceipts.at(-1).sourceHash);
 A.equal(record.fulfilledAtMinute,s.world.minutes);
 A.equal(social(s,'localWorkOffersStatus').knownWorkOffers[0].state,'completed');
 const saved=E.exportGame(s),after=s.rngState;
 A.throws(()=>social(s,'assistLocalPersonWork',
  {npcId:p.actorId,offerId:offer.offerId}),/same task and shift|still-accepted/);
 A.throws(()=>social(s,'withdrawLocalWork',{offerId:offer.offerId}),
  /unfulfilled/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,after);
 A.deepEqual(social(E.importGame(saved),'localWorkOffersStatus'),
  social(s,'localWorkOffersStatus'));
}
{
 const {s,workable}=fixture(927111),p=workable.find(x=>!willAcceptAssistance(x));
 A.ok(p);reach(s,p.shift.location);
 const playerRng=s.rngState,sta=s.player.stamina;
 const out=social(s,'proposeLocalWork',{npcId:p.actorId,
  purpose:'Assist with public service work and prepare suitable supplies'});
 A.equal(out.accepted,false);A.equal(out.state,'declined');
 A.equal(out.minutes,8);A.equal(s.rngState,playerRng);
 A.equal(s.player.stamina,sta);
 const state=E.exportGame(s),rng=s.rngState;
 A.throws(()=>social(s,'proposeLocalWork',{npcId:p.actorId,
  purpose:'Assist with public service work and prepare suitable supplies'}),
  /same unchanged proposal/);
 A.equal(E.exportGame(s),state);A.equal(s.rngState,rng);
 A.throws(()=>social(s,'assistLocalPersonWork',{
  npcId:p.actorId,offerId:out.offerId}),/still-accepted/);
 A.throws(()=>social(s,'withdrawLocalWork',{offerId:out.offerId}),/unfulfilled/);
 A.equal(E.exportGame(s),state);A.equal(s.rngState,rng);
 const revised=social(s,'proposeLocalWork',{npcId:p.actorId,
  purpose:'Help restore damaged habitat edges rather than previous public supplies'});
 A.equal(revised.offered,true);
 A.notEqual(revised.offerId,out.offerId);
 A.equal(s.rngState,rng,'NPC independently considers revised terms without player dice');
}
{
 const {s,workable}=fixture(927110),p=workable.find(willAcceptAssistance);
 reach(s,p.shift.location);
 const offer=social(s,'proposeLocalWork',{npcId:p.actorId,
  purpose:'Help check actual local resources while preserving the worker’s choice to stop'});
 A.equal(offer.accepted,true);
 const out=social(s,'withdrawLocalWork',{offerId:offer.offerId});
 A.equal(out.withdrawn,true);
 A.equal(s.table.localWorkProposals.records[offer.offerId].state,'withdrawn');
 A.equal(social(s,'localWorkOffersStatus').knownWorkOffers[0].state,'withdrawn');
 A.throws(()=>social(s,'assistLocalPersonWork',{
  npcId:p.actorId,offerId:offer.offerId}),/still-accepted/);
}
{
 const {s,workable}=fixture(927112),p=workable.find(willAcceptAssistance);
 A.ok(p);reach(s,p.shift.location);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-civilian-work-offers-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const base=FS.readFileSync(file,'utf8');
  const bad={id:'offer_forged_0001',mode:'rule',system:'social',
   operation:'proposeLocalWork',params:{npcId:p.actorId,
    purpose:'Help with local practical work',accepted:true}};
  A.throws(()=>Turn.execute(file,bad),/not a chosen response or wage/);
  A.equal(FS.readFileSync(file,'utf8'),base);
  const offerReq={id:'offer_real_0001',mode:'act',
   action:'offer to help '+p.name+' with suitable local practical work'};
  const first=Turn.execute(file,offerReq);
  A.equal(first.applied,true);
  A.equal(first.output.work.accepted,true);
  A.equal(Turn.execute(file,offerReq).duplicate,true);
  const afterOffer=FS.readFileSync(file,'utf8');
  const inGame=E.importGame(afterOffer);
  A.equal(inGame.table.localWorkProposals.records[first.output.work.offerId].state,'accepted');
  const workReq={id:'offer_work_0001',mode:'act',
   action:'do agreed work with '+p.name};
  const work=Turn.execute(file,workReq);
  A.equal(work.applied,true);A.equal(work.output.work.agreed,true);
  A.equal(work.output.work.offerId,first.output.work.offerId);
  A.equal(Turn.execute(file,workReq).duplicate,true);
  const saved=FS.readFileSync(file,'utf8'),loaded=E.importGame(saved);
  A.equal(loaded.table.localWorkProposals.records[first.output.work.offerId].state,'completed');
  A.ok(Career.verify(loaded.table.realm.emergentPeople.people[p.id]));
  const read={id:'offer_status_0001',mode:'rule',system:'social',
   operation:'localWorkOffersStatus',params:{}};
  const status=Turn.execute(file,read);
  A.equal(status.applied,false);
  A.equal(status.output.rules.knownWorkOffers[0].state,'completed');
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}


// An offer at the end of the working day cannot silently claim enough time
// to fulfil a 40-minute task. An invalid old witness cannot compel labour.
{
 const {s,workable}=fixture(927110),p=workable.find(willAcceptAssistance);
 A.ok(p);reach(s,p.shift.location);
 const original=s.world.minutes,remaining=17*60+13-(original%1440);
 A.ok(remaining>0);
 E.advance(s,remaining);
 require('../rules/world').finalizeTime(s,original);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>social(s,'proposeLocalWork',{npcId:p.actorId,
  purpose:'Work together on practical provisions during the current shift'}),
  /enough actual time/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const {s,workable}=fixture(927110),p=workable.find(willAcceptAssistance);
 A.ok(p);reach(s,p.shift.location);
 const o=social(s,'proposeLocalWork',{npcId:p.actorId,
  purpose:'Help with source-verified everyday community maintenance'});
 A.equal(o.accepted,true);
 s.table.localWorkProposals.records[o.offerId].eventHash='0'.repeat(64);
 const saved=E.exportGame(s),rng=s.rngState;
 A.throws(()=>social(s,'assistLocalPersonWork',
  {npcId:p.actorId,offerId:o.offerId}),/original independent acceptance witness/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
}

console.log('Independent people learn only from real individually resolved work, not time ticks, while personal observation respects consent, location, privacy, save replay and nonmagical limits');
