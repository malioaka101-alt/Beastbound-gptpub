'use strict';
// Original living person + independently consenting member + bounded role
// -> one actually witnessed independent career check at a real GM place.
// The source-link itself grants no wages, salary, facilities or career XP.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),R=require('../rules'),
 New=require('../scripts/new-campaign'),Opening=require('../scripts/gm-campaign-opening'),
 Places=require('../world/lived-places'),People=require('../world/emergent-people'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency'),
 Careers=require('../world/person-careers'),Turn=require('../scripts/chat-turn');
const s=New.create({seed:927422,slug:'original_role_professional_service_test',
 mode:'guided',homeRegion:'morrowfen_basin',age:25}).state;
const siteId='willow_canal_hall',scene=
 'Talia Meadow is beside the long table at Willow Canal Hall, recording river levels and checking an old crossing chart while the player watches.';
Opening.apply(s,{place:{placeId:siteId,name:'Willow Canal Hall',
 regionId:s.campaign.origin.birthRegionId,
 description:'A real riverside shared hall with a sturdy weatherproof roof, a wooden table and an ordinary public-facing entrance.',
 kind:'local riverside gathering hall',sceneType:'settlement',
 culture:'Neighbours may study river levels here, but their discussions confer no exclusive site ownership or teaching licence.'},
 scene,focus:'Work and independent association duties',
 weather:'Cool river mist',hour:10,minute:0});
const act=(state,operation,params={})=>R.act(state,{system:'social',operation,params});
const npc=act(s,'introduceWitnessedPerson',{
 name:'Talia Meadow',profession:'Independent canal surveyor',
 purpose:'Maintain accurate on-site records of river and canal observations through independently chosen practical work.',
 personality:'Patient, observant and willing to refuse inappropriate claims.',
 background:'A travelling practitioner of ordinary surveys who values independent work and may volunteer alongside neighbours without signing employment.',
 witness:'Talia Meadow was witnessed working with real riverside records on the long table in the GM-authored hall.'});
const duty=act(s,'authorWitnessedPersonDuty',{npcId:npc.npcId,
 id:'willow_canal_record_duty',role:'Independent riverside surveyor',
 method:'canal-survey',domain:'trade',
 goal:'Gather accurate practical notes about local canal conditions',
 witness:'Talia Meadow is beside the long table at Willow Canal Hall, recording river levels and checking an old crossing chart'});
A.equal(duty.available,true);
A.equal(duty.noCompletedWork,true);
const formed=act(s,'formGroup',{name:'Willow Channel Note Circle',
 kind:'informal voluntary survey study group',
 purpose:'Maintain original observed canal notes while accepting only independent member agreement and earning any practical result.'});
const groupId=formed.id,w=s.table.realm,group=G.lookup(w,groupId);
A.ok(group);
const minAgency=(()=>{
 for(let i=1;i<100000;i++){const t={rngState:i};if(Agency.draw(t)<.015)return i;}
 throw Error('No valid original acceptance fixture');
})();
Agency.ensure(w).rngState=minAgency;
const invite=act(s,'inviteGroupMember',{groupId,npcId:npc.npcId,
 proposal:'Will you independently join this voluntary riverside group and remain free to work or refuse without a paid contract?'});
A.equal(invite.joined,true);
Agency.ensure(w).rngState=minAgency;
const role=act(s,'offerGroupResponsibility',{groupId,npcId:npc.npcId,
 title:'Voluntary water records steward',
 scope:'Make independently observed crossing measurements available to willing group participants without promising any formal research credit or compulsory instruction.',
 untilDay:4});
A.equal(role.agreed,true);
const roleId=role.id;
A.equal(G.validate(group,w),true);
A.equal((group.roleWork||[]).length,0);
const initial=act(s,'groupRoleWorkStatus',{groupId});
A.equal(initial.witnessedRoleWork.length,0);
const p=w.emergentPeople.people[npc.npcId.slice('emergent:'.length)];
const lowWork=(()=>{
 for(let i=1;i<100000;i++){const t={rngState:i};if(People._debug.draw(t)<.012)return i;}
 throw Error('No valid original independent worker draw fixture');
})();
p.rngState=lowWork;
A.equal(People.verify(w,p),true);
const baseline=E.exportGame(s),timeBefore=s.world.minutes,coins=s.player.coins,
 playerRng=s.rngState,originalPersonWork=p.career.workCount,
 originalMoney=group.funds,originalAgency=Agency.ensure(w).rngState;
A.throws(()=>act(s,'observeGroupRoleWork',{groupId,roleId:'invented_role',
 npcId:npc.npcId}),/freely accepted|genuinely present/);
A.throws(()=>act(s,'observeGroupRoleWork',{groupId,roleId,
 npcId:'emergent:nonexistent'}),/freely accepted|genuinely present/);
A.equal(s.world.minutes,timeBefore);
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-original-role-work-'));
try{
 const file=Path.join(tmp,'campaign.json');
 FS.writeFileSync(file,baseline+'\n');
 const request={id:'role_work_original_927422',mode:'rule',system:'social',
  operation:'observeGroupRoleWork',params:{groupId,roleId,npcId:npc.npcId}};
 const output=Turn.execute(file,request);
 A.equal(output.ok,true);
 A.equal(output.applied,true);
 A.equal(output.output.rules.roleWorkRecorded,true);
 A.equal(output.output.rules.freelyAgreed,true);
 A.equal(output.output.rules.noAdditionalRollOrTime,true);
 A.equal(output.output.rules.minutes,30);
 const saved=FS.readFileSync(file,'utf8'),reloaded=E.importGame(saved),
  rw=reloaded.table.realm,re=G.lookup(rw,groupId),
  person=rw.emergentPeople.people[p.id];
 A.ok(re&&re.roleWork?.length===1);
 const row=re.roleWork[0],q=row.source;
 A.equal(reloaded.world.minutes,timeBefore+30);
 A.equal(reloaded.player.coins,coins);
 A.equal(reloaded.rngState,playerRng);
 A.equal(re.funds,originalMoney);
 A.equal(Agency.ensure(rw).rngState,originalAgency);
 A.equal(person.career.workCount,originalPersonWork+1);
 A.equal(person.career.workReceipts.length,1);
 A.equal(q.originalCareerReceipt.sourceHash,
  person.career.workReceipts[0].sourceHash);
 A.equal(q.workReceiptHash,q.originalEvent.details.localWorkSourceHash);
 A.equal(q.originalShift.hash,q.originalEvent.details.presenceHash);
 A.equal(q.originalRoleHash,re.internalRoles[0].sourceHash);
 A.equal(q.originalCareerReceipt.source.task.authoredDutyId,duty.id);
 A.equal(q.location,siteId);
 A.equal(q.originalRoleHash,re.internalRoles[0].sourceHash);
 A.equal(Careers.verify(person),true);
 A.equal(G.verifyRoleWork(re,row,rw),true);
 A.equal(G.validate(re,rw),true);
 A.equal(q.noExtraCareerProgress,true);
 A.equal(q.noGroupPayrollOrProperty,true);
 A.equal(q.noAutomaticRoleCompletion,true);
 const view=act(reloaded,'groupRoleWorkStatus',{groupId,roleId});
 A.equal(view.witnessedRoleWork.length,1);
 A.equal(view.witnessedRoleWork[0].originalWorkHash,row.workReceiptHash);
 A.equal(view.witnessedRoleWork[0].observed.work,'canal-survey');
 A.equal(view.witnessedRoleWork[0].noAutomaticTrainingOrEmployment,true);
 A.equal(view.witnessedRoleWork[0].noProofOfSpecificRoleCompletion,true);
 A.equal(Turn.execute(file,request).duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),saved,
  'Exact replay must not decide to work a second time');
 const readReq={id:'role_work_status_927422',mode:'rule',
  system:'social',operation:'groupRoleWorkStatus',params:{groupId,roleId}};
 const viewReq=Turn.execute(file,readReq);
 A.equal(viewReq.ok,true);
 A.equal(viewReq.applied,false);
 A.equal(viewReq.output.rules.witnessedRoleWork.length,1);
 A.equal(FS.readFileSync(file,'utf8'),saved,
  'Viewing original member work must not advance time or change the save');
 // The original short personal witnessed-work journal can rotate without
 // manufacturing another career action or losing the stored source.
 const pruned=E.importGame(saved);
 pruned.table.personWorkWitnesses.records=[];
 A.equal(G.validate(G.lookup(pruned.table.realm,groupId),pruned.table.realm),true);
 A.equal(G.roleWorkStatus(pruned.table.realm,groupId).witnessedRoleWork.length,1);
 for(const kind of ['role','event','shift','receipt','duty','place']){
  const altered=E.importGame(saved),aw=altered.table.realm,
   ag=aw.emergentGroups.entries[groupId],ar=ag.roleWork[0];
  if(kind==='role')ag.internalRoles[0].source.scope='False role';
  if(kind==='event')ar.source.originalEvent.details.freelyAgreed=false;
  if(kind==='shift')ar.source.originalShift.location='fake-site';
  if(kind==='receipt')ar.source.originalCareerReceipt.source.roll=20;
  if(kind==='duty')aw.emergentPeople.people[p.id].career.authoredDuties[0].workProofHashes=[];
  if(kind==='place')aw.livedPlaces.places[siteId].foundingHash='f'.repeat(64);
  A.equal(G.validate(ag,aw),false,kind+' original-source tampering must invalidate role service');
  A.equal(G.lookup(aw,groupId),null);
 }
 // Refusal consumes exactly the original eight-minute observation scene
 // but leaves the group and career with no new work or invented role service.
 const declined=E.importGame(baseline),dp=declined.table.realm.emergentPeople.people[p.id];
 dp.fatigue=90;
 A.equal(People.verify(declined.table.realm,dp),true);
 const dayBefore=declined.world.minutes,counts=dp.career.workCount;
 const refusal=act(declined,'observeGroupRoleWork',{groupId,roleId,npcId:npc.npcId});
 A.equal(refusal.freelyAgreed,false);
 A.equal(refusal.roleWorkRecorded,false);
 A.equal(refusal.minutes,8);
 A.equal(declined.world.minutes,dayBefore+8);
 A.equal(dp.career.workCount,counts);
 A.equal((G.lookup(declined.table.realm,groupId).roleWork||[]).length,0);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
console.log('One original independent professional check during genuinely agreed GM-site group role; refusal, sourced history, save/replay, original RNG/funds, immutable proof and strict private read-only status.');
