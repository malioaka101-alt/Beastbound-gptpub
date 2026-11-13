'use strict';
// Disposable verification: optional event review requires a real, locally
// present independent professional with originally earned domain work.
// The published local benchmark never becomes a universal judge/rank/prize.
const A=require('node:assert/strict'),
 E=require('../engine.js'),R=require('../rules'),Clock=require('../rules/world'),
 Realm=require('../world/simulation'),Emergent=require('../world/emergent-people'),
 Core=require('../rules/core');
const act=(s,op,params={})=>R.act(s,{system:'competition',operation:op,params});
const admission={
 openSelfEntry:true,
 procedure:'A willing individual can enter the local public demonstration with originally verified personally completed work.',
 acceptedSourceOwners:['physical-production'],
 windowMinutes:210,allowPriorWork:true,requireSuccess:false
};
const base=(id,domain)=>({
 eventId:id,title:'Local Open Work Demonstration',
 description:'Local practitioners display documented work under a distinctly local independent professional review tradition.',
 criteria:'A reviewer inspects the original result of actual personally completed work, including honest failed work.',
 eligibility:'Personally performed original work, with voluntary witnessed entry.',
 judging:'A qualified and willing local peer may verify only whether the original work actually completed, without making a global score.',
 appeals:'Dissenting practitioners can discuss and dispute an observed review, but no universal appeals court is established.',
 prizeTerms:'No owned prize fund, pay transfer or professional credential is created by this public invitation.',
 season:'Original work exhibition year',
 eventDay:2,startsAtMinuteOfDay:13*60,openAdmission:admission,
 workReview:{benchmark:'original-completed-work',professionalDomain:domain,
  procedure:'A locally present independent professional with real successfully completed work in this particular domain freely decides whether to verify the documented original outcome.'}
});
const money=s=>JSON.stringify({
 coins:s.player.coins,rankings:s.player.rankings,
 records:s.player.competitionRecord,qualification:s.player.qualifications,
 inventory:s.player.inventory,stamina:s.player.stamina,
 guild:s.player.reputation.guild});
function travel(s,to){
 if(s.world.location===to)return;
 const q=[[s.world.location]],seen=new Set([s.world.location]);
 let path=null;
 while(q.length&&!path){
  const x=q.shift(),id=x.at(-1);
  if(id===to){path=x;break;}
  for(const exit of E.LOCATIONS[id].exits)if(!seen.has(exit)){
   seen.add(exit);q.push([...x,exit]);
  }
 }
 A.ok(path,'a real route to the review location is necessary');
 for(const id of path.slice(1))A.equal(E.dispatch(s,'travel '+id).ok,true);
}
function findReviewer(){
 // Search independent *source-founded* worlds, not fabricated reviewers.
 // This fixture selects an actual currently-present worker with an original
 // successful occupation receipt and a shift spanning the event day.
 for(const seed of [912003,818010,902241,831009,791032]){
  const s=E.newGame({name:'Original Peer Source Test',seed,
   background:'fieldworker',path:'undecided'});
  const w=Realm.ensure(s);
  Clock.advance(s,240);
  const day=Math.floor(s.world.minutes/1440);
  const people=Object.values(w.emergentPeople.people||{});
  const valid=people.find(p=>
   p.status==='active'&&
   ['crossing','academy'].includes(p.shift?.location)&&
   p.shift.fromDay<=day+2&&p.shift.throughDay>=day+2&&
   p.career?.workReceipts?.some(r=>
    r.source?.outcome?.success===true&&
    /^[a-z][a-z-]{3,39}$/.test(r.source?.task?.domain||''))&&
   Emergent.verify(w,p));
  if(valid)return {s,p:valid};
 }
 throw Error('The source-backed test worlds had no actual present suitable reviewer');
}
const {s,p}=findReviewer(),domain=p.career.workReceipts.find(r=>
 r.source?.outcome?.success&&
 /^[a-z][a-z-]{3,39}$/.test(r.source?.task?.domain||'')).source.task.domain;
travel(s,p.shift.location);
const secondOriginStart=E.exportGame(s);
const event=base('original_peer_source_work_01',domain);
event.eventDay=E.day(s)+2;
A.equal(act(s,'announceLocal',event).hasOriginalWorkBenchmark,true);
A.equal(act(s,'expressInterest',{eventId:event.eventId}).interested,true);
const made=R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
A.equal(made.noExtraRoll,true);
const item=s.table.physicalProductionHistory.at(-1);
A.ok(item?.id);
act(s,'submitWork',{eventId:event.eventId,
 sourceOwner:'physical-production',sourceId:item.id});
const row=s.table.competitionNotices['public_competition_'+event.eventId];
const frozen=E.exportGame(s),rng=s.rngState;
A.throws(()=>act(s,'reviewWork',{eventId:event.eventId,actorId:'player',
 reviewerId:p.actorId}),/review window|admitted entrant/);
A.equal(E.exportGame(s),frozen);A.equal(s.rngState,rng);
const target=(event.eventDay-1)*1440+13*60;
A.ok(target>s.world.minutes);
const beforeClock=s.world.minutes;
E.advance(s,target-beforeClock);Clock.finalizeTime(s,beforeClock);
A.equal(act(s,'enter',{eventId:event.eventId,
 sourceOwner:'physical-production',sourceId:item.id}).registered,true);
const originalRng=s.rngState,originalAssets=money(s),
 originalMinute=s.world.minutes;
const result=act(s,'reviewWork',{eventId:event.eventId,
 actorId:'player',reviewerId:p.actorId});
