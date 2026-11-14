'use strict';
// #18 closure: audit the ACTUAL organisational and political source owners
// together in one disposable world. No extra political mechanics, story
// author, new ledger, universal constitution, money, or NPC decisions.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency'),
 Gov=require('../world/government-offices'),
 Realm=require('../world/simulation'),
 Atlas=require('../world/atlas');
const act=(s,op,params)=>R.act(s,{system:'social',operation:op,params});
const seedFor=pred=>{
 for(let n=1;n<100000;n++){
  const x={rngState:n};
  if(pred(Agency.draw(x)))return n;
 }
 throw Error('Could not find an original independent decision for disposable fixture');
};
const s=E.newGame({name:'Living Political Institutions Integration',seed:180025,
 background:'fieldworker',path:'undecided'});
const names={name:'Free Crossing Observation and Practical Care Circle',
 kind:'locally founded independent voluntary knowledge and assistance association',
 purpose:'Share personally verified crossing observations with neighbours, while recognising each member has independent work, rights and wishes'};
const formed=act(s,'formGroup',names);
A.equal(formed.formed,true);
const w=s.table.realm,e=G.lookup(w,formed.id),t=Agency.ensure(w);
A.equal(e.members,1);A.equal(e.funds,0);
const invite='Join our voluntary crossing observations if you wish. You may disagree, decline future responsibilities, keep your money, and leave independently.';
for(const npcId of ['elira','otto']){
 t.rngState=seedFor(x=>x<.001);
 const response=act(s,'inviteGroupMember',{
  groupId:e.id,npcId,proposal:invite});
 A.equal(response.decision,'accepted');
}
A.equal(e.members,3);
A.equal(G.validate(e),true);
const bank=s.player.coins,hostTreasury=w.countries.reedmarch.treasury;
const contributed=act(s,'groupContribute',{
 groupId:e.id,coins:5,
 activity:'Personally contribute genuine available savings and prepare truthful practical crossing notes for independent review.'});
A.equal(contributed.spentCoins,5);
A.equal(s.player.coins,bank-5);
A.equal(e.funds,5);
A.equal(w.countries.reedmarch.treasury,hostTreasury,
 'The real association wallet cannot become a country treasury');
A.equal(G.verifyTreasuryAudit(e),true);
const initialFunds=e.funds,day=w.lastTickDay;
t.rngState=seedFor(x=>x<.001);
const role=G.offerCoordination(w,{
 id:'crossing-voluntary-limited-coordinator-0001',
 groupId:e.id,memberActorId:'npc:elira',
 regionId:'morrowfen_basin',place:'crossing',
 startDay:day,untilDay:day+95,
 scope:'Invite optional practical crossing safety observations and field-note discussions only, without control of members, government, money, or any beast.',
 meetingWitness:'At the original local crossing, a genuinely consenting member independently considers the optional coordinating role, with full right to decline.'});
A.equal(role.agreed,true);
A.equal(G.coordinatorStatus(w,e.id,{day}).actorId,'npc:elira');
A.equal(G.coordinatorStatus(w,e.id,{day}).noGovernmentOffice,true);
A.equal(G.coordinatorStatus(w,e.id,{day}).noTreasuryPower,true);
A.equal(e.funds,initialFunds);
const priority='Consider an independently gathered crossing-safety record and modest care of real local routes without commanding unrelated residents or taking public office.';
t.rngState=seedFor(x=>x>.999);
const discussed=G.deliberateInternalPriority(w,{
 id:'crossing-real-freeform-disagreement-0001',
 groupId:e.id,memberActorId:'npc:otto',
 regionId:'morrowfen_basin',place:'crossing',day,
 proposal:priority,budgetRequested:2,
 meetingWitness:'The locally present member listens to the genuine freeform crossing proposal and decides personally, without a compulsory vote or a mandate over any other individual.'});
A.equal(discussed.outcome,'dissented');
A.equal(discussed.budgetActuallySpent,0);
A.equal(e.members,3);
A.equal(e.funds,initialFunds);
A.equal(G.internalPriorityStatus(w,e.id)[0].independentMemberResponse,'dissented');
const purpose=act(s,'restateGroupPurpose',{
 groupId:e.id,
 purpose:'Study gentle wetland refuge maintenance using original observations and members who freely choose to participate, not compulsory labour.',
 reason:'The founder changes this association focus after real crossing discussions and a growing interest in practical local care.'});
A.ok(purpose.revisionId);
t.rngState=seedFor(x=>x>.43&&x<.47);
const response=act(s,'discussGroupPurpose',{
 groupId:e.id,revisionId:purpose.revisionId,npcId:'elira',
 discussion:'The genuinely present member considers the changed founder purpose and makes an independent response; there is no automatic loyalty, membership loss, or public office.'});
A.equal(response.stance,'dissented');
A.equal(e.members,3);
A.equal(e.funds,initialFunds);
A.equal(G.validate(e),true);
const beforeCivic=Gov.report(w,'reedmarch'),civicRng=s.rngState;
A.equal(beforeCivic.office,'March Council Speaker');
A.equal(beforeCivic.governingBody,'March Council');
A.equal(Gov.royalID('reedmarch'),false);
const draws=[.99,.01];let called=0;
const civic=Gov.transition(w,'reedmarch',day,{
 random:()=>draws[called++],emit:()=>{}});
