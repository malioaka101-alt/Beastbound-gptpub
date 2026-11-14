'use strict';
// A successful, independent GM-site educational duty may support exactly one
// player's ORIGINAL professional practice check. No additional NPC work roll.
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules'),
 New=require('../scripts/new-campaign'),Opening=require('../scripts/gm-campaign-opening'),
 People=require('../world/emergent-people'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency');
const s=New.create({seed:927522,slug:'gm_site_original_study_test',
 mode:'guided',homeRegion:'morrowfen_basin',age:25}).state;
const siteId='reedbank_learning_hall';
Opening.apply(s,{place:{placeId:siteId,name:'Reedbank Learning Hall',
 regionId:s.campaign.origin.birthRegionId,
 description:'A real riverside gathering hall with open tables and a covered reading bench.',
 kind:'local collaborative research and study hall',sceneType:'settlement',
 culture:'Participants can watch voluntary field demonstrations without gaining automatic qualifications.'},
 scene:'Talia Meadow is working in Reedbank Learning Hall, demonstrating how to check ordinary research notebooks while teaching visitors to recognise mistaken measurements.',
 focus:'Independent teaching and ordinary public practice',
 weather:'Cool afternoon breeze',hour:10,minute:0});
const act=(operation,params={})=>R.act(s,{system:'social',operation,params});
const npc=act('introduceWitnessedPerson',{
 name:'Talia Meadow',profession:'Independent research notebook instructor',
 purpose:'Share reliable, voluntarily demonstrated research practices with people who choose to study.',
 personality:'Patient and independent, cautious about promises to learners.',
 background:'Talia travels between river communities checking recorded observations and may voluntarily demonstrate practical notebook methods.',
 witness:'Talia Meadow was observed demonstrating research notebook checks in the open learning hall.'});
const duty=act('authorWitnessedPersonDuty',{npcId:npc.npcId,
 id:'reedbank_teaching_methods',role:'Ordinary research methods instructor',
 method:'research',domain:'education',
 goal:'Teach and demonstrate ordinary research methods through careful notebook checks',
 witness:'Talia Meadow is working in Reedbank Learning Hall, demonstrating how to check ordinary research notebooks'});
A.equal(duty.available,true);
const group=act('formGroup',{name:'Reedbank Learning Circle',
 kind:'voluntary study circle',
 purpose:'Share ordinary publicly demonstrated research methods without compulsory instruction or formal academic accreditation.'});
const w=s.table.realm;
function step(n){n=n>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;return n>>>0||0x91e10da5;}
function successSeed(){
 for(let i=1;i<1000000;i++){
  const a=step(i),b=step(a),c=step(b);
  if(a/4294967296<.01&&c/4294967296>.96)return i;
 }
 throw Error('Could not find disposable independent teacher draw');
}
function agencySeed(){
 for(let i=1;i<100000;i++){const t={rngState:i};if(Agency.draw(t)<.015)return i;}
 throw Error('Could not find independent membership fixture');
}
const low=agencySeed();Agency.ensure(w).rngState=low;
A.equal(act('inviteGroupMember',{groupId:group.id,npcId:npc.npcId,
 proposal:'Will you freely take part in this ordinary study circle while remaining entitled to refuse work?'}).joined,true);
Agency.ensure(w).rngState=low;
const role=act('offerGroupResponsibility',{groupId:group.id,npcId:npc.npcId,
 title:'Voluntary practical method demonstrator',
 scope:'Willingly demonstrate and share ordinary notebook research methods at this hall without guaranteeing student results.',
 untilDay:4});
A.equal(role.agreed,true);
const teacher=w.emergentPeople.people[npc.npcId.slice('emergent:'.length)];
teacher.rngState=successSeed();
A.equal(People.verify(w,teacher),true);
const original=act('observeGroupRoleWork',{groupId:group.id,roleId:role.id,npcId:npc.npcId});
A.equal(original.roleWorkRecorded,true);
const source=G.lookup(w,group.id).roleWork[0];
A.equal(source.source.originalCareerReceipt.source.outcome.success,true);
const beforeTime=s.world.minutes,beforeCoin=s.player.coins,
 beforeWork=teacher.career.workCount,beforeRng=teacher.rngState;
A.throws(()=>act('studyWitnessedGroupMethod',{
 groupId:group.id,serviceId:'invented',skill:'research',focus:'repetition',minutes:30}),
 /recent genuinely successful|unused consented/);
A.throws(()=>act('studyWitnessedGroupMethod',{
 groupId:group.id,serviceId:source.id,skill:'arcana',focus:'repetition',minutes:30}),
 /recent genuinely successful|unused consented/);
A.equal(s.world.minutes,beforeTime);
const lesson=act('studyWitnessedGroupMethod',{
 groupId:group.id,serviceId:source.id,skill:'research',focus:'repetition',minutes:30});
A.equal(lesson.witnessedStudy,true);
A.equal(lesson.noExtraTeacherRollOrWage,true);
A.equal(lesson.practiceSessions,1);
A.equal(s.world.minutes,beforeTime+30);
A.equal(s.player.coins,beforeCoin);
A.equal(teacher.career.workCount,beforeWork);
A.equal(teacher.rngState,beforeRng);
A.equal(G.validate(G.lookup(w,group.id),w),true);
const study=G.lookup(w,group.id).roleWork[0].study;
A.equal(study.source.skill,'research');
A.equal(study.source.originalWorkHash,source.workReceiptHash);
A.equal(study.sourceHash,G.hash(study.source));
A.equal(G.roleWorkStatus(w,group.id).witnessedRoleWork[0].studiedMethod.skill,'research');
const afterTime=s.world.minutes,afterRng=s.rngState;
A.throws(()=>act('studyWitnessedGroupMethod',{
 groupId:group.id,serviceId:source.id,skill:'research',focus:'repetition',minutes:30}),
 /recent genuinely successful|unused consented/);
A.equal(s.world.minutes,afterTime);
A.equal(s.rngState,afterRng);
const reloaded=E.importGame(E.exportGame(s));
A.equal(G.validate(G.lookup(reloaded.table.realm,group.id),reloaded.table.realm),true);
A.equal(G.lookup(reloaded.table.realm,group.id).roleWork[0].study.sourceHash,study.sourceHash);
console.log('GM site original instructional work -> player source-backed practice passed');