A.equal(result.noSecondPerformanceRoll,true);
A.equal(result.noOfficialRankPrizeOrQualification,true);
A.equal(result.noPlayerRngUsed,true);
A.equal(s.rngState,originalRng);
A.equal(money(s),originalAssets);
A.equal(s.world.minutes,originalMinute+5);
const proof=row.reviews[0],choice=proof.source.independentDecision;
A.equal(Emergent.verifyPublicWorkReviewChoice(choice),true);
A.equal(result.voluntarilyReviewed,choice.willing);
A.equal(result.originalWorkBenchmarkMet,
 choice.willing?item.source.originalOutcome==='completed-product':null);
const status=act(s,'publicEvents',{eventId:event.eventId});
A.equal(status.events[0].independentlyReviewedWork.length,1);
A.equal(status.events[0].noCreditedRankOrRewards,true);
A.equal(status.seasonalWorkBoard.length,1);
A.equal(status.seasonalWorkBoard[0].standings.length,1);
A.equal(status.seasonalWorkBoard[0].standings[0].actorId,'player');
A.equal(status.seasonalWorkBoard[0].standings[0].verifiedAttempts,choice.willing?1:0);
A.equal(status.events[0].independentlyReviewedWork[0].objectiveBenchmarkMet,
 result.originalWorkBenchmarkMet);
const checkpoint=E.exportGame(s);
A.equal(act(E.importGame(checkpoint),'publicEvents',{eventId:event.eventId})
 .events[0].independentlyReviewedWork.length,1);
A.throws(()=>act(s,'reviewWork',{eventId:event.eventId,
 actorId:'player',reviewerId:p.actorId}),/already made/);
A.equal(E.exportGame(s),checkpoint);
const original=structuredClone(proof);
proof.source.benchmarkMet=!proof.source.benchmarkMet;
const damaged=E.exportGame(s);
A.throws(()=>act(s,'publicEvents',{eventId:event.eventId}),/source/);
A.equal(E.exportGame(s),damaged);
row.reviews[0]=original;
A.equal(E.exportGame(s),checkpoint);
for(let i=0;i<95;i++)Core.event(s,'world','Ordinary world life after review '+i,{i});
A.equal(act(E.importGame(E.exportGame(s)),'publicEvents',{eventId:event.eventId})
 .events[0].independentlyReviewedWork.length,1);
{
 // Reuse the very same authentic person-world starting point, not another
 // hardcoded reviewer or a preset roll. Unlike craft, this is an existing
 // original wild-habitat observation resolved by the original core check.
 const h=E.importGame(secondOriginStart);
 const event2=base('observed_habitat_source_02',domain);
 event2.title='Forest Signs of the Visiting Season';
 event2.description='A distinctly local gathering studies personally observed natural habitat traces, whether conclusions succeed or fail.';
 event2.criteria='An original natural observation can be verified against its source, rather than treated as a crafted item.';
 event2.judging='A willing local professional checks the real source-backed observation outcome without inventing an ecological specimen.';
 event2.season='Independent forest observations season';
 event2.eventDay=E.day(h)+2;
 event2.openAdmission={...admission,acceptedSourceOwners:['habitat-survey']};
 act(h,'announceLocal',event2);
 act(h,'expressInterest',{eventId:event2.eventId});
 const venue=h.world.location;
 travel(h,'forest');
 const scene=R.act(h,{system:'world',operation:'habitatSurvey',params:{}});
 const check=R.act(h,{system:'core',operation:'check',params:{checkId:scene.checkId}});
 A.ok(check.check);
 travel(h,venue);
 act(h,'submitWork',{eventId:event2.eventId,
  sourceOwner:'habitat-survey',sourceId:scene.checkId});
 const when=(event2.eventDay-1)*1440+13*60;
 A.ok(when>h.world.minutes);
 const prev=h.world.minutes;
 E.advance(h,when-prev);Clock.finalizeTime(h,prev);
 A.equal(act(h,'enter',{eventId:event2.eventId,
  sourceOwner:'habitat-survey',sourceId:scene.checkId}).registered,true);
 const purse=money(h),rng=h.rngState;
 const observed=act(h,'reviewWork',{eventId:event2.eventId,
  actorId:'player',reviewerId:p.actorId});
 A.equal(observed.noSecondPerformanceRoll,true);
 A.equal(money(h),purse);
 A.equal(h.rngState,rng);
 const board=act(h,'publicEvents',{eventId:event2.eventId});
 A.equal(board.events[0].independentlyReviewedWork.length,1);
 A.equal(board.events[0].noCreditedRankOrRewards,true);
 A.equal(board.seasonalWorkBoard[0].season,event2.season);
 A.equal(board.seasonalWorkBoard[0].standings.length,1);
 A.equal(board.seasonalWorkBoard[0].standings[0].verifiedAttempts,
  observed.voluntarilyReviewed?1:0);
 A.equal(act(E.importGame(E.exportGame(h)),'publicEvents',
  {eventId:event2.eventId}).events[0].independentlyReviewedWork.length,1);
}
{
 const v=E.newGame({name:'Unproven Judge',seed:818010,
  background:'fieldworker',path:'undecided'});
 const b=base('no_assumed_reviewer_01','unproven-specialist');
 const original=E.exportGame(v);
 A.throws(()=>act(v,'announceLocal',{...b,workReview:{
  ...b.workReview,benchmark:'invented-supernatural-total'}}),/event|future/);
 A.equal(E.exportGame(v),original);
}
console.log('Original event review: source-verifiable real professional, freely decided willingness, actual documented completion, preserved event/entry, no double roll, unearned rank, money, or institution');