A.equal(called,2);
A.equal(civic.changed,true);
A.equal(Gov.verifyMandateAudit(w.governance.reedmarch,Gov.byId.reedmarch),true);
A.equal(Gov.report(w,'reedmarch').publicMandates,1);
A.notEqual(Gov.report(w,'reedmarch').officeholder,beforeCivic.officeholder);
A.equal(e.funds,initialFunds);
A.equal(e.members,3);
A.equal(w.countries.reedmarch.treasury,hostTreasury);
A.equal(s.player.coins,bank-5);
A.equal(s.rngState,civicRng);
A.equal(Gov.report(w,'reef_cantons').government,Atlas.P.reef_cantons.government,
 'An actual independent beast polity has its own constitution, not Reedmarch voluntary group procedure');
A.throws(()=>Gov.transition(w,'asterwyn',day,{random:()=>.9}),
 /hereditary sovereign may not be replaced/);
A.equal(Gov.verifyMandateAudit(w.governance.reedmarch,Gov.byId.reedmarch),true);
// The same actual world also has original interstate relations independent
// of this local association, with real clock, offices and public reporting.
const pair=Object.entries(w.diplomacy).find(([key,d])=>
 (Atlas.P[d.a].rival===d.b||Atlas.P[d.b].rival===d.a)&&
 d.status==='strained'&&d.cooldown===0);
A.ok(pair);
const [key,relation]=pair,originalWars=w.counters.wars;
relation.tension=100; // Disposable environmental pressure, not authored treaty.
W.advance(s,30);
A.equal(relation.status,'war');
A.equal(w.counters.wars,originalWars+1);
A.equal(Realm.verifyDiplomaticAudit(relation,key),true);
A.equal(Realm.verifyDiplomaticOfficeContexts(w,key),true);
const history=Realm.diplomaticTransitionHistory(w,key);
A.equal(history.transitions.length,1);
A.equal(history.transitions[0].from,'strained');
A.equal(history.transitions[0].to,'war');
A.equal(history.transitions[0].noInventedSignedTreaty,true);
A.equal(history.transitions[0].noNamedMinisterConsentInferred,true);
A.equal(G.validate(e),true,'Ordinary independent group life remains valid as sovereign diplomacy changes');
A.equal(G.verifyTreasuryAudit(e),true);
A.ok(e.funds<=initialFunds,
 'Only actual bounded group work/upkeep can debit original funds, not mint a diplomatic payment');
A.equal(s.player.coins,bank-5);
A.equal(Gov.verifyMandateAudit(w.governance.reedmarch,Gov.byId.reedmarch),true);
const publicCivic=R.act(s,{system:'world',operation:'governmentStatus',params:{}});
A.equal(publicCivic.officeholder,Gov.report(w,'reedmarch').officeholder);
const groupView=act(s,'groupsStatus',{});
A.equal(groupView.groups.find(x=>x.id===e.id).founder,s.player.name);
const money=act(s,'groupTreasuryStatus',{groupId:e.id});
A.equal(money.currentOperatingFunds,e.funds);
A.equal(money.noAutomaticMemberSpendingPermission,true);
const saved=E.exportGame(s),roundtrip=E.importGame(saved),copy=roundtrip.table.realm,
 restored=G.lookup(copy,e.id);
A.equal(E.exportGame(roundtrip),saved);
A.equal(G.validate(restored),true);
A.equal(Gov.verifyMandateAudit(copy.governance.reedmarch,Gov.byId.reedmarch),true);
A.deepEqual(Realm.diplomaticTransitionHistory(copy,key),history);
// Try to forge sovereign authority from a coordinator, a consenting member
// from dissent, a group payment, or a different diplomatic decision.
const originalRole=structuredClone(e.coordinationMandates[0]);
e.coordinationMandates[0].source.agreed=false;
A.equal(G.validate(e),false);
e.coordinationMandates[0]=originalRole;
A.equal(G.validate(e),true);
const originalPriority=structuredClone(e.internalPriorities[0]);
e.internalPriorities[0].source.supported=true;
A.equal(G.validate(e),false);
e.internalPriorities[0]=originalPriority;
A.equal(G.validate(e),true);
const publicMandate=w.governance.reedmarch.mandateHistory[0],
 originalNext=publicMandate.source.next;
publicMandate.source.next='Invented association sovereign';
A.equal(Gov.verifyMandateAudit(w.governance.reedmarch,Gov.byId.reedmarch),false);
publicMandate.source.next=originalNext;
A.equal(Gov.verifyMandateAudit(w.governance.reedmarch,Gov.byId.reedmarch),true);
const originalDiplomacyNoise=relation.diplomaticAudit.transitions[0].source.noise;
relation.diplomaticAudit.transitions[0].source.noise=99;
A.equal(Realm.verifyDiplomaticAudit(relation,key),false);
relation.diplomaticAudit.transitions[0].source.noise=originalDiplomacyNoise;
A.equal(Realm.verifyDiplomaticAudit(relation,key),true);
A.equal(G.validate(e),true);
console.log('Integrated #18: GM-authored open association, genuinely voluntary people, funds, dissent, bounded coordination, civic succession and interstate diplomacy retain distinct real source authorities across time and saves; no imposed power, consent or treaty');
